-- ============================================
-- MOCK DATA FOR TALENTMATCH CANDIDATE SIDE
-- ============================================
-- This script creates mock data for testing the candidate side features
-- Run this after schema.sql

-- Note: You'll need to create actual auth users in Supabase Dashboard first
-- Then replace the user_id UUIDs below with actual auth.users IDs

-- For testing purposes, we'll use placeholder UUIDs
-- In production, these would be real auth.users IDs

-- ============================================
-- SAMPLE EVENTS (Hackathons & Challenges)
-- ============================================

INSERT INTO events (id, title, description, event_type, start_date, end_date, registration_deadline, max_participants, status, prize_pool, tags, judging_criteria) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'AI Innovation Hackathon 2025',
    'Build the next generation of AI applications using cutting-edge LLM technology. Focus on solving real-world problems in healthcare, education, or sustainability.',
    'hackathon',
    '2025-01-15 09:00:00+08',
    '2025-01-17 18:00:00+08',
    '2025-01-10 23:59:59+08',
    100,
    'open',
    15000.00,
    ARRAY['AI', 'Machine Learning', 'LLM', 'Innovation'],
    '{"innovation": 30, "technical_execution": 30, "impact": 25, "presentation": 15}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Fintech Challenge: Digital Banking Revolution',
    'Design and prototype innovative digital banking solutions for the underbanked population in Southeast Asia.',
    'business_challenge',
    '2025-02-01 09:00:00+08',
    '2025-02-28 23:59:59+08',
    '2025-01-25 23:59:59+08',
    50,
    'open',
    20000.00,
    ARRAY['Fintech', 'Banking', 'Digital Transformation'],
    '{"business_model": 25, "market_fit": 25, "feasibility": 25, "innovation": 25}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'E-Commerce Growth Strategy Case Study',
    'Analyze a struggling e-commerce startup and propose a comprehensive growth strategy.',
    'case_study',
    '2024-12-01 09:00:00+08',
    '2024-12-15 23:59:59+08',
    '2024-11-28 23:59:59+08',
    75,
    'completed',
    10000.00,
    ARRAY['E-Commerce', 'Strategy', 'Business Analysis'],
    '{"analysis_depth": 30, "strategic_thinking": 30, "actionability": 25, "presentation": 15}'::jsonb
  );

-- ============================================
-- SAMPLE CANDIDATE PROFILES
-- ============================================
-- NOTE: Replace these UUIDs with real auth.users IDs from your Supabase project

INSERT INTO candidate_profiles (
  id,
  user_id,
  full_name,
  email,
  phone,
  location,
  headline,
  bio,
  linkedin_url,
  github_url,
  preferred_roles,
  preferred_industries,
  preferred_locations,
  min_salary_rm,
  desired_benefits,
  notice_period_days,
  employment_status,
  visible_to_employers,
  profile_public
) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'user-id-1', -- Replace with real auth.users ID
    'Sarah Chen',
    'sarah.chen@example.com',
    '+60123456789',
    'Kuala Lumpur, Malaysia',
    'Full-Stack Developer | AI Enthusiast | Hackathon Winner',
    'Passionate software engineer with 2 years of experience building scalable web applications. Strong background in React, Node.js, and Python. Winner of multiple hackathons and active contributor to open-source projects.',
    'https://linkedin.com/in/sarahchen',
    'https://github.com/sarahchen',
    ARRAY['Full-Stack Developer', 'Software Engineer', 'Frontend Developer'],
    ARRAY['Technology', 'Fintech', 'E-Commerce'],
    ARRAY['Kuala Lumpur', 'Remote', 'Singapore'],
    6000.00,
    ARRAY['Health Insurance', 'Flexible Hours', 'Remote Work', 'Learning Budget'],
    30,
    'employed',
    true,
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'user-id-2', -- Replace with real auth.users ID
    'Ahmad Razak',
    'ahmad.razak@example.com',
    '+60129876543',
    'Penang, Malaysia',
    'Recent CS Graduate | Mobile Developer | Problem Solver',
    'Fresh computer science graduate with strong foundation in algorithms and data structures. Experienced in mobile app development using React Native. Completed 3 internships and won university hackathon.',
    'https://linkedin.com/in/ahmadrazak',
    'https://github.com/ahmadrazak',
    ARRAY['Mobile Developer', 'Software Engineer', 'Backend Developer'],
    ARRAY['Technology', 'Startup', 'Gaming'],
    ARRAY['Penang', 'Remote', 'Kuala Lumpur'],
    4500.00,
    ARRAY['Mentorship', 'Career Growth', 'Flexible Hours'],
    0,
    'fresh_grad',
    true,
    true
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'user-id-3', -- Replace with real auth.users ID
    'Mei Ling Tan',
    'meiling.tan@example.com',
    '+60127654321',
    'Kuala Lumpur, Malaysia',
    'CS Student | Data Science Enthusiast | Research Assistant',
    'Final year computer science student specializing in machine learning and data analytics. Research assistant at university AI lab. Seeking internship or graduate position in data science.',
    'https://linkedin.com/in/meilingtan',
    'https://github.com/meilingtan',
    ARRAY['Data Scientist', 'Machine Learning Engineer', 'Data Analyst'],
    ARRAY['Technology', 'Healthcare', 'Finance'],
    ARRAY['Kuala Lumpur', 'Remote'],
    3500.00,
    ARRAY['Learning Opportunities', 'Mentorship', 'Health Insurance'],
    0,
    'student',
    true,
    true
  );

