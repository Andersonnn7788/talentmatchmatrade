type OpenAIModel = {
  invoke: (prompt: string) => Promise<string>
}

const MODEL_NAME = process.env.OPENAI_JOB_MODEL || 'gpt-4o-mini'

let cachedModel: OpenAIModel | null = null

export function getOpenAIMiniModel(): OpenAIModel {
  if (cachedModel) return cachedModel

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable for GPT-4o-mini access.')
  }

  cachedModel = {
    async invoke(prompt: string) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 900,
        }),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`OpenAI API error (${response.status}): ${text}`)
      }

      const json = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }

      const content = json.choices?.[0]?.message?.content ?? ''
      return content
    },
  }

  return cachedModel
}

export type OpenAIJobModel = ReturnType<typeof getOpenAIMiniModel>
