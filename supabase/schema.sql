-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================
-- CANDIDATE PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  headline VARCHAR(500),
  bio TEXT,
  profile_photo_url TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  
  -- Job Preferences
  preferred_roles TEXT[], -- Array of role keywords
  preferred_industries TEXT[], -- Array of industries
  preferred_locations TEXT[], -- KL, Penang, SG, remote, etc.
  min_salary_rm DECIMAL(10,2),
  desired_benefits TEXT[], -- flexible hours, health insurance, etc.
  notice_period_days INTEGER,
  employment_status VARCHAR(50), -- student, employed, fresh_grad, etc.
  availability_date DATE,
  
  -- Consent and Privacy
  visible_to_employers BOOLEAN DEFAULT false,
  profile_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidate_profiles
CREATE POLICY "Users can view own profile"
  ON candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can view consented profiles"
  ON candidate_profiles FOR SELECT
  USING (visible_to_employers = true);

-- ============================================
-- EDUCATION
-- ============================================

CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  field_of_study VARCHAR(255),
  start_date DATE,
  end_date DATE,
  current BOOLEAN DEFAULT false,
  grade VARCHAR(50),
  activities TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own education"
  ON education FOR ALL
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

-- ============================================
-- EXPERIENCE
-- ============================================

CREATE TABLE IF NOT EXISTS experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  employment_type VARCHAR(50), -- full-time, part-time, internship, etc.
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN DEFAULT false,
  description TEXT,
  skills_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own experience"
  ON experience FOR ALL
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

-- ============================================
-- SKILLS
-- ============================================

CREATE TABLE IF NOT EXISTS candidate_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(50), -- technical, soft, language, etc.
  proficiency_level VARCHAR(50), -- beginner, intermediate, advanced, expert
  years_of_experience DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidate_id, skill_name)
);

ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own skills"
  ON candidate_skills FOR ALL
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

-- ============================================
-- EVENTS (Hackathons, Challenges, Case Studies)
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL, -- hackathon, business_challenge, case_study
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  status VARCHAR(50) DEFAULT 'draft', -- draft, open, in_progress, closed, completed
  prize_pool DECIMAL(10,2),
  tags TEXT[],
  banner_image_url TEXT,
  rules TEXT,
  judging_criteria JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  USING (status IN ('open', 'in_progress', 'closed', 'completed'));

-- ============================================
-- EVENT REGISTRATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  team_name VARCHAR(255),
  registration_status VARCHAR(50) DEFAULT 'registered', -- registered, confirmed, withdrawn
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, candidate_id)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

-- ============================================
-- PROJECT SUBMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  project_description TEXT NOT NULL,
  github_url TEXT,
  demo_url TEXT,
  demo_video_url TEXT,
  presentation_url TEXT,
  tech_stack TEXT[],
  submission_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  ai_score DECIMAL(5,2), -- AI-generated score 0-100
  judge_score DECIMAL(5,2), -- Human judge score 0-100
  final_score DECIMAL(5,2), -- Combined score
  rank INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, candidate_id)
);

ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
  ON project_submissions FOR SELECT
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create submissions"
  ON project_submissions FOR INSERT
  WITH CHECK (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own pending submissions"
  ON project_submissions FOR UPDATE
  USING (
    candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid())
    AND submission_status = 'pending'
  );

CREATE POLICY "Anyone can view approved submissions"
  ON project_submissions FOR SELECT
  USING (submission_status = 'approved');

-- ============================================
-- DIGITAL BADGES
-- ============================================

CREATE TABLE IF NOT EXISTS digital_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL, -- winner, top_5_percent, top_10_percent, participant
  badge_name VARCHAR(255) NOT NULL,
  badge_description TEXT,
  badge_image_url TEXT,
  qr_verification_url TEXT UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

ALTER TABLE digital_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON digital_badges FOR SELECT
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can verify badges via QR"
  ON digital_badges FOR SELECT
  USING (qr_verification_url IS NOT NULL);

-- ============================================
-- LEADERBOARDS
-- ============================================

CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  submission_id UUID REFERENCES project_submissions(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, candidate_id)
);

ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboards"
  ON leaderboards FOR SELECT
  USING (true);

-- ============================================
-- VIRTUAL HIRING PANEL REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS panel_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID, -- Reference to job posting (not created yet in this schema)
  
  -- Overall Panel Summary
  overall_score DECIMAL(5,2) NOT NULL, -- 0-100
  overall_verdict VARCHAR(50) NOT NULL, -- Strong fit, Reach role, Not recommended
  
  -- HR Agent Review
  hr_score DECIMAL(5,2) NOT NULL,
  hr_verdict VARCHAR(50) NOT NULL,
  hr_justification TEXT,
  hr_pros TEXT[],
  hr_cons TEXT[],
  
  -- Tech Lead Agent Review
  tech_score DECIMAL(5,2) NOT NULL,
  tech_verdict VARCHAR(50) NOT NULL,
  tech_justification TEXT,
  tech_pros TEXT[],
  tech_cons TEXT[],
  
  -- Career Coach Agent Review
  coach_score DECIMAL(5,2) NOT NULL,
  coach_verdict VARCHAR(50) NOT NULL,
  coach_justification TEXT,
  coach_pros TEXT[],
  coach_cons TEXT[],
  
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE panel_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own panel reviews"
  ON panel_reviews FOR SELECT
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

-- ============================================
-- REVERSE RECRUITER AGENT MATCHES
-- ============================================

CREATE TABLE IF NOT EXISTS agent_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID NOT NULL, -- Reference to job posting
  match_score DECIMAL(5,2) NOT NULL, -- 0-100
  
  -- Explanation snippets
  skills_match_explanation TEXT,
  salary_alignment_explanation TEXT,
  benefits_match_explanation TEXT,
  location_fit_explanation TEXT,
  
  match_status VARCHAR(50) DEFAULT 'new', -- new, viewed, applied, dismissed
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE agent_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches"
  ON agent_matches FOR SELECT
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own match status"
  ON agent_matches FOR UPDATE
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

-- ============================================
-- AI INTERVIEW TRANSCRIPTS
-- ============================================

CREATE TABLE IF NOT EXISTS ai_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  interview_type VARCHAR(50) NOT NULL, -- general, technical, behavioral
  transcript JSONB NOT NULL, -- Array of messages with speaker and content
  ai_summary TEXT,
  key_insights JSONB, -- Structured insights extracted by AI
  duration_seconds INTEGER,
  interview_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interviews"
  ON ai_interviews FOR SELECT
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_visible ON candidate_profiles(visible_to_employers) WHERE visible_to_employers = true;
CREATE INDEX idx_education_candidate_id ON education(candidate_id);
CREATE INDEX idx_experience_candidate_id ON experience(candidate_id);
CREATE INDEX idx_candidate_skills_candidate_id ON candidate_skills(candidate_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_registrations_candidate ON event_registrations(candidate_id);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_project_submissions_candidate ON project_submissions(candidate_id);
CREATE INDEX idx_project_submissions_event ON project_submissions(event_id);
CREATE INDEX idx_digital_badges_candidate ON digital_badges(candidate_id);
CREATE INDEX idx_leaderboards_event ON leaderboards(event_id);
CREATE INDEX idx_panel_reviews_candidate ON panel_reviews(candidate_id);
CREATE INDEX idx_agent_matches_candidate ON agent_matches(candidate_id);
CREATE INDEX idx_ai_interviews_candidate ON ai_interviews(candidate_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at BEFORE UPDATE ON experience
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

