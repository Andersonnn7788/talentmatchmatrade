export interface CandidateProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  location?: string
  headline?: string
  bio?: string
  profile_photo_url?: string
  resume_url?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  preferred_roles?: string[]
  preferred_industries?: string[]
  preferred_locations?: string[]
  min_salary_rm?: number
  desired_benefits?: string[]
  notice_period_days?: number
  employment_status?: string
  availability_date?: string
  visible_to_employers: boolean
  profile_public: boolean
  created_at: string
  updated_at: string
}

export interface Education {
  id: string
  candidate_id: string
  institution: string
  degree: string
  field_of_study?: string
  start_date?: string
  end_date?: string
  current: boolean
  grade?: string
  activities?: string
  created_at: string
  updated_at: string
}

export interface Experience {
  id: string
  candidate_id: string
  company: string
  title: string
  employment_type?: string
  location?: string
  start_date: string
  end_date?: string
  current: boolean
  description?: string
  skills_used?: string[]
  created_at: string
  updated_at: string
}

export interface CandidateSkill {
  id: string
  candidate_id: string
  skill_name: string
  skill_category?: string
  proficiency_level?: string
  years_of_experience?: number
  created_at: string
}

export interface Achievement {
  id: string
  candidate_id: string
  title: string
  description?: string
  date_achieved?: string
  category?: string
  issuer?: string
  url?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  event_type: string
  start_date: string
  end_date: string
  registration_deadline?: string
  max_participants?: number
  status: string
  prize_pool?: number
  tags?: string[]
  banner_image_url?: string
  rules?: string
  judging_criteria?: Record<string, unknown>
  created_by?: string
  created_at: string
  updated_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  candidate_id: string
  team_name?: string
  registration_status: string
  registered_at: string
}

export interface ProjectSubmission {
  id: string
  event_id: string
  candidate_id: string
  project_title: string
  project_description: string
  github_url?: string
  demo_url?: string
  demo_video_url?: string
  presentation_url?: string
  tech_stack?: string[]
  submission_status: string
  ai_score?: number
  judge_score?: number
  final_score?: number
  rank?: number
  feedback?: string
  submitted_at: string
  reviewed_at?: string
}

export interface DigitalBadge {
  id: string
  candidate_id: string
  event_id?: string
  badge_type: string
  badge_name: string
  badge_description?: string
  badge_image_url?: string
  qr_verification_url?: string
  issued_at: string
  metadata?: Record<string, unknown>
}

export interface Leaderboard {
  id: string
  event_id: string
  candidate_id: string
  submission_id?: string
  rank: number
  score: number
  updated_at: string
}

export interface PanelReview {
  id: string
  candidate_id: string
  job_id?: string
  overall_score: number
  overall_verdict: string
  hr_score: number
  hr_verdict: string
  hr_justification?: string
  hr_pros?: string[]
  hr_cons?: string[]
  tech_score: number
  tech_verdict: string
  tech_justification?: string
  tech_pros?: string[]
  tech_cons?: string[]
  coach_score: number
  coach_verdict: string
  coach_justification?: string
  coach_pros?: string[]
  coach_cons?: string[]
  reviewed_at: string
  created_at: string
}

export interface AgentMatch {
  id: string
  candidate_id: string
  job_id: string
  match_score: number
  skills_match_explanation?: string
  salary_alignment_explanation?: string
  benefits_match_explanation?: string
  location_fit_explanation?: string
  match_status: string
  notification_sent: boolean
  created_at: string
  viewed_at?: string
}

export interface AIInterview {
  id: string
  candidate_id: string
  interview_type: string
  transcript: Array<{
    speaker: string
    content: string
    timestamp: string
  }>
  ai_summary?: string
  key_insights?: Record<string, unknown>
  duration_seconds?: number
  interview_date: string
  created_at: string
}

export interface InterviewMessage {
  id: string
  interview_id: string
  speaker: string
  content: string
  message_order: number
  timestamp: string
  created_at: string
}

export interface InterviewState {
  interview_id: string
  current_question_index: number
  total_questions: number
  is_active: boolean
  started_at: string
  last_activity_at: string
  updated_at: string
}

export interface JobPosting {
  id: string
  company_name: string
  company_logo_url?: string
  job_title: string
  job_description: string
  required_skills: string[]
  preferred_skills?: string[]
  min_years_experience?: number
  education_level?: string
  salary_min_rm?: number
  salary_max_rm?: number
  salary_currency: string
  benefits?: string[]
  location: string
  remote_policy?: string
  employment_type: string
  industry?: string
  department?: string
  status: string
  posted_date: string
  application_deadline?: string
  created_at: string
  updated_at: string
}