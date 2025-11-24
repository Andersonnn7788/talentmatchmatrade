import { NextResponse } from 'next/server'

const DEFAULT_MODEL = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2'
const DEFAULT_VOICE = process.env.ELEVENLABS_VOICE_ID

export async function POST(request: Request) {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'Missing ElevenLabs API key' }, { status: 500 })
    }

    const { text, voiceId } = await request.json()
    const trimmedText = typeof text === 'string' ? text.trim() : ''

    if (!trimmedText) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const voice = voiceId || DEFAULT_VOICE
    if (!voice) {
      return NextResponse.json({ error: 'No voice configured' }, { status: 500 })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: trimmedText,
        model_id: DEFAULT_MODEL,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs error:', response.status, errorText)
      return NextResponse.json(
        { error: 'ElevenLabs request failed', details: errorText.slice(0, 200) },
        { status: 500 }
      )
    }

    const buffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(buffer).toString('base64')

    return NextResponse.json({ audio: base64Audio })
  } catch (error) {
    console.error('TTS route error', error)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
