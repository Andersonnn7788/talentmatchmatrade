import { Annotation, END, START, StateGraph } from '@langchain/langgraph'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AIMessage } from '@langchain/core/messages'
import { z } from 'zod'

import type { JobPosting } from '@/app/types/database.types'
import { getOpenAIMiniModel } from '@/lib/ai/openaiClient'

type CandidateContext = {
  profile: {
    full_name: string
    email?: string | null
    phone?: string | null
    location?: string | null
    headline?: string | null
    bio?: string | null
    linkedin_url?: string | null
    github_url?: string | null
    portfolio_url?: string | null
    resume_url?: string | null
    preferred_roles?: string[] | null
    preferred_locations?: string[] | null
    preferred_industries?: string[] | null
    min_salary_rm?: number | null
    desired_benefits?: string[] | null
    employment_status?: string | null
    notice_period_days?: number | null
    availability_date?: string | null
    visible_to_employers?: boolean | null
    profile_public?: boolean | null
  }
  skills: Array<{
    skill_name: string
    skill_category?: string | null
    proficiency_level?: string | null
    years_of_experience?: number | null
  }>
  experience: Array<{
    company: string
    title: string
    employment_type?: string | null
    description?: string | null
    location?: string | null
    start_date?: string | null
    end_date?: string | null
    current: boolean
    skills_used?: string[] | null
  }>
  education: Array<{
    institution: string
    degree: string
    field_of_study?: string | null
    start_date?: string | null
    end_date?: string | null
    current?: boolean | null
    grade?: string | null
    activities?: string | null
  }>
}

export type AgentMatchBreakdown = {
  skills: string
  salary: string
  benefits: string
  location: string
}

export type AgentGeneratedMatch = {
  job_id: string
  job_title: string
  company_name: string
  match_score: number
  summary: string
  breakdown: AgentMatchBreakdown
}

type JobContext = Pick<
  JobPosting,
  | 'id'
  | 'job_title'
  | 'company_name'
  | 'location'
  | 'employment_type'
  | 'salary_min_rm'
  | 'salary_max_rm'
  | 'benefits'
  | 'remote_policy'
  | 'required_skills'
  | 'job_description'
  | 'industry'
>

const AgentResponseSchema = z.object({
  matches: z
    .array(
      z.object({
        job_id: z.string(),
        job_title: z.string(),
        company_name: z.string(),
        match_score: z.number().min(0).max(100),
        summary: z.string(),
        breakdown: z.object({
          skills: z.string(),
          salary: z.string(),
          benefits: z.string(),
          location: z.string(),
        }),
      })
    )
    .max(10),
})

const JobMatchAnnotation = Annotation.Root({
  candidateId: Annotation<string>(),
  limit: Annotation<number>({ default: () => 5 }),
  candidate: Annotation<CandidateContext | null>({ default: () => null }),
  jobs: Annotation<JobContext[]>({ default: () => [] }),
  rawResponse: Annotation<string | null>({ default: () => null }),
  matches: Annotation<AgentGeneratedMatch[]>({ default: () => [] }),
})

export interface RunJobMatchAgentOptions {
  supabase: SupabaseClient
  candidateId: string
  limit?: number
}

export async function runJobMatchAgent({
  supabase,
  candidateId,
  limit = 5,
}: RunJobMatchAgentOptions): Promise<AgentGeneratedMatch[]> {
  const safeLimit = normalizeLimit(limit)
  const model = getOpenAIMiniModel()

  const graph = new StateGraph(JobMatchAnnotation)
    .addNode('loadContext', createLoadContextNode(supabase))
    .addNode('reasonMatches', createReasonNode(model))
    .addNode('formatResponse', formatResponseNode)
    .addEdge(START, 'loadContext')
    .addEdge('loadContext', 'reasonMatches')
    .addEdge('reasonMatches', 'formatResponse')
    .addEdge('formatResponse', END)
    .compile()

  try {
    const result = await graph.invoke({
      candidateId,
      limit: safeLimit,
    })

    return result.matches
  } catch (error) {
    console.error('Job match agent failed before formatting response', error)
    return []
  }
}

function createLoadContextNode(supabase: SupabaseClient) {
  return async (state: typeof JobMatchAnnotation.State) => {
    const [candidate, jobs] = await Promise.all([
      fetchCandidateContext(supabase, state.candidateId),
      fetchActiveJobs(supabase, normalizeLimit(state.limit)),
    ])

    return {
      candidate,
      jobs,
    }
  }
}

