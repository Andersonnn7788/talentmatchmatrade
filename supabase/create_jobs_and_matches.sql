-- ============================================
-- CREATE JOB POSTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  company_logo_url TEXT,
  job_title VARCHAR(255) NOT NULL,
  job_description TEXT NOT NULL,
  
  -- Requirements
  required_skills TEXT[] NOT NULL,
  preferred_skills TEXT[],
  min_years_experience INTEGER,
  education_level VARCHAR(100),
  
  -- Compensation & Benefits
  salary_min_rm DECIMAL(10,2),
  salary_max_rm DECIMAL(10,2),
  salary_currency VARCHAR(10) DEFAULT 'MYR',
  benefits TEXT[],
  
  -- Location & Work Arrangement
  location VARCHAR(255) NOT NULL,
  remote_policy VARCHAR(50), -- on-site, hybrid, fully-remote
  
  -- Job Details
  employment_type VARCHAR(50) NOT NULL, -- full-time, part-time, contract, internship
  industry VARCHAR(100),
  department VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, closed, draft
  posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  application_deadline TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - anyone can view active jobs
CREATE POLICY "Anyone can view active jobs"
  ON job_postings FOR SELECT
  USING (status = 'active');

-- Add index for performance
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_location ON job_postings(location);
CREATE INDEX idx_job_postings_posted_date ON job_postings(posted_date DESC);

-- ============================================
-- INSERT 10 DUMMY JOB POSTINGS
-- ============================================

