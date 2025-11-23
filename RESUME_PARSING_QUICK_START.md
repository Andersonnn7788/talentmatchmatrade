# 🚀 Resume Parsing - Quick Start (5 Minutes)

Get AI-powered resume parsing working in 5 simple steps!

## Step 1: Get Google Gemini API Key (2 min)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

## Step 2: Add to Environment (30 sec)

Create `.env.local` in project root:

```bash
# Windows
New-Item .env.local

# Mac/Linux
touch .env.local
```

Add your keys to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_GEMINI_API_KEY=paste-your-key-here
```

**IMPORTANT:** Restart your dev server:

```bash
# Press Ctrl+C to stop
npm run dev
```

## Step 3: Set Up Supabase Storage (1 min)

1. Open Supabase Dashboard → SQL Editor
2. Copy/paste contents of `supabase/setup_storage.sql`
3. Click "Run"

## Step 4: Create Achievements Table (30 sec)

1. Still in SQL Editor
2. Copy/paste contents of `supabase/add_achievements.sql`
3. Click "Run"

## Step 5: Test It! (1 min)

1. Go to: http://localhost:3000/dashboard/profile
2. Look for the blue "Resume Upload" section at top
3. Click "Choose PDF File"
4. Select your resume
5. Wait ~60 seconds
6. Watch your profile auto-populate! ✨

## ✅ What Gets Extracted

- **Education**: Schools, degrees, dates, GPAs
- **Experience**: Jobs, companies, descriptions, skills
- **Skills**: Technical & soft skills with proficiency
- **Achievements**: Certifications, awards, hackathons

## 🐛 Quick Troubleshooting

**Upload fails?**
- Check file is PDF and < 5MB
- Run `setup_storage.sql` in Supabase

**Parsing fails?**
- Verify API key in `.env.local`
- Restart dev server: `npm run dev`
- Check terminal for errors

**No data shows up?**
- Wait for page auto-reload (2 seconds)
- Manually refresh page
- Run `add_achievements.sql` for achievements

## 🎉 Done!

You now have AI-powered resume parsing! Upload any PDF resume and watch it automatically populate your profile.

For detailed information, see `RESUME_UPLOAD_SETUP.md`

