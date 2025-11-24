# Environment Variables Setup Guide

## 🚨 IMPORTANT: Fix API Key Error

If you're getting `API key not valid` error, follow these steps:

## Step 1: Create .env.local File

In your project root (same folder as `package.json`), create a file named `.env.local`:

```bash
# On Windows (PowerShell)
New-Item .env.local

# On Mac/Linux
touch .env.local
```

## Step 2: Add Your API Keys

Open `.env.local` and add these lines:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API Key
GOOGLE_GEMINI_API_KEY=your-actual-api-key-here
```

## Step 3: Get Your API Keys

### Supabase Keys (Already Done)
You should already have these from initial setup:
- Project URL: `https://xxxxx.supabase.co`
- Anon Key: Long string starting with `eyJ...`

### Google Gemini API Key (NEW)

1. **Go to Google AI Studio:**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **Sign in with Google Account**

3. **Click "Create API Key"**

4. **Choose Project:**
   - "Create API key in new project" (easiest), or
   - Select existing Google Cloud project

5. **Copy the API Key**
   - It looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Save it somewhere safe!

6. **Paste into .env.local:**
   ```env
   GOOGLE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

## Step 4: Restart Dev Server

**CRITICAL:** You MUST restart the server after adding/changing .env.local

```bash
# Stop the server (Ctrl+C)
# Then start again:
npm run dev
```

## Step 5: Verify Setup

Check your terminal output when the server starts. You should see:
```
✓ Ready in 2.3s
○ Local:   http://localhost:3000
```

If you see warnings about environment variables, they're not loaded correctly.

## 🔍 Troubleshooting

### Error: "API key not valid"

**Cause:** API key not loaded or invalid

**Fix:**
1. Check `.env.local` exists in project root
2. Verify no typos in `GOOGLE_GEMINI_API_KEY=`
3. Ensure no spaces around the `=` sign
4. Verify API key is valid at https://aistudio.google.com/app/apikey
5. **Restart dev server** (most common issue!)

### Error: "GOOGLE_GEMINI_API_KEY is not set"

**Cause:** Environment variable not loaded

**Fix:**
1. Ensure `.env.local` is in the **project root** (same level as package.json)
2. Check file is named `.env.local` (not `.env.local.txt`)
3. Restart dev server with `npm run dev`

### API Key Shows in Error Messages

**Cause:** Using wrong environment variable prefix

**Fix:**
- Use `GOOGLE_GEMINI_API_KEY` (no NEXT_PUBLIC prefix)
- Server-side only variables don't need NEXT_PUBLIC
- Never expose API keys to client-side

### "Failed to fetch" or CORS errors

**Cause:** API key restrictions or network issues

**Fix:**
1. Check API key has no restrictions set
2. Go to Google Cloud Console → Credentials
3. Edit API key → Application restrictions → None
4. API restrictions → Don't restrict key (for development)

## 📋 Complete .env.local Example

Here's what your complete `.env.local` should look like:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNzE5ODYyMCwiZXhwIjoxOTMyNzc0NjIwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Gemini API Key
GOOGLE_GEMINI_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 🔒 Security Notes

1. **Never commit .env.local to git**
   - It's in `.gitignore` by default
   - Keeps your API keys safe

2. **Never share your API keys**
   - Don't post in forums, Discord, etc.
   - Regenerate if accidentally exposed

3. **Server-side vs Client-side**
   - `NEXT_PUBLIC_*` = Available in browser (public)
   - No prefix = Server-side only (secure)
   - API keys should NEVER have `NEXT_PUBLIC_` prefix

## ✅ Verification Checklist

- [ ] `.env.local` file exists in project root
- [ ] Supabase URL added (starts with https://)
- [ ] Supabase anon key added (starts with eyJ)
- [ ] Google Gemini API key added (starts with AIza)
- [ ] No spaces around `=` signs
- [ ] Dev server restarted after adding keys
- [ ] No errors in terminal when starting server

## 🚀 Test the Setup

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/dashboard/profile
3. Upload a PDF resume
4. Should see: "Uploading resume..." → "Parsing resume with AI..."
5. If successful: Profile sections auto-populate!

## 🆘 Still Having Issues?

1. **Check terminal output for detailed errors**
2. **Verify API key at:** https://aistudio.google.com/app/apikey
3. **Try creating a new API key**
4. **Ensure you're using Gemini 2.0 Flash (latest model)**
5. **Check browser console for client-side errors**

## 📞 Common Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "API key not valid" | Verify key at AI Studio, restart server |
| "API key not configured" | Check .env.local exists, restart server |
| "Failed to parse resume" | Check API key has no restrictions |
| "Model not found" | Update to gemini-2.0-flash-exp |
| "Quota exceeded" | Wait or upgrade to paid tier |

## 🎓 Environment Variable Basics

**.env.local** = Development environment variables (local only)
**.env.production** = Production environment variables (deployment)
**.env** = Default for all environments (not recommended for secrets)

For this project, we only use `.env.local` for development.

---

**After completing this guide, your resume upload should work perfectly!** 🎉





