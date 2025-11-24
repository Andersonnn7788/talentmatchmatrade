import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  runInterviewAgent,
  processInterviewResponse,
  finalizeInterview,
} from '@/lib/agents/interviewAgent'

// Start a new interview
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get candidate profile
    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { interviewType } = body

    if (!['technical', 'behavioral', 'general'].includes(interviewType)) {
      return NextResponse.json({ error: 'Invalid interview type' }, { status: 400 })
    }

    // Run interview agent to generate questions
    const result = await runInterviewAgent({
      supabase,
      candidateId: profile.id,
      interviewType,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to start interview' },
        { status: 500 }
      )
    }

    const safeQuestions =
      Array.isArray(result.questions) && result.questions.length > 0
        ? result.questions
        : ['Question 1', 'Question 2', 'Question 3']

    return NextResponse.json({
      success: true,
      interviewId: result.interviewId,
      questions: safeQuestions,
    })
  } catch (error) {
    console.error('Interview API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Submit answer to a question
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { interviewId, questionIndex, question, candidateResponse } = body

    if (!interviewId || questionIndex === undefined || !question || !candidateResponse) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Process the response
    await processInterviewResponse({
      supabase,
      interviewId,
      questionIndex,
      question,
      candidateResponse,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Interview response API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Finalize interview and generate summary
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { interviewId, durationSeconds } = body

    if (!interviewId || !durationSeconds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Finalize interview
    const result = await finalizeInterview({
      supabase,
      interviewId,
      durationSeconds,
    })

    return NextResponse.json({
      success: result.success,
      insights: result.insights,
    })
  } catch (error) {
    console.error('Interview finalization API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


