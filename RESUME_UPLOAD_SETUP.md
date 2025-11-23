# Resume Upload & AI Parsing Setup Guide

This guide will help you set up the resume upload and AI-powered parsing feature.

## 🎯 Features

- **PDF Upload**: Secure file upload to Supabase Storage
- **AI Parsing**: Google Gemini extracts structured data from resumes
- **Auto-Population**: Automatically fills education, experience, skills, and achievements
- **Smart Extraction**: Identifies dates, job titles, skills, certifications, and more

## 📋 Prerequisites

1. Supabase project (already set up)
2. Google Gemini API key (free tier available)

## 🚀 Setup Instructions

### Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Choose "Create API key in new project" or select existing project
5. Copy the API key

### Step 2: Add Environment Variable

Create `.env.local` file in project root (if it doesn't exist):

```bash
# Windows PowerShell
New-Item .env.local

# Mac/Linux Terminal
touch .env.local
```

Add to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_GEMINI_API_KEY=your-api-key-here
```

**CRITICAL:** Restart your dev server after adding/changing environment variables:

```bash
# Stop server with Ctrl+C, then:
npm run dev
```

The server must be restarted to load new environment variables!

### Step 3: Set Up Supabase Storage

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **SQL Editor** in the left sidebar
4. Copy the contents of `supabase/setup_storage.sql`
5. Paste and click **Run**

This creates:
- A `documents` bucket for storing resumes
- Security policies for file access
- Public read access for resume viewing

### Step 4: Test the Upload

1. Go to Profile page: `http://localhost:3000/dashboard/profile`
2. You should see the **Resume Upload** section at the top
3. Click "Choose PDF File"
4. Select a PDF resume
5. Wait for:
   - Upload (5-10 seconds)
   - AI Parsing (30-60 seconds)
6. Check the populated sections below

## 🔍 How It Works

### 1. File Upload Flow

```
User selects PDF → Upload to Supabase Storage → Get public URL → Update profile
```

### 2. AI Parsing Flow

```
PDF URL → Fetch PDF → Convert to Base64 → Send to Gemini API → Parse JSON → Insert to database
```

### 3. Data Extraction

The AI extracts:

**Education:**
- Institution name
- Degree and field of study
- Dates (start/end)
- GPA/grades
- Activities

**Experience:**
- Company name
- Job title
- Employment type
- Location
- Dates (start/end)
- Description
- Skills used

**Skills:**
- Skill names
- Categories (technical, soft, etc.)
- Proficiency levels
- Years of experience

**Achievements:**
- Certifications
- Awards
- Hackathon wins
- Notable accomplishments
- Issuing organizations

## 📊 Gemini API Usage

### Free Tier Limits (as of 2024)
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day

### Cost Estimates
- Gemini 1.5 Flash: Very affordable
- Average resume: ~5,000 tokens
- Free tier: ~200 resumes per day

## 🛡️ Security Features

### File Upload Security
- PDF-only validation
- 5MB file size limit
- Authenticated uploads only
- Unique filenames to prevent collisions

### Storage Security
- Row Level Security (RLS) enabled
- Users can only manage their own files
- Public read access for viewing only

### API Security
- API key stored in environment variables
- Server-side API calls only (never exposed to client)
- Error handling for failed parsing

## 🐛 Troubleshooting

### "Failed to upload resume"

**Check:**
- File is PDF format
- File size < 5MB
- Supabase storage bucket created
- Storage policies are set up

**Fix:**
Run `supabase/setup_storage.sql` in SQL Editor

### "Failed to parse resume"

**Check:**
- `GOOGLE_GEMINI_API_KEY` is set in `.env.local`
- API key is valid
- Dev server restarted after adding env variable

**Fix:**
1. Verify API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Check server logs in terminal for detailed errors

### "Parsing takes too long"

This is normal! AI parsing can take 30-60 seconds depending on:
- Resume length and complexity
- API response time
- Number of sections to extract

### Resume parsed but data not showing

**Check:**
- Wait for page reload (auto-reloads after 2 seconds)
- Manually refresh the page
- Check Supabase database tables for inserted data

**Debug:**
1. Open browser DevTools → Console
2. Look for API response
3. Check `summary` object for counts

## 📝 Supported Resume Formats

### ✅ Works Best With:
- Standard chronological resumes
- Clear section headers (Education, Experience, Skills)
- Well-formatted dates
- PDF text (not scanned images)

### ⚠️ May Need Manual Review:
- Creative/non-standard layouts
- Heavy graphics or unusual formatting
- Scanned PDFs (OCR quality dependent)
- Multiple columns with complex layouts

## 🎨 UI Features

### Upload Component Shows:
- Drag-and-drop zone (visual only, click to select)
- File type and size validation
- Upload progress indicator
- Parsing progress with spinner
- Success message with summary
- Error messages with details

### User Experience:
1. **Upload**: Visual feedback with spinner
2. **Parsing**: AI parsing indicator (30-60s)
3. **Success**: Summary of extracted items
4. **Auto-reload**: Page refreshes to show new data
5. **Review**: Users can edit all extracted data

## 🔄 Data Flow Diagram

```
┌─────────────┐
│ User Upload │
│    (PDF)    │
└──────┬──────┘
       │
       v
┌─────────────────┐
│ Supabase Storage│
│  (documents)    │
└──────┬──────────┘
       │
       v
┌─────────────────┐
│  Get Public URL │
└──────┬──────────┘
       │
       v
┌─────────────────┐
│ Update Profile  │
│   (resume_url)  │
└──────┬──────────┘
       │
       v
┌─────────────────┐
│  Fetch PDF via  │
│   Public URL    │
└──────┬──────────┘
       │
       v
┌─────────────────┐
│ Convert to Base64│
└──────┬──────────┘
       │
       v
┌─────────────────┐
│  Send to Gemini │
│    API (Flash)  │
└──────┬──────────┘
       │
       v
┌─────────────────┐
│  Parse JSON     │
│   Response      │
└──────┬──────────┘
       │
       v
┌─────────────────┐
│  Insert Data    │
│  to Supabase    │
├─────────────────┤
│  • education    │
│  • experience   │
│  • skills       │
│  • achievements │
└──────┬──────────┘
       │
       v
┌─────────────────┐
│  Return Summary │
│  & Reload Page  │
└─────────────────┘
```

## 🚀 Future Enhancements

Potential improvements:
- [ ] Support for DOCX files
- [ ] OCR for scanned PDFs
- [ ] Batch upload for multiple resumes
- [ ] Resume quality scoring
- [ ] Duplicate detection
- [ ] Version history
- [ ] ATS optimization suggestions

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard for storage bucket
2. Verify API key in Google AI Studio
3. Check browser console for errors
4. Review server logs in terminal
5. Ensure all SQL scripts are run

## 🎉 Success Checklist

- [x] Google Gemini API key obtained
- [x] Environment variable added
- [x] Supabase storage bucket created
- [x] Storage policies set up
- [x] Dev server restarted
- [x] Test upload successful
- [x] Data populated correctly

You're all set! Upload a resume and watch the magic happen! ✨