-- ============================================
-- EDUCATION RECORDS
-- ============================================

INSERT INTO education (candidate_id, institution, degree, field_of_study, start_date, end_date, current, grade, activities) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'University of Malaya', 'Bachelor of Computer Science', 'Software Engineering', '2019-09-01', '2023-06-30', false, 'CGPA 3.75/4.00', 'President of Computer Science Club, IEEE Student Member'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Universiti Sains Malaysia', 'Bachelor of Computer Science', 'Computer Science', '2020-09-01', '2024-06-30', false, 'CGPA 3.65/4.00', 'Google Developer Student Club Member, Hackathon Team Lead'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Universiti Teknologi Malaysia', 'Bachelor of Computer Science', 'Data Science', '2021-09-01', '2025-06-30', true, 'CGPA 3.80/4.00', 'AI Research Assistant, Data Science Society Vice President');

-- ============================================
-- EXPERIENCE RECORDS
-- ============================================

INSERT INTO experience (candidate_id, company, title, employment_type, location, start_date, end_date, current, description, skills_used) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'TechCorp Malaysia',
    'Full-Stack Developer',
    'full-time',
    'Kuala Lumpur',
    '2023-07-01',
    NULL,
    true,
    'Developing and maintaining e-commerce platform serving 100k+ users. Led migration from monolithic to microservices architecture. Implemented CI/CD pipelines and improved test coverage by 40%.',
    ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS']
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'StartupXYZ',
    'Software Engineering Intern',
    'internship',
    'Kuala Lumpur',
    '2022-06-01',
    '2022-08-31',
    false,
    'Built responsive web applications using React and Redux. Collaborated with design team to implement new UI components. Participated in agile development process.',
    ARRAY['React', 'Redux', 'JavaScript', 'HTML/CSS', 'Git']
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Mobile Solutions Sdn Bhd',
    'Mobile App Developer Intern',
    'internship',
    'Penang',
    '2023-06-01',
    '2023-08-31',
    false,
    'Developed features for customer-facing mobile application using React Native. Fixed bugs and improved app performance. Worked on payment integration and push notifications.',
    ARRAY['React Native', 'JavaScript', 'Firebase', 'REST APIs']
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'UTM AI Research Lab',
    'Research Assistant',
    'part-time',
    'Johor Bahru',
    '2024-01-01',
    NULL,
    true,
    'Assisting in machine learning research projects focused on natural language processing. Conducting literature reviews, preparing datasets, and implementing ML models using Python and TensorFlow.',
    ARRAY['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Data Analysis', 'Research']
  );

-- ============================================
-- SKILLS
-- ============================================

