import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { getGeminiFlashModel } from '@/lib/ai/geminiClient'
import type { SupabaseClient } from '@supabase/supabase-js'

// Interview state annotation
const InterviewAnnotation = Annotation.Root({
  candidateId: Annotation<string>(),
  interviewType: Annotation<string>(),
  candidateContext: Annotation<string>(),
  messages: Annotation<Array<{ speaker: string; content: string; timestamp: string }>>(),
  currentQuestionIndex: Annotation<number>(),
  questions: Annotation<string[]>(),
  interviewId: Annotation<string>(),
  error: Annotation<string | null>(),
})

const MAX_QUESTIONS = 3
const MAX_DURATION_SECONDS = 60
const FALLBACK_QUESTIONS: Record<string, string[]> = {
  technical: [
    'Tell me about a challenging technical problem you solved recently.',
    'How do you approach learning new technologies or frameworks?',
    'Describe your experience with the technologies listed in your profile.',
  ],
  behavioral: [
    'Tell me about a time you faced a significant challenge and how you overcame it.',
    'How do you handle feedback and criticism?',
    'Describe a situation where you had to work in a team to achieve a goal.',
  ],
  general: [
    'What are your career goals for the next 2-3 years?',
    'Why are you interested in this type of role?',
    'What unique value do you bring to a team?',
  ],
}

interface RunInterviewAgentOptions {
  supabase: SupabaseClient
  candidateId: string
  interviewType: 'technical' | 'behavioral' | 'general'
}

