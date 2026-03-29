import { createClient } from "@/lib/supabase/server"
import { chatCompletion, ChatMessage } from "@/lib/groq"
import { getEmbeddings } from "@/lib/embeddings"

export async function POST(request: Request) {
  try {
    const { type, userId, courseId } = await request.json()

    if (!type || !userId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    let userNotes: any[] = []
    
    if (courseId) {
      const { data: notes } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .limit(5)
      userNotes = notes || []
      console.log(`[AI-Tools] Notes found for courseId ${courseId}: ${userNotes.length}`)
    }

    if (userNotes.length === 0) {
      return Response.json({
        success: true,
        type,
        result: "No PDF content found for this notebook. Please upload a PDF first, then use this tool to generate content from your document.",
        sourcesCount: 0
      })
    }

    const content = userNotes
      .map(n => n.content || "")
      .join("\n\n")
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')  // strip non-ASCII
      .replace(/\s{3,}/g, '\n')              // collapse whitespace
      .replace(/(.)\1{5,}/g, '$1')           // remove aaaaa... repetitions
      .split('\n')
      .filter(line => {
        const trimmed = line.trim()
        if (trimmed.length < 10) return false  // skip very short lines
        const nonAsciiRatio = (trimmed.match(/[^\x20-\x7E]/g) || []).length / trimmed.length
        return nonAsciiRatio < 0.3  // skip lines that are mostly garbage
      })
      .join('\n')
      .substring(0, 6000)

    console.log(`[AI-Tools] Clean content length: ${content.length} chars`)
    console.log(`[AI-Tools] Content preview: ${content.substring(0, 200)}`)

    let systemPrompt = ""

    switch (type) {
      case "quiz":
        systemPrompt = `You are an expert quiz generator. Generate 5 multiple choice questions from the provided content. Each question should have 4 options (A, B, C, D) and indicate the correct answer. Format the output as JSON array.`
        break
      case "flashcards":
        systemPrompt = `You are an expert at creating flashcards. Generate 10 question-answer pairs from the content. Format as JSON array with "question" and "answer" fields.`
        break
      case "notes":
        systemPrompt = "Generate study notes in plain text only. Use exactly this format. Put a blank line between every section. Never use asterisks, hashtags, bullet symbols, or bold markdown. Maximum 250 words.\n\nTopic: [topic name here]\n\nDefinition:\n[Write 2 to 3 clear sentences defining the topic]\n\nKey Points:\n1. [First key point as a complete sentence]\n2. [Second key point as a complete sentence]\n3. [Third key point as a complete sentence]\n4. [Fourth key point as a complete sentence]\n\nSummary:\n[Write 2 to 3 sentences summarizing the most important takeaway]"
        break
      case "assignment":
        systemPrompt = `You are an expert assignment generator. Generate 3-5 descriptive assignment questions from the content. Include a mix of short answer and long answer questions.`
        break
      case "topics":
        systemPrompt = `You are an expert at extracting key topics. List the main topics and subtopics from the content. Return as JSON array with "topic" and "subtopics" fields.`
        break
      default:
        return Response.json({ error: "Invalid tool type" }, { status: 400 })
    }

    const cleanContent = content.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}/g, '').replace(/•/g, '').trim()

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Content:\n${cleanContent}` }
    ]

    const result = await chatCompletion(messages)

    return Response.json({
      success: true,
      type,
      result,
      sourcesCount: userNotes.length
    })
  } catch (error: any) {
    console.error("AI tools error:", error)
    return Response.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    )
  }
}
