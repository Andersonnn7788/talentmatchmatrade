import { NextResponse } from 'next/server'

import { runJobMatchAgent } from '@/lib/agents/jobMatchAgent'
import { createClient } from '@/lib/supabase/server'

type AgentRequestPayload = {
  limit?: number
}

async function resolveCandidateId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, candidateId: null }
  }

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return { supabase, candidateId: profile?.id ?? null }
}

function getLimitFromPayload(payload: AgentRequestPayload): number {
  const num = Number(payload?.limit)
  if (!Number.isFinite(num) || num <= 0) return 5
  return Math.min(Math.floor(num), 8)
}

export async function POST(request: Request) {
  const { supabase, candidateId } = await resolveCandidateId()

  if (!candidateId) {
    return NextResponse.json({ matches: [] }, { status: 200 })
  }

  const payload = (await request.json().catch(() => ({}))) as AgentRequestPayload
  const limit = getLimitFromPayload(payload)

  try {
    const matches = await runJobMatchAgent({
      supabase,
      candidateId,
      limit,
    })

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Job match agent failed', error)
    return NextResponse.json({ error: 'Unable to generate matches. Please try again.' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { supabase, candidateId } = await resolveCandidateId()

  if (!candidateId) {
    return NextResponse.json({ matches: [] }, { status: 200 })
  }

  const url = new URL(request.url)
  const limitParam = url.searchParams.get('limit')
  const limit = getLimitFromPayload({ limit: limitParam ? Number(limitParam) : undefined })

  try {
    const matches = await runJobMatchAgent({
      supabase,
      candidateId,
      limit,
    })

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Job match agent failed', error)
    return NextResponse.json({ error: 'Unable to generate matches. Please try again.' }, { status: 500 })
  }
}




