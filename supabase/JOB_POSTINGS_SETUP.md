# Job Postings and Matches Setup Guide

## Overview
This guide explains how to set up 10 dummy job postings with agent matches in your Supabase database for testing the job matches feature.

## What's Included

### Job Postings Table
A comprehensive `job_postings` table with:
- Company information
- Job details (title, description, requirements)
- Salary ranges and benefits
- Location and remote work policies
- Skills requirements
- Application deadlines

### 10 Diverse Job Postings

1. **Senior Full-Stack Developer** - TechVenture Malaysia
   - Location: Kuala Lumpur (Hybrid)
   - Salary: RM 7,000-9,000
   - Skills: React, Node.js, TypeScript, PostgreSQL, Docker, Microservices

2. **Frontend Developer** - Digital Solutions SG
   - Location: Singapore (On-site)
   - Salary: RM 6,500-8,500
   - Skills: React, JavaScript, HTML/CSS, Redux

3. **Junior Data Scientist** - FinTech Innovations
   - Location: Kuala Lumpur (Hybrid)
   - Salary: RM 4,500-6,000
   - Skills: Python, Machine Learning, Data Analysis, SQL

4. **React Native Developer** - Mobile First Sdn Bhd
   - Location: Penang (Fully Remote)
   - Salary: RM 5,000-7,000
   - Skills: React Native, JavaScript, Mobile Development

5. **Backend Engineer** - CloudScale Technologies
   - Location: Kuala Lumpur (Hybrid)
   - Salary: RM 6,000-8,000
   - Skills: Node.js, Python, PostgreSQL, Docker

6. **DevOps Engineer** - Infrastructure Pro
   - Location: Kuala Lumpur (Hybrid)
   - Salary: RM 7,000-9,500
   - Skills: AWS, Docker, Kubernetes, CI/CD, Terraform

7. **Product Designer (Frontend)** - Design Studio KL
   - Location: Kuala Lumpur (Hybrid)
   - Salary: RM 5,500-7,500
   - Skills: HTML/CSS, JavaScript, React, Figma, UI/UX Design

8. **Machine Learning Engineer** - AI Labs Malaysia
   - Location: Kuala Lumpur (Hybrid)
   - Salary: RM 7,500-10,000
   - Skills: Python, TensorFlow, PyTorch, Deep Learning

9. **Software Engineering Intern** - StartUp Accelerator
   - Location: Kuala Lumpur (Hybrid)
   - Salary: RM 2,500-3,500
   - Skills: JavaScript, React, Git

10. **Full-Stack Developer (Sustainability Tech)** - GreenTech Solutions
    - Location: Kuala Lumpur (Fully Remote)
    - Salary: RM 5,000-7,000
    - Skills: React, Node.js, MongoDB

### Agent Matches
Pre-configured matches linking the jobs to existing candidate profiles with:
- Match scores (75% - 92.5%)
- Skills match explanations
- Salary alignment explanations
- Benefits match explanations
- Location fit explanations
- Different statuses: new, viewed, applied

## Setup Instructions

### Method 1: Supabase Dashboard (Recommended)

1. Open your Supabase project at https://app.supabase.com
2. Navigate to the **SQL Editor** tab
3. Click **New Query**
4. Copy the entire contents of `supabase/create_jobs_and_matches.sql`
5. Paste into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`

### Method 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Connect to your project
supabase login
supabase link --project-ref your-project-ref

# Apply the SQL file
supabase db push
```

### Method 3: Direct PostgreSQL Connection

If you have direct database access:

```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" -f supabase/create_jobs_and_matches.sql
```

## Prerequisites

Before running the SQL script, make sure:

1. ✅ You have run `supabase/schema.sql` to create the base tables
2. ✅ You have run `supabase/seed.sql` to create candidate profiles
3. ✅ You have created at least one user in Supabase Auth

## Verification

After running the script, verify the data:

```sql
-- Check job postings
SELECT id, company_name, job_title, location, salary_min_rm, salary_max_rm 
FROM job_postings 
ORDER BY created_at DESC;

-- Check agent matches
SELECT 
  am.match_score,
  am.match_status,
  jp.job_title,
  jp.company_name
FROM agent_matches am
JOIN job_postings jp ON am.job_id = jp.id
ORDER BY am.created_at DESC;

-- Count matches by status
SELECT match_status, COUNT(*) 
FROM agent_matches 
GROUP BY match_status;
```

## Expected Results

After setup, you should see:
- ✅ 10 job postings in the `job_postings` table
- ✅ 10 agent matches linking jobs to candidates
- ✅ Matches with various statuses (new, viewed)
- ✅ Jobs visible on the `/dashboard/job-matches` page

## Testing the Feature

1. Log in to your application as one of the seeded users
2. Navigate to **Job Matches** in the dashboard
3. You should see:
   - Statistics showing number of new, viewed, and applied matches
   - Job cards with company name, title, location
   - Match scores and explanations
   - Required skills badges
   - Salary ranges

## Customization

### Adding More Jobs

To add more jobs, use this template:

```sql
INSERT INTO job_postings (
  company_name, job_title, job_description,
  required_skills, salary_min_rm, salary_max_rm,
  benefits, location, remote_policy, employment_type, status
) VALUES (
  'Your Company',
  'Job Title',
  'Job description...',
  ARRAY['Skill1', 'Skill2', 'Skill3'],
  5000.00, 7000.00,
  ARRAY['Benefit1', 'Benefit2'],
  'Location',
  'hybrid',
  'full-time',
  'active'
);
```

### Creating New Matches

```sql
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
  'your-candidate-id',
  'your-job-id',
  85.0,
  'Skills explanation...',
  'Salary explanation...',
  'Benefits explanation...',
  'Location explanation...',
  'new'
);
```

## Troubleshooting

### "relation job_postings does not exist"
- Make sure you run the entire SQL script which creates the table first

### "foreign key violation on candidate_id"
- Ensure candidate profiles exist (run `supabase/seed.sql` first)
- Update candidate IDs in the script to match your actual profile IDs

### Matches not showing up
- Check that the logged-in user has a candidate profile
- Verify the profile ID matches the candidate_id in agent_matches
- Check RLS policies are properly configured

### To reset and start over

```sql
-- Delete all matches and jobs
DELETE FROM agent_matches;
DELETE FROM job_postings;

-- Then re-run the script
```

## Next Steps

- **Add more jobs**: Create additional job postings for your specific test cases
- **Test matching logic**: Implement the actual AI matching algorithm
- **Add job details page**: Create a detailed view for each job posting
- **Implement actions**: Add "Apply", "Not Interested", "Save" functionality
- **Add filters**: Allow filtering by location, salary, skills, etc.

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Verify all prerequisite tables exist
3. Ensure RLS policies allow the operations
4. Check that user authentication is working

---

Created for TalentMatch - Reverse Recruiter Feature
Last Updated: November 23, 2025

