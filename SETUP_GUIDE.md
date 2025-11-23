# TalentMatch Setup Guide

This guide will walk you through setting up the TalentMatch candidate side frontend with Supabase authentication and mock data.

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 20 or higher installed
- npm or yarn package manager
- A Supabase account (free tier works fine)
- A code editor (VS Code recommended)

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 16 with App Router
- React 19
- Supabase client libraries (@supabase/supabase-js, @supabase/ssr)
- Tailwind CSS 4
- TypeScript

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if you don't have one)
4. Click "New Project"
5. Fill in:
   - Project name: `talentmatch` (or your preferred name)
   - Database password: (save this somewhere safe!)
   - Region: Choose closest to your location
   - Pricing plan: Free tier is sufficient
6. Click "Create new project"
7. Wait 2-3 minutes for setup to complete

### Step 3: Set Up Database Schema

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Open the `supabase/schema.sql` file in your code editor
4. Copy the entire contents
5. Paste into the Supabase SQL Editor
6. Click "Run" (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned" - this is correct!

**What this creates:**
- All necessary tables (candidate_profiles, education, experience, etc.)
- Row Level Security (RLS) policies
- Database indexes for performance
- Triggers for automatic timestamp updates

### Step 4: Configure Environment Variables

1. In Supabase dashboard, click "Settings" → "API"
2. Copy your "Project URL" and "anon public" key
3. Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Replace with your actual values
5. Save the file

**Important:** Never commit `.env.local` to git (it's already in `.gitignore`)

### Step 5: Insert Mock Data (Optional but Recommended)

1. In Supabase SQL Editor, create another new query
2. Open `supabase/seed.sql` in your code editor
3. Copy the entire contents
4. Paste into the Supabase SQL Editor
5. Click "Run"
6. You should see "Success. No rows returned"

**What this creates:**
- 3 sample events (AI Hackathon, Fintech Challenge, E-Commerce Case Study)
- 3 candidate profiles (Sarah Chen, Ahmad Razak, Mei Ling Tan)
- Education and experience records
- Skills data
- Project submissions with scores
- Digital badges
- Panel reviews
- Job matches
- AI interview transcripts

### Step 6: Create Real Auth Users

The mock data uses placeholder user IDs. To test the app properly:

1. In Supabase dashboard, go to "Authentication" → "Users"
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: `sarah.chen@example.com`
   - Password: `Password123!`
   - Auto Confirm User: ✓ (checked)
4. Click "Create user"
5. Copy the user's UUID
6. Go back to SQL Editor
7. Run this query (replace the UUID):

```sql
UPDATE candidate_profiles 
SET user_id = 'paste-real-uuid-here'
WHERE email = 'sarah.chen@example.com';
```

8. Repeat for other test users if needed

### Step 7: Run the Development Server

```bash
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000)

### Step 8: Test the Application

1. **Home Page**: Open [http://localhost:3000](http://localhost:3000)
   - You should see the landing page with features

2. **Sign Up**: Click "Sign Up"
   - Create a new account
   - After signup, you'll be redirected to the dashboard

3. **Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - View your profile overview
   - See stats (job matches, badges, events)

4. **Profile Management**: Click "Profile" in navigation
   - Update your personal information
   - View/edit education, experience, skills

5. **Events**: Click "Events" in navigation
   - Browse available hackathons and challenges
   - Register for events
   - View event details

6. **Badges**: Click "Badges" in navigation
   - View earned digital badges (if using mock data)

7. **AI Features**:
   - **AI Panel**: View virtual hiring panel reviews
   - **Job Matches**: See AI-matched job recommendations
   - **Interviews**: Access AI interview practice (UI ready, functionality coming soon)

## 🔍 Testing with Mock Data

If you inserted the seed data and connected a real user:

1. **Login** with one of the mock users:
   - Email: `sarah.chen@example.com`
   - Password: (the one you set)

2. **Explore features**:
   - Dashboard shows stats from mock data
   - Profile page displays Sarah's information
   - Events page shows 3 events
   - Badges page shows earned badges
   - AI Panel shows a sample review
   - Job Matches shows 2-3 recommendations
   - Interviews page shows past interview

## 📊 Database Structure

### Core Tables

**candidate_profiles**
- Stores user profile information
- Linked to auth.users via user_id
- Includes job preferences and consent settings

**education** & **experience**
- Linked to candidate_profiles
- Standard resume sections

**candidate_skills**
- Skills with proficiency levels
- Categorized (technical, soft, language)

**events**
- Hackathons, business challenges, case studies
- Includes judging criteria, prize pools

**event_registrations**
- Links candidates to events
- Tracks registration status

**project_submissions**
- Project details, tech stack, links
- AI scores, judge scores, final scores, ranks
- Feedback from judges

**digital_badges**
- QR-verifiable credentials
- Metadata about achievements

**panel_reviews**
- AI hiring panel evaluations
- Separate scores from HR, Tech Lead, Career Coach
- Pros, cons, justifications

**agent_matches**
- Job recommendations from Reverse Recruiter
- Match scores and explanations
- Skills, salary, benefits, location fit

**ai_interviews**
- Interview transcripts
- AI summaries and insights
- Duration and key takeaways

## 🔐 Security Features

All tables use Row Level Security (RLS):
- Candidates can only see/edit their own data
- Employers can only view profiles with consent
- Public data (badges, events) has appropriate policies

## 🎨 UI Features

The frontend includes:
- **Responsive design**: Works on mobile, tablet, desktop
- **Modern UI**: Tailwind CSS with gradients and smooth transitions
- **Clear navigation**: Dashboard with quick access to all features
- **Data visualization**: Stats, scores, badges
- **Empty states**: Helpful messages when no data exists
- **Loading states**: Disabled buttons during async operations

## 🐛 Troubleshooting

### "Invalid Supabase credentials"
- Check `.env.local` has correct URL and anon key
- Restart dev server after changing .env.local

### "User not authorized" or login issues
- Verify RLS policies are created (run schema.sql)
- Check if user_id in candidate_profiles matches auth.users
- Try creating a fresh user

### Mock data not showing
- Ensure you ran seed.sql after schema.sql
- Check if user_id in candidate_profiles was updated
- Verify you're logged in with the correct user

### Page not found errors
- Check file structure matches the imports
- Ensure all pages are in `app/` directory
- Restart dev server

### Build errors
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then reinstall
- Check Node.js version (should be 20+)

## 🚀 Next Steps

After setup, you can:

1. **Customize the UI**
   - Edit Tailwind classes in components
   - Modify colors in `app/globals.css`

2. **Add real AI features**
   - Integrate Google Gemini API
   - Set up LangGraph workflows
   - Add ElevenLabs for voice interviews

3. **Extend functionality**
   - Add file upload for resumes
   - Implement project submission forms
   - Create event management features

4. **Deploy**
   - Use Vercel for easy deployment
   - Configure production environment variables
   - Set up custom domain

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 💡 Tips

- Use the Supabase Table Editor to view/edit data visually
- Check browser console for detailed error messages
- Use React DevTools to inspect component state
- Refer to `overall_concept.md` for platform architecture

## 🤝 Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure Supabase project is active
4. Try the troubleshooting steps above
5. Check that all SQL migrations ran successfully

Happy coding! 🎉

