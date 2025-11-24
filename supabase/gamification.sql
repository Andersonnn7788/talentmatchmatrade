-- Add xp_points to candidate_profiles
ALTER TABLE candidate_profiles 
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;

-- Index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_xp_points 
ON candidate_profiles(xp_points DESC);

-- Function to calculate points based on badges and submissions (optional, for initial seed)
-- For now, let's just seed some random points for existing profiles if they are 0
UPDATE candidate_profiles 
SET xp_points = floor(random() * 1000 + 100)::int
WHERE xp_points = 0;

-- Ensure current user has some points for demo
UPDATE candidate_profiles
SET xp_points = 1250
WHERE email = 'sarah.chen@example.com'; -- Assuming this is a demo user or similar

-- View for Leaderboard (combining points and badge counts)
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
  cp.id,
  cp.full_name,
  cp.profile_photo_url,
  cp.xp_points,
  COUNT(db.id) as badge_count,
  cp.job_title
FROM candidate_profiles cp
LEFT JOIN digital_badges db ON cp.id = db.candidate_id
GROUP BY cp.id, cp.full_name, cp.profile_photo_url, cp.xp_points
ORDER BY cp.xp_points DESC;

