export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function chatCompletion(messages: ChatMessage[], model?: string, maxTokens?: number): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          max_tokens: maxTokens || 1000,
          messages,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = JSON.stringify(errorData)
        if (errorMsg.includes("rate") && attempt < 3) {
          console.log(`[Groq] Rate limit, waiting 5s... attempt ${attempt}/3`)
          await new Promise(r => setTimeout(r, 5000))
          continue
        }
        throw new Error(`Groq error: ${errorMsg}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || ""

    } catch (error: any) {
      console.error(`[Groq] Error attempt ${attempt}:`, error?.message)
      if (attempt === 3) {
        return "I am having trouble connecting right now. Please try again in a moment."
      }
      await new Promise(r => setTimeout(r, 3000))
    }
  }
  return "I am having trouble connecting right now. Please try again in a moment."
}