INSERT INTO candidate_skills (candidate_id, skill_name, skill_category, proficiency_level, years_of_experience) VALUES
  -- Sarah Chen's skills
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'JavaScript', 'technical', 'advanced', 3.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TypeScript', 'technical', 'advanced', 2.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'React', 'technical', 'advanced', 2.5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Node.js', 'technical', 'advanced', 2.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Python', 'technical', 'intermediate', 2.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PostgreSQL', 'technical', 'intermediate', 1.5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Docker', 'technical', 'intermediate', 1.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AWS', 'technical', 'beginner', 1.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Problem Solving', 'soft', 'advanced', 3.0),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Team Collaboration', 'soft', 'advanced', 2.0),
  
  -- Ahmad Razak's skills
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'JavaScript', 'technical', 'intermediate', 1.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'React Native', 'technical', 'intermediate', 1.0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Python', 'technical', 'intermediate', 2.0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Java', 'technical', 'intermediate', 2.0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Firebase', 'technical', 'beginner', 0.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Git', 'technical', 'intermediate', 2.0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Problem Solving', 'soft', 'advanced', 2.0),
  
  -- Mei Ling Tan's skills
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Python', 'technical', 'advanced', 2.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'TensorFlow', 'technical', 'intermediate', 1.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'PyTorch', 'technical', 'intermediate', 1.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Pandas', 'technical', 'advanced', 2.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'SQL', 'technical', 'intermediate', 1.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Machine Learning', 'technical', 'intermediate', 1.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Data Analysis', 'technical', 'advanced', 2.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Research', 'soft', 'intermediate', 1.0);

-- ============================================
-- EVENT REGISTRATIONS
-- ============================================

INSERT INTO event_registrations (event_id, candidate_id, team_name, registration_status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AI Innovators', 'confirmed'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Code Warriors', 'confirmed'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'FinTech Pioneers', 'confirmed'),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Digital Banking Squad', 'confirmed'),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'confirmed'),
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, 'confirmed');

-- ============================================
-- PROJECT SUBMISSIONS (Past Event)
-- ============================================

INSERT INTO project_submissions (
  event_id,
  candidate_id,
  project_title,
  project_description,
  github_url,
  demo_url,
  tech_stack,
  submission_status,
  ai_score,
  judge_score,
  final_score,
  rank,
  feedback
) VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Growth Strategy: Sustainable Fashion Marketplace',
    'Comprehensive growth strategy for an eco-friendly fashion e-commerce platform targeting Gen-Z consumers. Proposed multi-channel marketing approach, partnership with sustainable brands, and gamification features to increase user retention.',
    NULL,
    'https://docs.google.com/presentation/d/example1',
    ARRAY['Market Research', 'Business Strategy', 'Data Analysis'],
    'approved',
    87.5,
    90.0,
    88.75,
    1,
    'Excellent market analysis and actionable recommendations. Strong understanding of target audience. Winner!'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Data-Driven E-Commerce Optimization',
    'Analyzed user behavior data and proposed ML-based recommendation system, dynamic pricing strategy, and customer segmentation approach. Included ROI projections and implementation roadmap.',
    'https://github.com/meilingtan/ecommerce-analysis',
    'https://meilingtan.github.io/ecommerce-case',
    ARRAY['Python', 'Data Analysis', 'Machine Learning', 'Business Strategy'],
    'approved',
    85.0,
    82.5,
    83.75,
    3,
    'Strong technical approach with good data analysis. Could improve on business feasibility aspects.'
  );

-- ============================================
-- LEADERBOARDS
-- ============================================

INSERT INTO leaderboards (event_id, candidate_id, submission_id, rank, score) VALUES
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM project_submissions WHERE candidate_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND event_id = '33333333-3333-3333-3333-333333333333'), 1, 88.75),
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', (SELECT id FROM project_submissions WHERE candidate_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' AND event_id = '33333333-3333-3333-3333-333333333333'), 3, 83.75);

-- ============================================
-- DIGITAL BADGES
-- ============================================

INSERT INTO digital_badges (
  candidate_id,
  event_id,
  badge_type,
  badge_name,
  badge_description,
  qr_verification_url,
  metadata
) VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'winner',
    'E-Commerce Case Study Winner',
    'First place winner of the E-Commerce Growth Strategy Case Study Competition 2024',
    'https://verify.talentmatch.ai/badge/winner-ecommerce-2024-ahmad',
    '{"rank": 1, "total_participants": 75, "score": 88.75}'::jsonb
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'top_5_percent',
    'Top 5% - E-Commerce Case Study',
    'Ranked in top 5% of E-Commerce Growth Strategy Case Study Competition 2024',
    'https://verify.talentmatch.ai/badge/top5-ecommerce-2024-meiling',
    '{"rank": 3, "total_participants": 75, "score": 83.75, "percentile": 96}'::jsonb
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NULL,
    'participant',
    'Hackathon Enthusiast',
    'Active participant in multiple TalentMatch hackathons and challenges',
    'https://verify.talentmatch.ai/badge/participant-sarah',
    '{"events_participated": 5, "total_submissions": 4}'::jsonb
  );

