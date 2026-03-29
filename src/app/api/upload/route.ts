import { createClient } from "@/lib/supabase/server"
import { getEmbeddings } from "@/lib/embeddings"

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    try {
      const PDFParser = require('pdf2json')
      const pdfParser = new PDFParser()
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          const pages = pdfData?.Pages || []
          const text = pages.map((page: any) => {
            const texts = page?.Texts || []
            return texts.map((t: any) => {
              const runs = t?.R || []
              return runs.map((r: any) => {
                try { return decodeURIComponent(r?.T || '') } catch { return r?.T || '' }
              }).join('')
            }).join(' ')
          }).join('\n')
          
          console.log(`[PDF] Extracted ${text.length} chars, preview: ${text.substring(0, 150)}`)
          resolve(text.trim())
        } catch (e) {
          console.error('[PDF] Parse error:', e)
          resolve('')
        }
      })
      
      pdfParser.on('pdfParser_dataError', (err: any) => {
        console.error('[PDF] Error:', err)
        resolve('')
      })
      
      pdfParser.parseBuffer(buffer)
    } catch (e) {
      console.error('[PDF] Init error:', e)
      resolve('')
    }
  })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const userId = formData.get("userId") as string
    const courseId = formData.get("courseId") as string | null
    console.log("UPLOAD API - received courseId:", courseId)
    const title = formData.get("title") as string || file?.name || "Untitled"

    if (!file || !userId) {
      return Response.json(
        { error: "Missing file or user ID" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let textContent = ""
    const fileType = file.name.split(".").pop()?.toLowerCase()

    if (fileType === "txt") {
      textContent = buffer.toString("utf-8")
    } else if (fileType === "pdf") {
      textContent = await extractTextFromPDF(buffer)
    } else {
      return Response.json(
        { error: "Unsupported file type. Use PDF, TXT" },
        { status: 400 }
      )
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(`${userId}/${Date.now()}_${file.name}`, file)

    if (uploadError) {
      console.warn("Storage upload failed:", uploadError)
    }

    const filePath = uploadData?.path || null

    const isValidUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
    const validCourseId = courseId && isValidUUID(courseId) ? courseId : null
    console.log("UPLOAD API - validCourseId:", validCourseId)

    // 1. Create source record
    const { data: sourceRecord, error: sourceError } = await supabase
      .from("sources")
      .insert({
        user_id: userId,
        course_id: validCourseId,
        file_name: file.name,
        file_path: filePath,
        file_type: fileType,
        title: title,
        total_chunks: 0 // Will update later or just leave
      })
      .select()
      .single()

    if (sourceError) {
      console.error("Source record creation error:", sourceError)
      // Continue anyway, but source_id will be null
    }

    const sourceId = sourceRecord?.id || null

    if (textContent.length > 50000) {
      textContent = textContent.substring(0, 50000)
      console.log("[Upload] Text trimmed to 50000 chars to prevent memory overflow")
    }

    const chunks = splitIntoChunks(textContent, 1000)
    let embeddings: any[] = []
    try {
      embeddings = await Promise.all(
        chunks.map(chunk => getEmbeddings(chunk).catch((err) => {
          const msg = err.message?.toLowerCase() || ""
          if (msg.includes("memory") || msg.includes("allocate") || msg.includes("onnx")) {
            throw err 
          }
          return null
        }))
      )
    } catch (err: any) {
      const msg = err.message?.toLowerCase() || ""
      if (msg.includes("memory") || msg.includes("allocate") || msg.includes("onnx")) {
        console.error("[Upload API] Embedding failed due to memory/ONNX error:", err.message)
        embeddings = []
      } else {
        throw err
      }
    }
    
    console.log(`[Upload API] Generated ${embeddings.filter(e => e !== null).length} valid embeddings for ${chunks.length} chunks.`)

    const notesToInsert = chunks.map((chunk, index) => {
      const sanitizedContent = chunk.replace(/\u0000/g, '').replace(/\x00/g, '')
      return {
        user_id: userId,
        course_id: validCourseId,
        source_id: sourceId,
        chunk_index: index,
        title: `${title} (Part ${index + 1})`,
        content: sanitizedContent,
        subject: null,
        topic: null,
        embedding: embeddings[index],
        file_path: filePath,
      }
    })

    if (notesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("notes")
        .insert(notesToInsert)

      if (insertError) {
        console.error("Database insert error:", insertError)
        return Response.json(
          { error: `Failed to save notes: ${insertError.message}` },
          { status: 500 }
        )
      }

      // Update source with total chunks
      if (sourceId) {
        await supabase
          .from("sources")
          .update({ total_chunks: chunks.length })
          .eq("id", sourceId)
      }
    }

    return Response.json({
      success: true,
      message: `Uploaded and processed ${chunks.length} chunks`,
      chunksCount: chunks.length,
      filePath,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return Response.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = []
  const sentences = text.split(/(?<=[.!?])\s+/)
  let currentChunk = ""

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += " " + sentence
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}
