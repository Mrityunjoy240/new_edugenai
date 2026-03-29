const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

async function makeRequestWithTimeout(body: object, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function chatCompletion(messages: object[], model?: string, maxTokens?: number): Promise<string> {
  const selectedModel = model || process.env.GROQ_MODEL || "llama-3.1-8b-instant"
  const body = {
    model: selectedModel,
    max_tokens: maxTokens || 1000,
    messages,
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await makeRequestWithTimeout(body, 30000)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = JSON.stringify(errorData)
        
        if (errorMsg.includes("rate_limit")) {
          console.log(`[Groq] Rate limit hit, waiting 8s before retry ${attempt}/3`)
          await new Promise(r => setTimeout(r, 8000))
          continue
        }
        throw new Error(`Groq API error: ${errorMsg}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || ""
      
    } catch (error: any) {
      const isTimeout = error?.message?.includes("abort") || 
                        error?.code === "UND_ERR_CONNECT_TIMEOUT" ||
                        error?.message?.includes("timeout")
      
      if (isTimeout && attempt < 3) {
        console.log(`[Groq] Timeout on attempt ${attempt}, retrying in 3s...`)
        await new Promise(r => setTimeout(r, 3000))
        continue
      }
      
      if (attempt === 3) {
        return "I am having trouble connecting right now. Please try again in a moment."
      }
      throw error
    }
  }
  
  return "I am having trouble connecting right now. Please try again in a moment."
}