-- ============================================
-- VIRTUAL HIRING PANEL REVIEWS (Sample)
-- ============================================

INSERT INTO panel_reviews (
  candidate_id,
  job_id,
  overall_score,
  overall_verdict,
  hr_score,
  hr_verdict,
  hr_justification,
  hr_pros,
  hr_cons,
  tech_score,
  tech_verdict,
  tech_justification,
  tech_pros,
  tech_cons,
  coach_score,
  coach_verdict,
  coach_justification,
  coach_pros,
  coach_cons
) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NULL, -- Mock job ID
    85.0,
    'Strong fit',
    82.0,
    'Strong fit',
    'Candidate demonstrates excellent cultural alignment and communication skills. Experience level matches the role requirements. Salary expectations are within budget.',
    ARRAY['Strong communication skills', '2 years relevant experience', 'Team player mentality', 'Proven track record'],
    ARRAY['Limited experience with AWS', 'Notice period of 30 days'],
    88.0,
    'Strong fit',
    'Solid technical foundation with hands-on experience in required tech stack. GitHub contributions show good coding practices. Successfully led technical migration project.',
    ARRAY['Advanced React and Node.js skills', 'Microservices experience', 'Active open-source contributor', 'CI/CD implementation experience'],
    ARRAY['Limited AWS expertise', 'Could benefit from more system design experience'],
    85.0,
    'Strong fit',
    'Career trajectory shows steady growth and learning. Taking on leadership responsibilities early in career. Hackathon participation demonstrates initiative and passion.',
    ARRAY['Continuous learning mindset', 'Leadership potential', 'Diverse project experience'],
    ARRAY['May need mentorship on scaling systems', 'Limited cloud infrastructure exposure']
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    NULL,
    72.0,
    'Reach role',
    75.0,
    'Reach role',
    'Fresh graduate with strong academic background. Enthusiastic and willing to learn. Salary expectations are reasonable. However, lacks professional experience.',
    ARRAY['Strong academic record', 'Multiple internships', 'Excellent communication', 'Quick learner'],
    ARRAY['No full-time experience', 'May need extensive onboarding'],
    70.0,
    'Reach role',
    'Good foundational knowledge from education and internships. Mobile development experience is valuable. However, limited exposure to production systems and lacks backend depth.',
    ARRAY['Mobile development skills', 'Good problem-solving', 'Hackathon winner shows initiative'],
    ARRAY['Limited backend experience', 'No production system experience', 'Needs mentorship on best practices'],
    71.0,
    'Reach role',
    'Shows great potential and learning agility. Hackathon success demonstrates ability to perform under pressure. This could be a great growth opportunity for both candidate and company.',
    ARRAY['High potential', 'Proven problem-solver', 'Adaptable and motivated'],
    ARRAY['Needs structured mentorship program', 'Career still in early stages']
  );

-- ============================================
-- REVERSE RECRUITER AGENT MATCHES (Sample)
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
) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000001', -- Mock job ID
    92.5,
    'Strong alignment: Your React, Node.js, and TypeScript skills directly match 5 of 6 required skills. Your microservices experience is particularly relevant.',
    'Excellent match: Offered salary range RM 7,000-9,000 exceeds your minimum of RM 6,000.',
    'Great benefits match: Company offers health insurance, flexible hours, remote work options, and RM 5,000 annual learning budget - all in your preferences.',
    'Perfect location: Position is in Kuala Lumpur with hybrid remote option, matching your preferred locations.',
    'new'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000002',
    85.0,
    'Good alignment: Your full-stack skills match the role requirements. React and Node.js are core to their tech stack.',
    'Good match: Salary range RM 6,500-8,500 aligns with your expectations.',
    'Partial match: Offers health insurance and flexible hours, but no explicit remote work policy.',
    'Acceptable: Singapore-based role with relocation package. You listed Singapore as a preferred location.',
    'viewed'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '10000000-0000-0000-0000-000000000003',
    88.0,
    'Excellent match: Your Python, TensorFlow, and data analysis skills perfectly align with their data science role requirements.',
    'Good match: Entry-level salary RM 4,500-6,000 is above your minimum of RM 3,500.',
    'Strong benefits: Company emphasizes mentorship program and learning opportunities, which are your top priorities.',
    'Perfect fit: Role is in Kuala Lumpur with option for remote work.',
    'new'
  );

