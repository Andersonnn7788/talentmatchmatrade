-- ============================================
-- USEFUL SQL QUERIES FOR JOB POSTINGS
-- ============================================
-- Quick reference queries for managing and viewing job postings

-- ============================================
-- VIEW ALL JOB POSTINGS
-- ============================================
SELECT 
  company_name,
  job_title,
  location,
  remote_policy,
  salary_min_rm || ' - ' || salary_max_rm as salary_range,
  employment_type,
  status
FROM job_postings
ORDER BY created_at DESC;

-- ============================================
-- VIEW JOB MATCHES WITH DETAILS
-- ============================================
SELECT 
  cp.full_name as candidate_name,
  jp.company_name,
  jp.job_title,
  am.match_score,
  am.match_status,
  am.created_at as matched_at
FROM agent_matches am
JOIN candidate_profiles cp ON am.candidate_id = cp.id
JOIN job_postings jp ON am.job_id = jp.id
ORDER BY am.match_score DESC;

-- ============================================
-- COUNT MATCHES BY STATUS
-- ============================================
SELECT 
  match_status,
  COUNT(*) as count
FROM agent_matches
GROUP BY match_status
ORDER BY count DESC;

-- ============================================
-- VIEW MATCHES FOR SPECIFIC CANDIDATE
-- ============================================
-- Replace 'candidate-email@example.com' with actual email
SELECT 
  jp.company_name,
  jp.job_title,
  jp.location,
  am.match_score,
  am.match_status,
  jp.salary_min_rm || ' - ' || jp.salary_max_rm as salary_range
FROM agent_matches am
JOIN job_postings jp ON am.job_id = jp.id
JOIN candidate_profiles cp ON am.candidate_id = cp.id
WHERE cp.email = 'sarah.chen@example.com'
ORDER BY am.match_score DESC;

-- ============================================
-- FIND JOBS BY SKILL
-- ============================================
SELECT 
  company_name,
  job_title,
  location,
  salary_min_rm || ' - ' || salary_max_rm as salary_range
FROM job_postings
WHERE 'React' = ANY(required_skills)
  AND status = 'active'
ORDER BY posted_date DESC;

-- ============================================
-- FIND JOBS BY LOCATION
-- ============================================
SELECT 
  company_name,
  job_title,
  location,
  remote_policy,
  salary_min_rm || ' - ' || salary_max_rm as salary_range
FROM job_postings
WHERE location ILIKE '%Kuala Lumpur%'
  AND status = 'active'
ORDER BY posted_date DESC;

-- ============================================
-- FIND JOBS BY SALARY RANGE
-- ============================================
SELECT 
  company_name,
  job_title,
  location,
  salary_min_rm,
  salary_max_rm
FROM job_postings
WHERE salary_min_rm >= 6000
  AND status = 'active'
ORDER BY salary_min_rm DESC;

-- ============================================
-- VIEW TOP MATCHES FOR ALL CANDIDATES
-- ============================================
SELECT 
  cp.full_name,
  jp.company_name,
  jp.job_title,
  am.match_score,
  am.match_status
FROM agent_matches am
JOIN candidate_profiles cp ON am.candidate_id = cp.id
JOIN job_postings jp ON am.job_id = jp.id
WHERE am.match_score >= 85
ORDER BY am.match_score DESC;

-- ============================================
-- UPDATE JOB STATUS
-- ============================================
-- Close a job posting
UPDATE job_postings 
SET status = 'closed' 
WHERE id = 'your-job-id';

-- Reopen a job posting
UPDATE job_postings 
SET status = 'active' 
WHERE id = 'your-job-id';

-- ============================================
-- UPDATE MATCH STATUS
-- ============================================
-- Mark a match as viewed
UPDATE agent_matches 
SET match_status = 'viewed', viewed_at = NOW() 
WHERE id = 'your-match-id';

-- Mark a match as applied
UPDATE agent_matches 
SET match_status = 'applied' 
WHERE id = 'your-match-id';