INSERT INTO job_postings (
  id,
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
  status,
  application_deadline
) VALUES
  -- Job 1: Senior Full-Stack Developer
  (
    '10000000-0000-0000-0000-000000000001',
    'TechVenture Malaysia',
    'Senior Full-Stack Developer',
    'Join our dynamic team building next-generation e-commerce solutions. You will work on scalable microservices, lead technical initiatives, and mentor junior developers. We are looking for someone passionate about clean code, modern architecture, and continuous improvement.',
    ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Microservices'],
    ARRAY['AWS', 'Kubernetes', 'Redis', 'GraphQL', 'CI/CD'],
    3,
    'Bachelor in Computer Science or related field',
    7000.00,
    9000.00,
    ARRAY['Health Insurance', 'Flexible Hours', 'Remote Work Options', 'Annual Learning Budget RM 5,000', 'Performance Bonus', '18 Days Annual Leave'],
    'Kuala Lumpur',
    'hybrid',
    'full-time',
    'Technology/E-Commerce',
    'Engineering',
    'active',
    '2025-12-31 23:59:59+08'
  ),
  
  -- Job 2: Frontend Developer
  (
    '10000000-0000-0000-0000-000000000002',
    'Digital Solutions SG',
    'Frontend Developer',
    'We are seeking a talented Frontend Developer to create beautiful, responsive web applications. You will collaborate with designers and backend engineers to deliver exceptional user experiences. Our tech stack is modern and our culture values innovation and quality.',
    ARRAY['React', 'JavaScript', 'HTML/CSS', 'Redux', 'Git'],
    ARRAY['TypeScript', 'Next.js', 'Tailwind CSS', 'Testing Library'],
    2,
    'Bachelor in Computer Science or equivalent experience',
    6500.00,
    8500.00,
    ARRAY['Health Insurance', 'Flexible Working Hours', 'Professional Development Budget', 'Gym Membership', 'Team Building Events'],
    'Singapore',
    'on-site',
    'full-time',
    'Technology/Software',
    'Product Development',
    'active',
    '2025-12-15 23:59:59+08'
  ),
  
  -- Job 3: Data Scientist (Entry Level)
  (
    '10000000-0000-0000-0000-000000000003',
    'FinTech Innovations',
    'Junior Data Scientist',
    'Start your data science career with us! You will work on machine learning models for financial predictions, fraud detection, and customer analytics. We provide excellent mentorship and learning opportunities in a supportive environment.',
    ARRAY['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'Statistics'],
    ARRAY['TensorFlow', 'PyTorch', 'Pandas', 'Scikit-learn', 'Tableau'],
    0,
    'Bachelor in Data Science, Computer Science, Statistics, or related field',
    4500.00,
    6000.00,
    ARRAY['Health Insurance', 'Mentorship Program', 'Training & Certification Budget', 'Flexible Hours', 'Work from Home Options'],
    'Kuala Lumpur',
    'hybrid',
    'full-time',
    'Financial Technology',
    'Data Analytics',
    'active',
    '2025-12-20 23:59:59+08'
  ),
  
  -- Job 4: Mobile App Developer
  (
    '10000000-0000-0000-0000-000000000004',
    'Mobile First Sdn Bhd',
    'React Native Developer',
    'Build cross-platform mobile applications used by millions of users across Southeast Asia. You will work on feature development, performance optimization, and collaborate with product teams to deliver outstanding mobile experiences.',
    ARRAY['React Native', 'JavaScript', 'Mobile Development', 'REST APIs', 'Git'],
    ARRAY['TypeScript', 'Redux', 'Firebase', 'App Store Deployment', 'CI/CD'],
    1,
    'Bachelor in Computer Science or related field',
    5000.00,
    7000.00,
    ARRAY['Health & Dental Insurance', 'Remote Work', 'MacBook Pro', 'Annual Bonus', 'Learning Budget RM 3,000'],
    'Penang',
    'fully-remote',
    'full-time',
    'Technology/Mobile Apps',
    'Engineering',
    'active',
    '2026-01-10 23:59:59+08'
  ),
  
  -- Job 5: Backend Engineer
  (
    '10000000-0000-0000-0000-000000000005',
    'CloudScale Technologies',
    'Backend Engineer',
    'Design and build scalable backend systems that power our SaaS platform. You will work with microservices architecture, distributed systems, and cloud technologies. We value engineering excellence and innovative problem-solving.',
    ARRAY['Node.js', 'Python', 'PostgreSQL', 'RESTful APIs', 'Docker'],
    ARRAY['Microservices', 'AWS', 'Kubernetes', 'MongoDB', 'Message Queues'],
    2,
    'Bachelor in Computer Science or equivalent',
    6000.00,
    8000.00,
    ARRAY['Comprehensive Health Coverage', 'Stock Options', 'Flexible Hours', 'Home Office Setup', 'Conference Attendance'],
    'Kuala Lumpur',
    'hybrid',
    'full-time',
    'SaaS/Cloud Computing',
    'Backend Engineering',
    'active',
    '2025-12-25 23:59:59+08'
  ),
  
  -- Job 6: DevOps Engineer
  (
    '10000000-0000-0000-0000-000000000006',
    'Infrastructure Pro',
    'DevOps Engineer',
    'Join our infrastructure team to automate, optimize, and scale our cloud infrastructure. You will implement CI/CD pipelines, manage Kubernetes clusters, and ensure high availability of our services.',
    ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
    ARRAY['Jenkins', 'GitLab CI', 'Monitoring Tools', 'Python', 'Ansible'],
    2,
    'Bachelor in Computer Science or related field',
    7000.00,
    9500.00,
    ARRAY['Health Insurance', 'Remote Work', 'AWS Certification Support', 'Performance Bonus', 'Flexible Schedule'],
    'Kuala Lumpur',
    'hybrid',
    'full-time',
    'Technology/Cloud Services',
    'Infrastructure',
    'active',
    '2026-01-15 23:59:59+08'
  ),
  
  -- Job 7: UI/UX Designer who codes
  (
    '10000000-0000-0000-0000-000000000007',
    'Design Studio KL',
    'Product Designer (Frontend)',
    'Unique role combining design and development. Design beautiful interfaces and bring them to life with code. You will own the entire design-to-development process for key features of our product.',
    ARRAY['HTML/CSS', 'JavaScript', 'React', 'Figma', 'UI/UX Design'],
    ARRAY['Tailwind CSS', 'TypeScript', 'Animation Libraries', 'Design Systems'],
    2,
    'Bachelor in Design, Computer Science, or related field',
    5500.00,
    7500.00,
    ARRAY['Health Insurance', 'Creative Freedom', 'Flexible Hours', 'Design Tools Subscription', 'Team Outings'],
    'Kuala Lumpur',
    'hybrid',
    'full-time',
    'Technology/Design',
    'Product Design',
    'active',
    '2025-12-28 23:59:59+08'
  ),
  
  -- Job 8: AI/ML Engineer
  (
    '10000000-0000-0000-0000-000000000008',
    'AI Labs Malaysia',
    'Machine Learning Engineer',
    'Work on cutting-edge AI projects involving NLP, computer vision, and recommendation systems. You will train models, deploy them to production, and continuously improve their performance. Research-oriented environment with access to latest technologies.',
    ARRAY['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
    ARRAY['NLP', 'Computer Vision', 'MLOps', 'Docker', 'Cloud Platforms'],
    1,
    'Master in Computer Science, AI, or related field preferred',
    7500.00,
    10000.00,
    ARRAY['Competitive Salary', 'Health Insurance', 'Research Time', 'Conference Budget', 'GPU Workstations', 'Flexible Hours'],
    'Kuala Lumpur',
    'hybrid',
    'full-time',
    'Artificial Intelligence',
    'Research & Development',
    'active',
    '2026-01-20 23:59:59+08'
  ),
  
  -- Job 9: Software Engineering Intern
  (
    '10000000-0000-0000-0000-000000000009',
    'StartUp Accelerator',
    'Software Engineering Intern',
    'Kickstart your tech career! Work on real projects, learn from experienced engineers, and gain hands-on experience with modern technologies. Perfect for students or recent graduates looking to break into the industry.',
    ARRAY['JavaScript', 'React', 'Git', 'Problem Solving'],
    ARRAY['Node.js', 'Python', 'SQL', 'Any backend language'],
    0,
    'Currently pursuing or recently completed degree in Computer Science',
    2500.00,
    3500.00,
    ARRAY['Mentorship Program', 'Learning Resources', 'Flexible Hours', 'Potential Full-time Offer', 'Team Events'],
    'Kuala Lumpur',
    'hybrid',
    'internship',
    'Technology/Startup',
    'Engineering',
    'active',
    '2025-12-10 23:59:59+08'
  ),
  
  -- Job 10: Full-Stack Developer (Startup)
  (
    '10000000-0000-0000-0000-000000000010',
    'GreenTech Solutions',
    'Full-Stack Developer (Sustainability Tech)',
    'Join our mission to fight climate change through technology! Build applications that help businesses track and reduce their carbon footprint. Fast-paced startup environment with significant impact potential and growth opportunities.',
    ARRAY['React', 'Node.js', 'MongoDB', 'JavaScript', 'REST APIs'],
    ARRAY['TypeScript', 'AWS', 'GraphQL', 'Data Visualization', 'IoT'],
    1,
    'Bachelor in Computer Science or related field',
    5000.00,
    7000.00,
    ARRAY['Equity/Stock Options', 'Health Insurance', 'Flexible Hours', 'Remote Work', 'Purpose-Driven Mission', 'Learning Budget'],
    'Kuala Lumpur',
    'fully-remote',
    'full-time',
    'CleanTech/Sustainability',
    'Product Engineering',
    'active',
    '2026-01-05 23:59:59+08'
  );

-- ============================================
-- CREATE AGENT MATCHES FOR CANDIDATE
-- ============================================
-- Note: Replace 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' with actual candidate_id from your database
-- This assumes the candidate profile from seed.sql exists

-- First, let's create matches for the main candidate (Sarah Chen)
INSERT INTO agent_matches (
  candidate_id,
  job_id,
  match_score,
  skills_match_explanation,
  salary_alignment_explanation,
  benefits_match_explanation,
  location_fit_explanation,
  match_status,
  created_at
) VALUES
  -- Match 1: Senior Full-Stack Developer (92.5% match)
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000001',
    92.5,
    'Strong alignment: Your React, Node.js, and TypeScript skills directly match 5 of 6 required skills. Your microservices experience is particularly relevant.',
    'Excellent match: Offered salary range RM 7,000-9,000 exceeds your minimum of RM 6,000.',
    'Great benefits match: Company offers health insurance, flexible hours, remote work options, and RM 5,000 annual learning budget - all in your preferences.',
    'Perfect location: Position is in Kuala Lumpur with hybrid remote option, matching your preferred locations.',
    'new',
    NOW() - INTERVAL '2 hours'
  ),
  
  -- Match 2: Frontend Developer (85% match) - VIEWED
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000002',
    85.0,
    'Good alignment: Your full-stack skills match the role requirements. React and JavaScript expertise aligns perfectly with their needs.',
    'Good match: Salary range RM 6,500-8,500 aligns with your expectations.',
    'Partial match: Offers health insurance and flexible hours, but no explicit remote work policy.',
    'Acceptable: Singapore-based role with relocation support available. You listed Singapore as a preferred location.',
    'viewed',
    NOW() - INTERVAL '1 day'
  ),
  
  -- Match 3: Backend Engineer (88% match)
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000005',
    88.0,
    'Strong match: Your Node.js, PostgreSQL, and Docker skills align well. Your microservices migration experience is highly relevant.',
    'Excellent match: Salary range RM 6,000-8,000 meets your expectations with stock options as bonus.',
    'Good benefits: Comprehensive health coverage, flexible hours, and home office setup match your preferences.',
    'Perfect fit: Kuala Lumpur location with hybrid work arrangement.',
    'new',
    NOW() - INTERVAL '5 hours'
  ),
  
  -- Match 4: DevOps Engineer (78% match)
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000006',
    78.0,
    'Moderate match: Your Docker and CI/CD implementation experience is relevant. However, role requires stronger AWS and Kubernetes expertise than you currently have.',
    'Excellent match: Salary RM 7,000-9,500 exceeds your expectations with certification support.',
    'Great benefits: Remote work, AWS certification support, flexible schedule align with your preferences.',
    'Perfect location: Kuala Lumpur with hybrid arrangement.',
    'new',
    NOW() - INTERVAL '1 day'
  ),
  
  -- Match 5: Product Designer (Frontend) (82% match)
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000007',
    82.0,
    'Good technical match: Your React, JavaScript, and CSS skills are strong. This role uniquely blends development with design - could be interesting career direction.',
    'Good match: Salary RM 5,500-7,500 is within acceptable range, slightly below your current expectations.',
    'Solid benefits: Health insurance, flexible hours, creative freedom, and team outings provided.',
    'Perfect location: Kuala Lumpur with hybrid work model.',
    'new',
    NOW() - INTERVAL '3 days'
  ),
  
  -- Match 6: Full-Stack Developer at GreenTech (90% match)
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000010',
    90.0,
    'Excellent match: Your React and Node.js expertise directly matches requirements. Your experience level is perfect for this role.',
    'Good match: Salary RM 5,000-7,000 meets minimum with equity upside potential.',
    'Strong benefits: Equity options, remote work, flexible hours, plus purpose-driven mission adds non-monetary value.',
    'Perfect fit: Fully remote position with KL team - matches your remote work preference.',
    'new',
    NOW() - INTERVAL '6 hours'
  );

