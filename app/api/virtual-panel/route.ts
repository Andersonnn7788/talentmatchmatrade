import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runPanelAgent } from '@/lib/agents/panelAgent'
import { createAdminClient } from '@/lib/supabase/admin'

// Run Virtual Hiring Panel evaluation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    let adminSupabase
    try {
      adminSupabase = createAdminClient()
    } catch (err) {
      console.warn('Virtual panel admin client missing service role, falling back to user client.')
      adminSupabase = null
    }
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
    const { interviewId } = body

    if (!interviewId) {
      return NextResponse.json({ error: 'interviewId is required' }, { status: 400 })
    }

    // Verify the interview belongs to the candidate before running panel evaluation
    const { data: interviewRecord, error: interviewErr } = await supabase
      .from('ai_interviews')
      .select('id')
      .eq('id', interviewId)
      .eq('candidate_id', profile.id)
      .single()

    if (interviewErr || !interviewRecord) {
      return NextResponse.json({ error: 'Interview not found for candidate' }, { status: 404 })
    }

    // Run panel agent
    const result = await runPanelAgent({
      supabase,
      adminSupabase,
      candidateId: profile.id,
      interviewId,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to run panel evaluation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reviewId: result.reviewId,
      overallScore: result.overallScore,
      overallVerdict: result.overallVerdict,
    })
  } catch (error) {
    console.error('Virtual panel API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get panel reviews for current user
export async function GET(request: NextRequest) {
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
      return NextResponse.json({ reviews: [] }, { status: 200 })
    }

    // Fetch panel reviews
    const { data: reviews } = await supabase
      .from('panel_reviews')
      .select('*')
      .eq('candidate_id', profile.id)
      .order('reviewed_at', { ascending: false })

    return NextResponse.json({ reviews: reviews || [] })
  } catch (error) {
    console.error('Get panel reviews API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



