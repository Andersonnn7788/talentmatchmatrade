// Lightweight OpenAI chat wrapper to keep the same interface (.invoke) used by the agents.
// Defaults to gpt-4o-mini per request.
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

type ChatInvoker = {
  invoke: (prompt: string) => Promise<{ content: string }>
}

let cachedModel: ChatInvoker | null = null

export function getGeminiFlashModel(): ChatInvoker {
  if (cachedModel) return cachedModel

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable for OpenAI access.')
  }

  cachedModel = {
    invoke: async (prompt: string) => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.35,
          max_tokens: 800,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`OpenAI error ${response.status}: ${errText.slice(0, 200)}`)
      }

      const json = await response.json()
      const content = json?.choices?.[0]?.message?.content ?? ''
      return { content }
    },
  }

  return cachedModel
}

export type GeminiMatchModel = ReturnType<typeof getGeminiFlashModel>