-- Create a few matches for Ahmad (fresh grad) if his profile exists
INSERT INTO agent_matches (
  candidate_id,
  job_id,
  match_score,
  skills_match_explanation,
  salary_alignment_explanation,
  benefits_match_explanation,
  location_fit_explanation,
  match_status,
  created_at
) VALUES
  -- Match for Mobile Developer
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '10000000-0000-0000-0000-000000000004',
    88.0,
    'Strong match: Your React Native and JavaScript skills directly align with requirements. Your internship experience in mobile development is valuable.',
    'Excellent match: Salary RM 5,000-7,000 exceeds your minimum of RM 4,500.',
    'Perfect benefits: Remote work, learning budget, and MacBook Pro align with your preferences.',
    'Great location: Based in Penang (your location) and fully remote.',
    'new',
    NOW() - INTERVAL '4 hours'
  ),
  
  -- Match for Internship
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '10000000-0000-0000-0000-000000000009',
    75.0,
    'Good match: Your JavaScript and React skills match requirements. Great opportunity to gain experience and potentially secure full-time offer.',
    'Fair match: Internship salary RM 2,500-3,500 is below your desired minimum, but offers full-time conversion potential.',
    'Strong benefits: Mentorship program and learning resources are excellent for career development.',
    'Perfect location: Kuala Lumpur with hybrid arrangement, near major opportunities.',
    'viewed',
    NOW() - INTERVAL '2 days'
  );

