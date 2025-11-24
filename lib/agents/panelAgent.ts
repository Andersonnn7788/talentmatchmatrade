import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { getGeminiFlashModel } from '@/lib/ai/geminiClient'
import type { SupabaseClient } from '@supabase/supabase-js'

// Panel evaluation state
const PanelAnnotation = Annotation.Root({
  candidateId: Annotation<string>(),
  interviewId: Annotation<string>(),
  candidateContext: Annotation<string>(),
  interviewTranscript: Annotation<string>(),
  hrEvaluation: Annotation<AgentEvaluation | null>(),
  techEvaluation: Annotation<AgentEvaluation | null>(),
  coachEvaluation: Annotation<AgentEvaluation | null>(),
  overallScore: Annotation<number>(),
  overallVerdict: Annotation<string>(),
  reviewId: Annotation<string>(),
  error: Annotation<string | null>(),
})

interface AgentEvaluation {
  score: number
  verdict: string
  justification: string
  pros: string[]
  cons: string[]
}

interface RunPanelAgentOptions {
  supabase: SupabaseClient
  adminSupabase?: SupabaseClient | null
  candidateId: string
  interviewId: string
}

export async function runPanelAgent({
  supabase,
  adminSupabase,
  candidateId,
  interviewId,
}: RunPanelAgentOptions) {
  const model = getGeminiFlashModel()

  const graph = new StateGraph(PanelAnnotation)
    .addNode('loadContext', createLoadContextNode(supabase))
    .addNode('evaluateParallel', createParallelEvaluationNode(model))
    .addNode('aggregateResults', createAggregateNode())
    .addNode('saveReview', createSaveReviewNode(adminSupabase ?? supabase))
    .addEdge(START, 'loadContext')
    .addEdge('loadContext', 'evaluateParallel')
    .addEdge('evaluateParallel', 'aggregateResults')
    .addEdge('aggregateResults', 'saveReview')
    .addEdge('saveReview', END)
    .compile()

  try {
    const result = await graph.invoke({
      candidateId,
      interviewId,
      candidateContext: '',
      interviewTranscript: '',
      hrEvaluation: null,
      techEvaluation: null,
      coachEvaluation: null,
      overallScore: 0,
      overallVerdict: '',
      reviewId: '',
      error: null,
    })

    return {
      success: true,
      reviewId: result.reviewId,
      overallScore: result.overallScore,
      overallVerdict: result.overallVerdict,
    }
  } catch (error) {
    console.error('Panel agent failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Load candidate context and interview transcript
function createLoadContextNode(supabase: SupabaseClient) {
  return async (state: typeof PanelAnnotation.State) => {
    const { candidateId, interviewId } = state

    if (!interviewId) {
      throw new Error('Interview ID is required for panel evaluation')
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', candidateId)
      .single()

    if (!profile) {
      throw new Error('Candidate profile not found')
    }

    // Fetch education
    const { data: education } = await supabase
      .from('education')
      .select('*')
      .eq('candidate_id', candidateId)

    // Fetch experience
    const { data: experience } = await supabase
      .from('experience')
      .select('*')
      .eq('candidate_id', candidateId)

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

    // Fetch interview and ensure it belongs to candidate
    const { data: interviewRecord, error: interviewError } = await supabase
      .from('ai_interviews')
      .select('id, transcript, ai_summary')
      .eq('id', interviewId)
      .eq('candidate_id', candidateId)
      .single()

    if (interviewError || !interviewRecord) {
      throw new Error('Interview not found for candidate')
    }

    // Build context
    const contextParts: string[] = []

    if (profile) {
      contextParts.push(`Name: ${profile.first_name} ${profile.last_name}`)
      if (profile.summary) contextParts.push(`\nSummary: ${profile.summary}`)
    }

    if (education && education.length > 0) {
      contextParts.push('\n\nEducation:')
      education.forEach((edu: any) => {
        contextParts.push(`- ${edu.degree} in ${edu.field_of_study} from ${edu.institution} (${edu.start_date} - ${edu.end_date || 'Present'})`)
      })
    }

    if (experience && experience.length > 0) {
      contextParts.push('\n\nExperience:')
      experience.forEach((exp: any) => {
        contextParts.push(`- ${exp.job_title} at ${exp.company_name} (${exp.start_date} - ${exp.end_date || 'Present'})`)
        if (exp.description) contextParts.push(`  ${exp.description}`)
      })
    }

    if (skills && skills.length > 0) {
      contextParts.push('\n\nSkills:')
      const skillList = skills.map((s: any) => {
        let skillStr = s.skill_name
        if (s.proficiency_level) skillStr += ` (${s.proficiency_level})`
        if (s.years_experience) skillStr += ` - ${s.years_experience} years`
        return skillStr
      })
      contextParts.push(skillList.join(', '))
    }

    if (achievements && achievements.length > 0) {
      contextParts.push('\n\nAchievements:')
      achievements.forEach((ach: any) => {
        contextParts.push(`- ${ach.title}${ach.description ? ': ' + ach.description : ''}`)
      })
    }

    const candidateContext = contextParts.join('\n')

    // Fetch interview transcript if available
    let interviewTranscript = ''
    if (interviewId) {
      // Try to get from new granular storage first
      const { data: messages } = await supabase
        .from('interview_messages')
        .select('speaker, content')
        .eq('interview_id', interviewId)
        .order('message_order', { ascending: true })

      // Use messages if available, otherwise fall back to transcript JSONB
      if (messages && messages.length > 0) {
        interviewTranscript = messages
          .map((msg) => `${msg.speaker}: ${msg.content}`)
          .join('\n\n')
      } else if (interviewRecord && interviewRecord.transcript) {
        const transcriptMessages = interviewRecord.transcript as Array<{ speaker: string; content: string }>
        interviewTranscript = transcriptMessages
          .map((msg) => `${msg.speaker}: ${msg.content}`)
          .join('\n\n')
      }
      
      if (interviewRecord?.ai_summary) {
        interviewTranscript += `\n\nInterview Summary: ${interviewRecord.ai_summary}`
      }

      if (!interviewTranscript.trim()) {
        throw new Error('No transcript found for interview')
      }
    }

    return {
      candidateContext,
      interviewTranscript,
    }
  }
}

// Run three agent evaluations in parallel
function createParallelEvaluationNode(model: ReturnType<typeof getGeminiFlashModel>) {
  return async (state: typeof PanelAnnotation.State) => {
    const { candidateContext, interviewTranscript } = state

    // Run all three evaluations in parallel
    const [hrEvaluation, techEvaluation, coachEvaluation] = await Promise.all([
      evaluateAsHR(model, candidateContext, interviewTranscript),
      evaluateAsTechLead(model, candidateContext, interviewTranscript),
      evaluateAsCareerCoach(model, candidateContext, interviewTranscript),
    ])

    return {
      hrEvaluation,
      techEvaluation,
      coachEvaluation,
    }
  }
}

// HR Agent evaluation
async function evaluateAsHR(
  model: ReturnType<typeof getGeminiFlashModel>,
  context: string,
  transcript: string
): Promise<AgentEvaluation> {
  const prompt = `You are an HR Specialist evaluating a candidate for potential hiring.

Candidate Profile:
${context}

${transcript ? `Interview Transcript:\n${transcript}\n\n` : ''}

Evaluate the candidate focusing on:
- Cultural fit and soft skills
- Communication abilities
- Professionalism and presentation
- Career trajectory and stability
- Team collaboration potential

Provide your evaluation as JSON:
{
  "score": 0-100,
  "verdict": "Strong fit" or "Reach role" or "Not recommended",
  "justification": "One sentence explaining your verdict",
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"]
}

Be fair but critical. Score realistically based on the evidence provided.`

  return evaluateWithModel(model, prompt, 'HR', transcript)
}

// Tech Lead evaluation
async function evaluateAsTechLead(
  model: ReturnType<typeof getGeminiFlashModel>,
  context: string,
  transcript: string
): Promise<AgentEvaluation> {
  const prompt = `You are a Technical Lead evaluating a candidate's technical capabilities.

Candidate Profile:
${context}

${transcript ? `Interview Transcript:\n${transcript}\n\n` : ''}

Evaluate the candidate focusing on:
- Technical skills depth and breadth
- Problem-solving abilities
- Technology stack expertise
- System design understanding
- Code quality and best practices awareness

Provide your evaluation as JSON:
{
  "score": 0-100,
  "verdict": "Strong fit" or "Reach role" or "Not recommended",
  "justification": "One sentence explaining your verdict",
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"]
}

Be fair but critical. Score realistically based on technical evidence.`

  return evaluateWithModel(model, prompt, 'Tech Lead', transcript)
}

// Career Coach evaluation
async function evaluateAsCareerCoach(
  model: ReturnType<typeof getGeminiFlashModel>,
  context: string,
  transcript: string
): Promise<AgentEvaluation> {
  const prompt = `You are a Career Coach evaluating a candidate's career development and potential.

Candidate Profile:
${context}

${transcript ? `Interview Transcript:\n${transcript}\n\n` : ''}

Evaluate the candidate focusing on:
- Career growth trajectory
- Learning and development mindset
- Goal clarity and ambition
- Adaptability and resilience
- Leadership potential

Provide your evaluation as JSON:
{
  "score": 0-100,
  "verdict": "Strong fit" or "Reach role" or "Not recommended",
  "justification": "One sentence explaining your verdict",
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"]
}

Be fair but critical. Score realistically based on career evidence.`

  return evaluateWithModel(model, prompt, 'Career Coach', transcript)
}

// Common evaluation logic
async function evaluateWithModel(
  model: ReturnType<typeof getGeminiFlashModel>,
  prompt: string,
  role: string,
  transcript: string
): Promise<AgentEvaluation> {
  try {
    const response = await model.invoke(prompt)
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)
    
    const jsonMatch = content.match(/\{[\s\S]*?\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse evaluation JSON')
    }

    const evaluation = JSON.parse(jsonMatch[0])

    const rawScore = typeof evaluation.score === 'number' ? evaluation.score : 50
    const adjustedScore = applyRoleJitter(rawScore, role, transcript)

    return {
      score: adjustedScore,
      verdict: evaluation.verdict || 'Not recommended',
      justification: evaluation.justification || 'Evaluation incomplete',
      pros: Array.isArray(evaluation.pros) ? evaluation.pros : [],
      cons: Array.isArray(evaluation.cons) ? evaluation.cons : [],
    }
  } catch (error) {
    console.error(`${role} evaluation failed:`, error)
    return {
      score: applyRoleJitter(50, role, transcript),
      verdict: 'Not recommended',
      justification: 'Evaluation error occurred',
      pros: [],
      cons: ['Unable to complete evaluation'],
    }
  }
}

function applyRoleJitter(baseScore: number, role: string, transcript: string) {
  // Deterministic small offset per role and transcript to prevent identical scores
  const seedString = `${role}:${transcript || ''}`
  const hash = Array.from(seedString).reduce((acc, ch) => (acc + ch.charCodeAt(0)) % 9973, 0)
  const jitter = (hash % 7) - 3 // range -3..3
  const score = Math.max(0, Math.min(100, baseScore + jitter))
  return score
}

// Aggregate individual evaluations
function createAggregateNode() {
  return async (state: typeof PanelAnnotation.State) => {
    const { hrEvaluation, techEvaluation, coachEvaluation } = state

    if (!hrEvaluation || !techEvaluation || !coachEvaluation) {
      return {
        overallScore: 0,
        overallVerdict: 'Not recommended',
        error: 'Missing evaluations',
      }
    }

    // Calculate weighted average (equal weights for simplicity)
    const overallScore = Math.round(
      (hrEvaluation.score + techEvaluation.score + coachEvaluation.score) / 3
    )

    // Determine overall verdict
    let overallVerdict = 'Not recommended'
    if (overallScore >= 75) {
      overallVerdict = 'Strong fit'
    } else if (overallScore >= 60) {
      overallVerdict = 'Reach role'
    }

    return {
      overallScore,
      overallVerdict,
    }
  }
}

// Save panel review to database
function createSaveReviewNode(supabase: SupabaseClient) {
  return async (state: typeof PanelAnnotation.State) => {
    const {
      candidateId,
      interviewId,
      hrEvaluation,
      techEvaluation,
      coachEvaluation,
      overallScore,
      overallVerdict,
    } = state

    if (!hrEvaluation || !techEvaluation || !coachEvaluation) {
      return {
        error: 'Cannot save incomplete evaluations',
        reviewId: '',
      }
    }

    const { data, error } = await supabase
      .from('panel_reviews')
      .insert({
        candidate_id: candidateId,
        interview_id: interviewId,
        overall_score: overallScore,
        overall_verdict: overallVerdict,
        hr_score: hrEvaluation.score,
        hr_verdict: hrEvaluation.verdict,
        hr_justification: hrEvaluation.justification,
        hr_pros: hrEvaluation.pros,
        hr_cons: hrEvaluation.cons,
        tech_score: techEvaluation.score,
        tech_verdict: techEvaluation.verdict,
        tech_justification: techEvaluation.justification,
        tech_pros: techEvaluation.pros,
        tech_cons: techEvaluation.cons,
        coach_score: coachEvaluation.score,
        coach_verdict: coachEvaluation.verdict,
        coach_justification: coachEvaluation.justification,
        coach_pros: coachEvaluation.pros,
        coach_cons: coachEvaluation.cons,
        reviewed_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('Failed to save panel review:', error)
      return {
        error: 'Failed to save review',
        reviewId: '',
      }
    }

    return {
      reviewId: data.id,
      error: null,
    }
  }
}
