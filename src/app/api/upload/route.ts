import { createClient } from "@/lib/supabase/server"
import { getEmbeddings } from "@/lib/embeddings"

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer)
    const text = Buffer.from(uint8Array).toString('binary')
    const chunks: string[] = []
    const streamRegex = /stream([\s\S]*?)endstream/g
    let match
    while ((match = streamRegex.exec(text)) !== null) {
      const streamContent = match[1]
      const readable = streamContent
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (readable.length > 20) chunks.push(readable)
    }
    const result = chunks.join(' ').trim()
    console.log(`[PDF] Extracted ${result.length} characters`)
    return result
  } catch (error: any) {
    console.error("PDF extraction error:", error?.message)
    return ""
  }
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

    const notesToInsert = chunks.map((chunk, index) => ({
      user_id: userId,
      course_id: validCourseId,
      source_id: sourceId,
      chunk_index: index,
      title: `${title} (Part ${index + 1})`,
      content: chunk,
      subject: null,
      topic: null,
      embedding: embeddings[index],
      file_path: filePath,
    }))

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
