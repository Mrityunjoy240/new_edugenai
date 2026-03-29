import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function chatCompletion(messages: any[], model?: string, maxTokens?: number): Promise<string> {
  try {
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const systemMessage = messages.find(m => m.role === "system")?.content || ""
    const conversationMessages = messages.filter(m => m.role !== "system")

    const history = conversationMessages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }))

    const lastMessage = conversationMessages[conversationMessages.length - 1]?.content || ""

    const chat = geminiModel.startChat({
      history,
      systemInstruction: systemMessage ? {
        role: "system",
        parts: [{ text: systemMessage }]
      } : undefined,
    })

    const result = await chat.sendMessage(lastMessage)
    return result.response.text() || ""

  } catch (error: any) {
    console.error("[Gemini] Error:", error?.message)
    if (error?.message?.includes("quota") || error?.message?.includes("rate")) {
      await new Promise(r => setTimeout(r, 5000))
    }
    return "I am having trouble connecting right now. Please try again in a moment."
  }
}
