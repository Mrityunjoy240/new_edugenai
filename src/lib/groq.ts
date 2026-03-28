export const GROQ_API_URL = 'https://api.groq.com/openai/v1'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatCompletion(
  messages: ChatMessage[],
  model: string = 'llama-3.1-8b-instant'
): Promise<string> {
  const makeRequest = async () => {
    const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq API error: ${error}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  try {
    return await makeRequest()
  } catch (error: any) {
    const errorStr = String(error).toLowerCase()
    if (errorStr.includes('timeout') || errorStr.includes('rate_limit') || errorStr.includes('429')) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      try {
        return await makeRequest()
      } catch (retryError) {
        return "I am having trouble connecting right now. Please try again in a moment."
      }
    }
    throw error
  }
}