export async function runInterviewAgent({
  supabase,
  candidateId,
  interviewType,
}: RunInterviewAgentOptions) {
  const model = getGeminiFlashModel()

  const graph = new StateGraph(InterviewAnnotation)
    .addNode('loadContext', createLoadContextNode(supabase))
    .addNode('generateQuestions', createGenerateQuestionsNode(model))
    .addNode('saveInterview', createSaveInterviewNode(supabase))
    .addEdge(START, 'loadContext')
    .addEdge('loadContext', 'generateQuestions')
    .addEdge('generateQuestions', 'saveInterview')
    .addEdge('saveInterview', END)
    .compile()

  try {
    const result = await graph.invoke({
      candidateId,
      interviewType,
      messages: [],
      currentQuestionIndex: 0,
      questions: [],
      candidateContext: '',
      interviewId: '',
      error: null,
    })

    return {
      success: true,
      interviewId: result.interviewId,
      questions:
        Array.isArray(result.questions) && result.questions.length > 0
          ? result.questions
          : FALLBACK_QUESTIONS[interviewType],
    }
  } catch (error) {
    console.error('Interview agent failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Load candidate context for RAG
function createLoadContextNode(supabase: SupabaseClient) {
  return async (state: typeof InterviewAnnotation.State) => {
    const { candidateId } = state

    // Fetch profile
    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', candidateId)
      .single()

    // Fetch education
    const { data: education } = await supabase
      .from('education')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('start_date', { ascending: false })

    // Fetch experience
    const { data: experience } = await supabase
      .from('experience')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('start_date', { ascending: false })

    // Fetch skills
    const { data: skills } = await supabase
      .from('candidate_skills')
      .select('*')
      .eq('candidate_id', candidateId)

    // Fetch achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('candidate_id', candidateId)

    // Fetch badges
    const { data: badges } = await supabase
      .from('digital_badges')
      .select('*')
      .eq('candidate_id', candidateId)

    // Build context bundle
    const contextParts: string[] = []

    if (profile) {
      contextParts.push(`Name: ${profile.first_name} ${profile.last_name}`)
      if (profile.summary) contextParts.push(`Summary: ${profile.summary}`)
      if (profile.location) contextParts.push(`Location: ${profile.location}`)
      if (profile.job_preferences) {
        const prefs = profile.job_preferences as any
        contextParts.push(`Job Preferences: ${JSON.stringify(prefs)}`)
      }
    }

    if (education && education.length > 0) {
      contextParts.push('\nEducation:')
      education.forEach((edu: any) => {
        contextParts.push(`- ${edu.degree} in ${edu.field_of_study} from ${edu.institution}`)
      })
    }

    if (experience && experience.length > 0) {
      contextParts.push('\nExperience:')
      experience.forEach((exp: any) => {
        contextParts.push(`- ${exp.job_title} at ${exp.company_name}: ${exp.description || 'N/A'}`)
      })
    }

    if (skills && skills.length > 0) {
      contextParts.push('\nSkills:')
      const skillNames = skills.map((s: any) => s.skill_name).join(', ')
      contextParts.push(skillNames)
    }

    if (achievements && achievements.length > 0) {
      contextParts.push('\nAchievements:')
      achievements.forEach((ach: any) => {
        contextParts.push(`- ${ach.title}: ${ach.description || 'N/A'}`)
      })
    }

    if (badges && badges.length > 0) {
      contextParts.push('\nBadges:')
      badges.forEach((badge: any) => {
        contextParts.push(`- ${badge.badge_type} for ${badge.event_name}`)
      })
    }

    return {
      candidateContext: contextParts.join('\n'),
    }
  }
}

// Generate 3 tailored interview questions
function createGenerateQuestionsNode(model: ReturnType<typeof getGeminiFlashModel>) {
  return async (state: typeof InterviewAnnotation.State) => {
    const { candidateContext, interviewType } = state

    const prompt = `You are an expert interviewer conducting a ${interviewType} interview.

Based on the candidate's profile below, generate EXACTLY 3 interview questions that are:
1. Tailored to their background and experience
2. Appropriate for a ${interviewType} interview
3. Can be answered in 15-20 seconds each (max 1 minute total)
4. Industry-specific and scenario-based

Candidate Profile:
${candidateContext}

Return your response as a JSON array of exactly 3 questions:
["Question 1", "Question 2", "Question 3"]

Keep questions concise and focused. Each question should be answerable in 15-20 seconds.`

    try {
      const response = await model.invoke(prompt)
      const content =
        typeof response?.content === 'string'
          ? response.content
          : response?.content
            ? JSON.stringify(response.content)
            : ''
      
      // Extract JSON array from response
      const jsonMatch = content ? content.match(/\[[\s\S]*?\]/) : null
      if (!jsonMatch) {
        throw new Error('Could not parse questions from AI response')
      }

      const questions = JSON.parse(jsonMatch[0])
      
      if (!Array.isArray(questions) || questions.length !== MAX_QUESTIONS) {
        throw new Error('AI did not return exactly 3 questions')
      }

      return {
        questions,
      }
    } catch (error) {
      console.error('Failed to generate questions:', error)
      return {
        questions: FALLBACK_QUESTIONS[interviewType] || FALLBACK_QUESTIONS.general,
      }
    }
  }
}

// Save interview to database (initial state with questions only)
function createSaveInterviewNode(supabase: SupabaseClient) {
  return async (state: typeof InterviewAnnotation.State) => {
    const { candidateId, interviewType, questions } = state
    const questionList =
      Array.isArray(questions) && questions.length > 0
        ? questions
        : FALLBACK_QUESTIONS[interviewType] || FALLBACK_QUESTIONS.general

    // Create interview record
    const { data, error } = await supabase
      .from('ai_interviews')
      .insert({
        candidate_id: candidateId,
        interview_type: interviewType,
        transcript: [],
        duration_seconds: 0,
        interview_date: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('Failed to save interview:', error)
      return {
        error: 'Failed to create interview record',
        interviewId: '',
      }
    }

    // Create interview state for tracking
    let stateError: string | null = null
    try {
      await supabase.from('interview_state').insert({
        interview_id: data.id,
        current_question_index: 0,
        total_questions: questionList.length,
        is_active: true,
      })
    } catch (err) {
      console.warn('Failed to create interview state:', err)
      stateError = 'Failed to create interview state'
    }

    return {
      interviewId: data.id,
      error: stateError,
    }
  }
}

// Function to process candidate response and save to conversation storage
export async function processInterviewResponse({
  supabase,
  interviewId,
  questionIndex,
  question,
  candidateResponse,
}: {
  supabase: SupabaseClient
  interviewId: string
  questionIndex: number
  question: string
  candidateResponse: string
}) {
  try {
    // Use the new granular storage approach
    // Add interviewer question message
    await supabase.rpc('add_interview_message', {
      interview_uuid: interviewId,
      speaker_value: 'interviewer',
      content_value: question,
    })

    // Add candidate response message
    await supabase.rpc('add_interview_message', {
      interview_uuid: interviewId,
      speaker_value: 'candidate',
      content_value: candidateResponse,
    })

    // Update interview state progress
    await supabase
      .from('interview_state')
      .update({
        current_question_index: questionIndex + 1,
        last_activity_at: new Date().toISOString(),
      })
      .eq('interview_id', interviewId)

    return { success: true }
  } catch (error) {
    console.error('Failed to process interview response:', error)
    
    // Fallback to legacy transcript storage
    const { data: interview } = await supabase
      .from('ai_interviews')
      .select('transcript')
      .eq('id', interviewId)
      .single()

    const transcript = (interview?.transcript as any[]) || []
    const now = new Date().toISOString()
    
    transcript.push(
      { speaker: 'interviewer', content: question, timestamp: now },
      { speaker: 'candidate', content: candidateResponse, timestamp: now }
    )

    await supabase
      .from('ai_interviews')
      .update({ transcript })
      .eq('id', interviewId)

    return { success: true }
  }
}

// Function to finalize interview and generate summary
export async function finalizeInterview({
  supabase,
  interviewId,
  durationSeconds,
}: {
  supabase: SupabaseClient
  interviewId: string
  durationSeconds: number
}) {
  const model = getGeminiFlashModel()

  // Fetch interview messages from new storage
  const { data: messages } = await supabase
    .from('interview_messages')
    .select('speaker, content, timestamp')
    .eq('interview_id', interviewId)
    .order('message_order', { ascending: true })

  // Fallback to transcript field if messages table is empty
  let transcript: Array<{ speaker: string; content: string }> = []
  
  if (messages && messages.length > 0) {
    transcript = messages
  } else {
    // Try to get from legacy transcript field
    const { data: interview } = await supabase
      .from('ai_interviews')
      .select('transcript')
      .eq('id', interviewId)
      .single()
    
    transcript = (interview?.transcript as any[]) || []
  }

  if (transcript.length === 0) {
    throw new Error('No interview data found')
  }

  // Get interview type
  const { data: interviewData } = await supabase
    .from('ai_interviews')
    .select('interview_type')
    .eq('id', interviewId)
    .single()

  // Generate AI summary
  const transcriptText = transcript
    .map((msg) => `${msg.speaker}: ${msg.content}`)
    .join('\n')

  const summaryPrompt = `Analyze this ${interviewData?.interview_type || 'general'} interview transcript and provide:
1. A 2-3 sentence summary of the candidate's performance
2. Key strengths (3-4 items)
3. A recommendation: "Strong candidate for senior/lead positions" or "Good candidate for mid-level roles" or "Needs more experience"

Transcript:
${transcriptText}

Return a JSON object with this structure:
{
  "summary": "2-3 sentence summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "recommendation": "recommendation text"
}`

  try {
    const response = await model.invoke(summaryPrompt)
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)
    
    const jsonMatch = content.match(/\{[\s\S]*?\}/)
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : null

    // Use finalize_interview function to update everything atomically
    await supabase.rpc('finalize_interview', {
      interview_uuid: interviewId,
      duration: durationSeconds,
      summary: insights?.summary || 'Interview completed successfully.',
      insights: insights || {},
    })

    return {
      success: true,
      insights,
    }
  } catch (error) {
    console.error('Failed to generate summary:', error)
    
    // Fallback: update directly
    await supabase
      .from('ai_interviews')
      .update({
        duration_seconds: durationSeconds,
        ai_summary: 'Interview completed successfully.',
      })
      .eq('id', interviewId)

    // Mark interview as inactive
    await supabase
      .from('interview_state')
      .update({ is_active: false })
      .eq('interview_id', interviewId)

    return {
      success: true,
      insights: null,
    }
  }
}