-- Mark a match as dismissed
UPDATE agent_matches 
SET match_status = 'dismissed' 
WHERE id = 'your-match-id';

-- ============================================
-- DELETE SPECIFIC JOBS
-- ============================================
-- Delete a single job and its matches (cascade)
DELETE FROM job_postings 
WHERE id = 'your-job-id';

-- Delete all test/mock jobs
DELETE FROM job_postings 
WHERE id LIKE '10000000-%';

-- ============================================
-- DELETE ALL MATCHES
-- ============================================
-- Use with caution!
DELETE FROM agent_matches;

-- ============================================
-- GET STATISTICS
-- ============================================
-- Overall stats
SELECT 
  (SELECT COUNT(*) FROM job_postings WHERE status = 'active') as active_jobs,
  (SELECT COUNT(*) FROM agent_matches) as total_matches,
  (SELECT COUNT(*) FROM agent_matches WHERE match_status = 'new') as new_matches,
  (SELECT COUNT(*) FROM agent_matches WHERE match_status = 'viewed') as viewed_matches,
  (SELECT COUNT(*) FROM agent_matches WHERE match_status = 'applied') as applied_matches;

-- ============================================
-- AVERAGE MATCH SCORES BY JOB
-- ============================================
SELECT 
  jp.company_name,
  jp.job_title,
  ROUND(AVG(am.match_score), 2) as avg_match_score,
  COUNT(am.id) as total_matches
FROM job_postings jp
LEFT JOIN agent_matches am ON jp.id = am.job_id
GROUP BY jp.id, jp.company_name, jp.job_title
ORDER BY avg_match_score DESC;

-- ============================================
-- FIND CANDIDATES WITHOUT MATCHES
-- ============================================
SELECT 
  cp.full_name,
  cp.email,
  cp.preferred_roles,
  cp.min_salary_rm
FROM candidate_profiles cp
LEFT JOIN agent_matches am ON cp.id = am.candidate_id
WHERE am.id IS NULL;

-- ============================================
-- CREATE A NEW JOB POSTING (TEMPLATE)
-- ============================================
INSERT INTO job_postings (
  company_name,
  job_title,
  job_description,
  required_skills,
  preferred_skills,
  min_years_experience,
  education_level,
  salary_min_rm,
  salary_max_rm,
  benefits,
  location,
  remote_policy,
  employment_type,
  industry,
  department,
  status
) VALUES (
  'Company Name',
  'Job Title',
  'Detailed job description here...',
  ARRAY['Skill1', 'Skill2', 'Skill3'],
  ARRAY['OptionalSkill1', 'OptionalSkill2'],
  2, -- min years
  'Bachelor in Computer Science or related field',
  6000.00,
  8000.00,
  ARRAY['Health Insurance', 'Flexible Hours', 'Remote Work'],
  'Kuala Lumpur',
  'hybrid',
  'full-time',
  'Technology',
  'Engineering',
  'active'
);

-- ============================================
-- CREATE A NEW MATCH (TEMPLATE)
-- ============================================
INSERT INTO agent_matches (
  candidate_id,
  job_id,
  match_score,
  skills_match_explanation,
  salary_alignment_explanation,
  benefits_match_explanation,
  location_fit_explanation,
  match_status
) VALUES (
  'candidate-uuid',
  'job-uuid',
  85.0,
  'Your skills in X, Y, and Z match well with the requirements.',
  'Salary range meets your expectations.',
  'Benefits align with your preferences.',
  'Location is perfect for your requirements.',
  'new'
);

-- ============================================
-- EXPORT JOBS TO VIEW EXTERNALLY
-- ============================================
-- Copy results and save as CSV
SELECT 
  company_name as "Company",
  job_title as "Position",
  location as "Location",
  remote_policy as "Remote Policy",
  salary_min_rm as "Min Salary",
  salary_max_rm as "Max Salary",
  employment_type as "Type",
  array_to_string(required_skills, ', ') as "Required Skills",
  status as "Status"
FROM job_postings
ORDER BY posted_date DESC;

