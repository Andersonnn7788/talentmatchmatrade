-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
-- Add this table to your Supabase database

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_achieved DATE,
  category VARCHAR(100), -- academic, professional, hackathon, certification, award, volunteer
  issuer VARCHAR(255), -- organization or institution that issued the achievement
  url TEXT, -- link to certificate or proof
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own achievements"
  ON achievements FOR ALL
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

CREATE INDEX idx_achievements_candidate_id ON achievements(candidate_id);

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

