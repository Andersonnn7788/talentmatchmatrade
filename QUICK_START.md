# 🚀 TalentMatch Quick Start

Get up and running in 10 minutes!

## 1️⃣ Install Dependencies (1 minute)

```bash
npm install
```

## 2️⃣ Create Supabase Project (3 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project name and password
4. Wait for setup to complete

## 3️⃣ Set Up Database (2 minutes)

1. In Supabase, go to "SQL Editor"
2. Copy contents of `supabase/schema.sql`
3. Paste and click "Run"
4. Copy contents of `supabase/seed.sql`
5. Paste and click "Run"

## 4️⃣ Configure Environment (1 minute)

1. In Supabase, go to Settings → API
2. Copy your Project URL and anon key
3. Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 5️⃣ Create Test User (2 minutes)

1. In Supabase, go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Email: `test@example.com`, Password: `Test123!`, Auto confirm: ✓
4. Click "Create user"
5. Copy the user's UUID
6. In SQL Editor, run:

```sql
UPDATE candidate_profiles 
SET user_id = 'paste-uuid-here'
WHERE email = 'sarah.chen@example.com';
```

## 6️⃣ Start Development Server (1 minute)

```bash
npm run dev
```

## 7️⃣ Test the App!

Open [http://localhost:3000](http://localhost:3000)

### Option A: Login with Mock Data
- Email: `test@example.com` (the one you created)
- Password: `Test123!` (the one you set)
- You'll see Sarah Chen's profile with all mock data

### Option B: Sign Up New Account
- Click "Sign Up"
- Create your own account
- Start with a fresh profile

## 🎯 What to Try

1. **Dashboard** - See overview with stats
2. **Profile** - Edit your information
3. **Events** - Browse and register for hackathons
4. **Badges** - View achievements (mock data)
5. **AI Panel** - See virtual hiring panel reviews (mock data)
6. **Job Matches** - View AI job recommendations (mock data)
7. **Interviews** - Check interview practice section

## 📚 Full Documentation

- **Detailed Setup**: See `SETUP_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Project Overview**: See `README.md`
- **Platform Concept**: See `overall_concept.md`

## ❓ Issues?

### Can't connect to Supabase
- Check `.env.local` has correct values
- Restart dev server after changing env file

### Login not working
- Make sure you ran both `schema.sql` and `seed.sql`
- Verify user was created in Supabase Auth
- Check if `user_id` was updated in candidate_profiles

### No data showing
- Ensure you ran `seed.sql`
- Check if you're logged in with the correct user
- Update `user_id` in mock profiles to match your auth user

## 🎉 You're Ready!

Start exploring the features and building amazing AI-powered career tools!

---

**Need more help?** Check `SETUP_GUIDE.md` for detailed instructions.