-- Create matches for Mei Ling (data science student)
INSERT INTO agent_matches (
  candidate_id,
  job_id,
  match_score,
  skills_match_explanation,
  salary_alignment_explanation,
  benefits_match_explanation,
  location_fit_explanation,
  match_status,
  created_at
) VALUES
  -- Match for Junior Data Scientist
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '10000000-0000-0000-0000-000000000003',
    88.0,
    'Excellent match: Your Python, TensorFlow, and data analysis skills perfectly align with their data science role requirements.',
    'Great match: Entry-level salary RM 4,500-6,000 exceeds your minimum of RM 3,500.',
    'Perfect benefits: Mentorship program and training budget are exactly what you prioritized.',
    'Perfect fit: Kuala Lumpur location with hybrid remote work option.',
    'new',
    NOW() - INTERVAL '3 hours'
  ),
  
  -- Match for ML Engineer
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '10000000-0000-0000-0000-000000000008',
    92.0,
    'Outstanding match: Your Python, TensorFlow, PyTorch, and research experience align perfectly. Your research assistant role shows you can handle research-oriented work.',
    'Excellent match: Salary RM 7,500-10,000 far exceeds expectations and reflects your strong research background.',
    'Exceptional benefits: Research time, conference budget, and GPU workstations provide ideal learning environment.',
    'Perfect location: Kuala Lumpur with hybrid flexibility.',
    'new',
    NOW() - INTERVAL '1 hour'
  );

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- Jobs and matches created successfully!
-- To view: SELECT * FROM job_postings;
-- To view matches: SELECT * FROM agent_matches ORDER BY created_at DESC;