function createReasonNode(model: ReturnType<typeof getGeminiFlashModel>) {
  return async (state: typeof JobMatchAnnotation.State) => {
    const jobCount = Array.isArray(state.jobs) ? state.jobs.length : 0

    if (!state.candidate || jobCount === 0) {
      return {
        rawResponse: JSON.stringify({ matches: [] }),
      }
    }

    const jobs = Array.isArray(state.jobs) ? (state.jobs as JobContext[]) : []
    const prompt = buildPrompt(state.candidate, jobs, state.limit)
    const promptText = typeof prompt === 'string' ? prompt : String(prompt ?? '')

    if (!promptText || promptText.length === 0) {
      return { rawResponse: JSON.stringify({ matches: [] }) }
    }

    const llmResponse = await tryGeminiInvoke(model, promptText)
    if (llmResponse === null) {
      const fallback = buildFallbackMatches(state.candidate, jobs, state.limit)
      return { rawResponse: JSON.stringify({ matches: fallback }) }
    }

    return {
      rawResponse: llmResponse,
    }
  }
}

const formatResponseNode = (state: typeof JobMatchAnnotation.State) => {
  if (!state.rawResponse) {
    return { matches: [] }
  }

  const cleaned = state.rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    const data = AgentResponseSchema.parse(parsed)
    const matches = data.matches.map((match) => ({
      ...match,
      match_score: Math.round(match.match_score * 10) / 10,
    }))

    return { matches }
  } catch (error) {
    console.error('Failed to parse Gemini match response', error)
    return { matches: [] }
  }
}

async function fetchCandidateContext(
  supabase: SupabaseClient,
  candidateId: string
): Promise<CandidateContext | null> {
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select(
      `
      full_name,
      email,
      phone,
      location,
      headline,
      bio,
      linkedin_url,
      github_url,
      portfolio_url,
      resume_url,
      preferred_roles,
      preferred_locations,
      preferred_industries,
      min_salary_rm,
      desired_benefits,
      employment_status,
      notice_period_days,
      availability_date,
      visible_to_employers,
      profile_public
    `
    )
    .eq('id', candidateId)
    .single()

  if (!profile) return null

  const [{ data: skills }, { data: experience }, { data: education }] = await Promise.all([
    supabase
      .from('candidate_skills')
      .select('skill_name, skill_category, proficiency_level, years_of_experience')
      .eq('candidate_id', candidateId)
      .order('years_of_experience', { ascending: false }),
    supabase
      .from('experience')
      .select(
        'company, title, employment_type, description, location, start_date, end_date, current, skills_used'
      )
      .eq('candidate_id', candidateId)
      .order('start_date', { ascending: false })
      .limit(6),
    supabase
      .from('education')
      .select('institution, degree, field_of_study, start_date, end_date, current, grade, activities')
      .eq('candidate_id', candidateId)
      .order('start_date', { ascending: false })
      .limit(4),
  ])

  return {
    profile,
    skills: skills || [],
    experience: experience || [],
    education: education || [],
  }
}

async function fetchActiveJobs(
  supabase: SupabaseClient,
  limit: number
): Promise<JobContext[]> {
  const safeLimit = normalizeLimit(limit)

  const { data: jobs } = await supabase
    .from('job_postings')
    .select(
      `
      id,
      job_title,
      company_name,
      location,
      employment_type,
      salary_min_rm,
      salary_max_rm,
      benefits,
      remote_policy,
      required_skills,
      job_description,
      industry
    `
    )
    .eq('status', 'active')
    .order('posted_date', { ascending: false })
    .limit(Math.min(safeLimit * 2, 12))

  return jobs || []
}

