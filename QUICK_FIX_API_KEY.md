# 🚨 Quick Fix: API Key Error

## The Problem
```
[GoogleGenerativeAI Error]: API key not valid
```

## The Solution (2 Minutes)

### 1. Create `.env.local` file in project root

```bash
# Windows PowerShell
New-Item .env.local

# Mac/Linux Terminal
touch .env.local
```

### 2. Get Google Gemini API Key

Visit: **https://aistudio.google.com/app/apikey**

- Sign in with Google
- Click "Create API Key"
- Copy the key (starts with `AIza...`)

### 3. Add to `.env.local`

Open `.env.local` and paste:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_GEMINI_API_KEY=AIzaSy_your_actual_key_here
```

### 4. Restart Server (IMPORTANT!)

```bash
# Stop server: Ctrl + C
# Start again:
npm run dev
```

### 5. Test Resume Upload

Go to: http://localhost:3000/dashboard/profile

Upload a PDF → Should work! ✅

---

## Still Not Working?

### Check These:

1. ✅ File named exactly `.env.local` (not `.txt`)
2. ✅ File in project root (same folder as `package.json`)
3. ✅ No spaces around `=` sign
4. ✅ API key copied completely
5. ✅ Server restarted after adding key

### Verify Your API Key:

- Visit: https://aistudio.google.com/app/apikey
- Check if key is active
- Try creating a new key if needed

---

**That's it!** Resume parsing should now work with Gemini 2.0 Flash 🚀