-- ============================================
-- AI INTERVIEW TRANSCRIPTS (Sample)
-- ============================================

INSERT INTO ai_interviews (
  candidate_id,
  interview_type,
  transcript,
  ai_summary,
  key_insights,
  duration_seconds
) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'technical',
    '[
      {"speaker": "AI", "content": "Hello Sarah! Thanks for joining. Can you start by telling me about a challenging technical problem you solved recently?", "timestamp": "00:00:05"},
      {"speaker": "Candidate", "content": "Sure! Recently, I led our team in migrating from a monolithic architecture to microservices. The main challenge was ensuring zero downtime during the transition while maintaining data consistency.", "timestamp": "00:00:15"},
      {"speaker": "AI", "content": "That sounds complex. How did you approach the data consistency challenge?", "timestamp": "00:00:35"},
      {"speaker": "Candidate", "content": "We implemented an event-driven architecture using message queues. Each service published events, and we used saga patterns for distributed transactions. We also set up comprehensive monitoring.", "timestamp": "00:00:45"},
      {"speaker": "AI", "content": "Excellent approach. Can you walk me through how you would design a rate limiting system?", "timestamp": "00:01:20"},
      {"speaker": "Candidate", "content": "I would use a token bucket algorithm with Redis for distributed rate limiting. Each user gets a bucket with tokens that replenish over time...", "timestamp": "00:01:30"}
    ]'::jsonb,
    'Sarah demonstrated strong technical knowledge and problem-solving abilities. She has hands-on experience with microservices architecture, event-driven systems, and distributed computing concepts. Her explanation of the migration project shows leadership and strategic thinking. Technical communication is clear and well-structured.',
    '{
      "strengths": ["Microservices architecture", "System design", "Problem-solving", "Clear communication"],
      "experience_level": "Mid-level with strong fundamentals",
      "technical_depth": "Advanced in web technologies, good understanding of distributed systems",
      "recommendation": "Strong candidate for senior/lead positions"
    }'::jsonb,
    1200
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'behavioral',
    '[
      {"speaker": "AI", "content": "Hi Ahmad! Tell me about a time you faced a difficult team situation and how you handled it.", "timestamp": "00:00:05"},
      {"speaker": "Candidate", "content": "During our university hackathon, our team had disagreements on the technical approach. Two members wanted different frameworks.", "timestamp": "00:00:15"},
      {"speaker": "AI", "content": "How did you resolve this?", "timestamp": "00:00:30"},
      {"speaker": "Candidate", "content": "I organized a meeting where each person presented their approach with pros and cons. We evaluated based on project requirements and learning opportunities. We chose React Native because it was new to all of us and matched our goal to learn.", "timestamp": "00:00:40"},
      {"speaker": "AI", "content": "That shows good leadership. What was the outcome?", "timestamp": "00:01:05"},
      {"speaker": "Candidate", "content": "We won the hackathon! More importantly, the team remained cohesive and we all learned something new. We still work on projects together.", "timestamp": "00:01:15"}
    ]'::jsonb,
    'Ahmad shows strong teamwork and conflict resolution skills. Despite being a fresh graduate, he demonstrates leadership potential and the ability to facilitate collaborative decision-making. His focus on both project goals and team learning shows maturity. Good cultural fit for collaborative environments.',
    '{
      "strengths": ["Teamwork", "Leadership potential", "Conflict resolution", "Learning mindset"],
      "experience_level": "Entry-level with leadership experience",
      "soft_skills": "Strong collaboration and communication",
      "recommendation": "Good candidate for junior roles with growth potential"
    }'::jsonb,
    900
  );

-- ============================================
-- NOTES FOR SETUP
-- ============================================

-- After running this seed script:
-- 1. Create actual users in Supabase Auth Dashboard
-- 2. Update the user_id fields in candidate_profiles with real auth.users IDs
-- 3. Create corresponding .env.local file with your Supabase credentials
-- 4. The mock data uses placeholder UUIDs - replace with actual IDs from your database