function buildPrompt(candidate: CandidateContext, jobs: JobContext[], limit: number) {
  const candidateSummary = [
    `Name: ${candidate.profile.full_name}`,
    candidate.profile.email ? `Email: ${candidate.profile.email}` : null,
    candidate.profile.phone ? `Phone: ${candidate.profile.phone}` : null,
    candidate.profile.location ? `Location: ${candidate.profile.location}` : null,
    candidate.profile.headline ? `Headline: ${candidate.profile.headline}` : null,
    candidate.profile.bio ? `Bio: ${candidate.profile.bio}` : null,
    candidate.profile.linkedin_url ? `LinkedIn: ${candidate.profile.linkedin_url}` : null,
    candidate.profile.github_url ? `GitHub: ${candidate.profile.github_url}` : null,
    candidate.profile.portfolio_url ? `Portfolio: ${candidate.profile.portfolio_url}` : null,
    candidate.profile.resume_url ? `Resume: ${candidate.profile.resume_url}` : null,
    candidate.profile.preferred_roles?.length
      ? `Preferred Roles: ${candidate.profile.preferred_roles.join(', ')}`
      : null,
    candidate.profile.preferred_industries?.length
      ? `Preferred Industries: ${candidate.profile.preferred_industries.join(', ')}`
      : null,
    candidate.profile.preferred_locations?.length
      ? `Preferred Locations: ${candidate.profile.preferred_locations.join(', ')}`
      : null,
    candidate.profile.min_salary_rm
      ? `Minimum Salary: RM ${candidate.profile.min_salary_rm}`
      : null,
    candidate.profile.desired_benefits?.length
      ? `Desired Benefits: ${candidate.profile.desired_benefits.join(', ')}`
      : null,
    candidate.profile.employment_status
      ? `Status: ${candidate.profile.employment_status}`
      : null,
    candidate.profile.availability_date
      ? `Availability: ${candidate.profile.availability_date}`
      : null,
    candidate.profile.visible_to_employers !== undefined
      ? `Visible to employers: ${candidate.profile.visible_to_employers ? 'yes' : 'no'}`
      : null,
    candidate.profile.profile_public !== undefined
      ? `Profile public: ${candidate.profile.profile_public ? 'yes' : 'no'}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const skillSummary = candidate.skills
    ?.slice(0, 12)
    .map(
      (skill) =>
        `${skill.skill_name} (${skill.proficiency_level ?? 'unknown'}${
          skill.years_of_experience ? `, ${skill.years_of_experience} yrs` : ''
        })`
    )
    .join('; ')

  const educationSummary = candidate.education
    ?.slice(0, 4)
    .map((edu) => {
      const dates = [edu.start_date, edu.end_date ?? (edu.current ? 'Present' : null)]
        .filter(Boolean)
        .join(' - ')
      return `${edu.degree} in ${edu.field_of_study ?? 'General'} @ ${edu.institution}${
        dates ? ` (${dates})` : ''
      }${edu.grade ? ` | Grade: ${edu.grade}` : ''}`
    })
    .join('\n')

  const experienceSummary = candidate.experience
    ?.slice(0, 4)
    .map(
      (exp) =>
        `${exp.title} @ ${exp.company}${exp.location ? ` (${exp.location})` : ''}${
          exp.skills_used?.length ? ` | Skills: ${exp.skills_used.join(', ')}` : ''
        }`
    )
    .join('\n')

  const jobSummaries = jobs
    .map(
      (job) => `Job ID: ${job.id}
Title: ${job.job_title}
Company: ${job.company_name}
Location: ${job.location} | Mode: ${job.remote_policy ?? 'not specified'} | Type: ${
        job.employment_type
      }
Salary: RM ${job.salary_min_rm ?? 'N/A'} - RM ${job.salary_max_rm ?? 'N/A'}
Industry: ${job.industry ?? 'N/A'}
Required Skills: ${(job.required_skills ?? []).join(', ')}
Benefits: ${(job.benefits ?? []).join(', ')}
Summary: ${job.job_description?.slice(0, 240) ?? 'N/A'}`
    )
    .join('\n\n')

  return `
You are the TalentMatch Agentic Recruiter AI. You know the candidate profile and all open job postings.
Pick up to ${limit} best-fit roles. Always produce valid JSON with this schema:
{
  "matches": [
    {
      "job_id": "uuid",
      "job_title": "string",
      "company_name": "string",
      "match_score": number (0-100),
      "summary": "Concise reason the role fits",
      "breakdown": {
        "skills": "How the candidate's skills align",
        "salary": "Salary comparison vs expectations",
        "benefits": "Benefits alignment",
        "location": "Location/remote fit"
      }
    }
  ]
}

Candidate Profile:
${candidateSummary}

Education:
${educationSummary}

Key Skills:
${skillSummary}

Recent Experience:
${experienceSummary}

Open Roles:
${jobSummaries}
`
}

function extractMessageText(message: AIMessage | string): string {
  if (typeof message === 'string') return message
  if (typeof message.content === 'string') {
    return message.content
  }

  if (!Array.isArray(message.content)) {
    return ''
  }

  return message.content
    .map((part) => {
      if (typeof part === 'string') return part
      if (isTextPart(part)) return part.text ?? ''
      if (isNestedContentPart(part)) {
        return part.content?.map((entry) => entry?.text ?? '').join('\n') ?? ''
      }
      return ''
    })
    .join('\n')
}

function isTextPart(part: unknown): part is { text?: string } {
  return typeof part === 'object' && part !== null && 'text' in part
}

function isNestedContentPart(
  part: unknown
): part is { content?: Array<{ text?: string | null | undefined }> } {
  if (typeof part !== 'object' || part === null) return false
  const maybeContent = (part as { content?: unknown }).content
  return Array.isArray(maybeContent)
}

function normalizeLimit(limit: unknown): number {
  const num = typeof limit === 'number' ? limit : Number(limit)
  if (!Number.isFinite(num) || num <= 0) return 5
  return Math.min(Math.max(Math.floor(num), 1), 8)
}

async function tryGeminiInvoke(model: ReturnType<typeof getGeminiFlashModel>, prompt: string) {
  try {
    const completion = await model.invoke(prompt)
    return extractMessageText(completion)
  } catch (error) {
    // Avoid noisy stack traces and fall back gracefully when the model is unavailable (e.g., no network/API key).
    console.warn('Gemini unavailable, falling back to heuristic matches.')
    return null
  }
}

function buildFallbackMatches(candidate: CandidateContext, jobs: JobContext[], limit: number) {
  const candidateSkills = new Set(
    (candidate.skills ?? []).map((s) => s.skill_name.toLowerCase().trim()).filter(Boolean)
  )
  const preferredLocations = new Set(
    (candidate.profile.preferred_locations ?? []).map((l) => l.toLowerCase().trim()).filter(Boolean)
  )
  const minSalary = candidate.profile.min_salary_rm ?? 0

  const scored = jobs.map((job) => {
    const requiredSkills = (job.required_skills ?? []).map((s) => s.toLowerCase().trim())
    const overlap = requiredSkills.filter((s) => candidateSkills.has(s))
    const skillScore = requiredSkills.length
      ? Math.min((overlap.length / requiredSkills.length) * 100, 100)
      : 50

    const salaryMin = job.salary_min_rm ?? 0
    const salaryMax = job.salary_max_rm ?? 0
    const salaryScore = salaryMax >= minSalary ? 100 : Math.max(0, (salaryMax / (minSalary || 1)) * 100)

    const locationScore = job.location
      ? preferredLocations.has(job.location.toLowerCase().trim())
        ? 100
        : 60
      : 50

    const match_score = Math.round((skillScore * 0.6 + salaryScore * 0.25 + locationScore * 0.15) * 10) / 10

    return {
      job_id: job.id,
      job_title: job.job_title,
      company_name: job.company_name,
      match_score,
      summary: `Skills match ${overlap.length}/${requiredSkills.length || 1}; salary ${salaryMin ? `RM ${salaryMin}-${salaryMax}` : 'N/A'}; location ${job.location ?? 'N/A'}`,
      breakdown: {
        skills: overlap.length
          ? `Matches: ${overlap.join(', ')}`
          : 'Limited direct required-skill overlap; consider transferable skills.',
        salary:
          salaryMax >= minSalary
            ? `Range RM ${salaryMin || 'N/A'} - RM ${salaryMax || 'N/A'} meets or exceeds your minimum RM ${minSalary}.`
            : `Range RM ${salaryMin || 'N/A'} - RM ${salaryMax || 'N/A'} is below your minimum RM ${minSalary}.`,
        benefits: (job.benefits ?? []).length
          ? `Offers: ${(job.benefits ?? []).slice(0, 5).join(', ')}`
          : 'Benefits not specified.',
        location: job.location
          ? preferredLocations.has(job.location.toLowerCase().trim())
            ? `Location ${job.location} matches your preferences.`
            : `Location ${job.location}; only partial match to preferences.`
          : 'Location not specified.',
      },
    }
  })

  return scored
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, normalizeLimit(limit))
}
