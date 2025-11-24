-- Add more diverse events to the database
-- Run this in your Supabase SQL Editor

INSERT INTO events (
  id,
  title,
  description,
  event_type,
  start_date,
  end_date,
  registration_deadline,
  max_participants,
  status,
  prize_pool,
  tags,
  judging_criteria
) VALUES
  (
    uuid_generate_v4(),
    'Sustainable Brand Strategy Challenge',
    'Develop a comprehensive digital marketing campaign for a leading eco-friendly fashion brand. Focus on Gen Z engagement, social media strategy, and sustainable messaging.',
    'business_challenge',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '20 days',
    NOW() + INTERVAL '3 days',
    200,
    'open',
    8000.00,
    ARRAY['Marketing', 'Branding', 'Social Media', 'Sustainability'],
    '{"creativity": 30, "strategy": 30, "market_research": 20, "presentation": 20}'::jsonb
  ),
  (
    uuid_generate_v4(),
    'Forensic Accounting Case Competition',
    'Investigate a complex set of financial statements to identify irregularities and potential fraud. Prepare a forensic audit report and present your findings to a panel of experts.',
    'case_study',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '15 days',
    NOW() + INTERVAL '8 days',
    100,
    'open',
    12000.00,
    ARRAY['Accounting', 'Finance', 'Audit', 'Forensics'],
    '{"accuracy": 40, "methodology": 30, "reporting": 20, "presentation": 10}'::jsonb
  ),
  (
    uuid_generate_v4(),
    'Smart Grid Innovation Hackathon',
    'Design and simulate next-generation smart grid solutions for efficient energy distribution. Challenge covers renewable integration, load balancing, and IoT implementation.',
    'hackathon',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '16 days',
    NOW() + INTERVAL '12 days',
    150,
    'open',
    25000.00,
    ARRAY['Electrical Engineering', 'IoT', 'Energy', 'Sustainability'],
    '{"technical_design": 40, "innovation": 30, "feasibility": 20, "impact": 10}'::jsonb
  );

