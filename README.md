# TalentMatch - AI-Powered Career Platform

TalentMatch is a three-sided platform connecting students and fresh graduates with employers through AI-powered features, hackathons, and intelligent job matching.

## 🚀 Features (Candidate Side)

### Authentication & Profile Management
- User registration and login with Supabase Auth
- Comprehensive profile with education, experience, and skills
- Consent-based visibility controls for employers
- Resume upload and auto-parsing (planned)

### Events & Challenges
- Browse and register for hackathons, business challenges, and case studies
- Submit projects with GitHub, demo, and presentation links
- View leaderboards and rankings
- Earn QR-verifiable digital badges

### AI-Powered Features
- **Virtual Hiring Panel**: Get evaluated by AI agents simulating HR, Tech Lead, and Career Coach
- **Reverse Recruiter**: Receive AI-matched job recommendations based on skills and preferences
- **AI Interview Practice**: Voice-to-voice interview practice with personalized feedback (coming soon)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (Auth, Postgres, Storage, Edge Functions)
- **AI**: Google Gemini 2.0 Flash, Gemini Embeddings, LangGraph
- **Database**: PostgreSQL with pgvector for semantic search
- **Voice**: ElevenLabs (TTS), Google STT (planned)
- **Resume Parsing**: Google Gemini 2.0 Flash (AI-powered extraction)

## 📦 Setup Instructions

### Prerequisites
- Node.js 20+
- Supabase account
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the SQL
3. (Optional) Insert mock data:
   - Copy and paste the contents of `supabase/seed.sql`
   - Execute the SQL
   - **Important**: Replace placeholder UUIDs with real auth.users IDs from your project

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Windows PowerShell
New-Item .env.local

# Mac/Linux
touch .env.local
```

Add your keys to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key
```

**Where to get these:**
- **Supabase keys**: Project Settings → API in Supabase Dashboard
- **Gemini API key**: https://aistudio.google.com/app/apikey (FREE tier available)

**IMPORTANT:** Restart dev server after adding environment variables!

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
talentmatchmatrade/
├── app/
│   ├── dashboard/          # Candidate dashboard pages
│   │   ├── ai-panel/       # Virtual hiring panel reviews
│   │   ├── badges/         # Digital badges
│   │   ├── events/         # Hackathons & challenges
│   │   ├── interviews/     # AI interview practice
│   │   ├── job-matches/    # Reverse recruiter matches
│   │   ├── profile/        # Profile management
│   │   └── submissions/    # Project submissions
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── types/              # TypeScript type definitions
├── components/             # Reusable React components
├── lib/
│   └── supabase/          # Supabase client configuration
├── supabase/
│   ├── schema.sql         # Database schema
│   └── seed.sql           # Mock data
└── overall_concept.md      # Platform concept documentation
```

## 🗄️ Database Schema

The database includes tables for:
- **candidate_profiles**: User profiles with preferences
- **education**: Educational background
- **experience**: Work experience
- **candidate_skills**: Skills with proficiency levels
- **events**: Hackathons and challenges
- **event_registrations**: Event participation
- **project_submissions**: Project submissions with scores
- **digital_badges**: Achievement badges
- **leaderboards**: Event rankings
- **panel_reviews**: AI hiring panel evaluations
- **agent_matches**: Job recommendations
- **ai_interviews**: Interview practice transcripts

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Candidates can only access their own data
- Employers can only view profiles with consent
- Auth.users managed by Supabase Auth

## 🎯 Key Pages

- `/` - Landing page
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - Main dashboard with overview
- `/dashboard/profile` - Profile management
- `/dashboard/events` - Browse events
- `/dashboard/badges` - View earned badges
- `/dashboard/ai-panel` - Virtual hiring panel reviews
- `/dashboard/job-matches` - AI job recommendations
- `/dashboard/interviews` - Interview practice

## 📝 Mock Data

The `supabase/seed.sql` file includes:
- 3 sample candidate profiles
- 3 events (hackathon, business challenge, case study)
- Education, experience, and skills data
- Project submissions with scores
- Digital badges
- Panel reviews
- Job matches
- AI interview transcripts

**Note**: After running the seed script, you'll need to:
1. Create actual users in Supabase Auth Dashboard
2. Update the `user_id` fields in `candidate_profiles` with real auth user IDs

## 🚧 Coming Soon

- Resume upload and auto-parsing
- Voice-to-voice AI interviews with ElevenLabs
- Real-time job scraping and matching
- Employer dashboard
- Admin dashboard for event management
- Advanced analytics and insights

## 📄 License

This project is for demonstration and development purposes.

## 🤝 Contributing

This is a hackathon project. Contributions and feedback are welcome!

## 📞 Support

For questions or issues, please refer to the `overall_concept.md` file for detailed platform documentation.
