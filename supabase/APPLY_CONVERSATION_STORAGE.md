# Apply Conversation Storage Updates

## Quick Setup Instructions

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://app.supabase.com/
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Copy and Run SQL Script

Copy the entire contents of `supabase/update_interview_storage.sql` and paste into the SQL Editor.

Click **RUN** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac).

### Step 3: Verify Setup

Run this verification query:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('interview_messages', 'interview_state');

-- Should return 2 rows
```

Expected result:
```
interview_messages
interview_state
```

### Step 4: Check Functions

```sql
-- Verify helper functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'add_interview_message', 
    'finalize_interview', 
    'get_interview_transcript',
    'migrate_existing_transcripts'
  );

-- Should return 4 rows
```

### Step 5: Migrate Existing Data (Optional)

If you have existing interviews, run:

```sql
SELECT migrate_existing_transcripts();
```

This will show how many messages were migrated.

### Step 6: Test Interview Creation

Try creating a test interview:

```sql
-- Replace 'your-candidate-id' with an actual candidate_id from your database
INSERT INTO ai_interviews (candidate_id, interview_type, transcript, duration_seconds)
VALUES ('your-candidate-id', 'technical', '[]'::jsonb, 0)
RETURNING id;

-- Copy the returned UUID and use it in next steps
```

### Step 7: Test Message Addition

```sql
-- Replace 'interview-uuid' with the UUID from Step 6
SELECT add_interview_message(
  'interview-uuid',
  'interviewer',
  'What is your experience with React?'
);

SELECT add_interview_message(
  'interview-uuid',
  'candidate',
  'I have 3 years of experience with React.'
);
```

### Step 8: Verify Messages Stored

```sql
-- Replace 'interview-uuid' with your interview ID
SELECT * FROM interview_messages 
WHERE interview_id = 'interview-uuid'
ORDER BY message_order;

-- Should show 2 messages
```

### Step 9: Test Finalization

```sql
-- Replace 'interview-uuid' with your interview ID
SELECT finalize_interview(
  'interview-uuid',
  60,
  'Test interview completed successfully',
  '{"strengths": ["React", "Communication"]}'::jsonb
);
```

### Step 10: Clean Up Test Data

```sql
-- Remove test interview
DELETE FROM ai_interviews WHERE id = 'interview-uuid';
```

## ✅ Success Checklist

After completing all steps, you should have:

- [x] `interview_messages` table created with RLS
- [x] `interview_state` table created with RLS
- [x] RLS policies on `ai_interviews` for INSERT and UPDATE
- [x] 4 helper functions created
- [x] Indexes for performance
- [x] Test interview worked successfully

## 🚨 Troubleshooting

### Error: "relation already exists"

This means the table is already created. You can skip the creation or drop and recreate:

```sql
-- Only if you want to start fresh
DROP TABLE IF EXISTS interview_messages CASCADE;
DROP TABLE IF EXISTS interview_state CASCADE;
-- Then run the full script again
```

### Error: "function already exists"

Functions are already created. You can replace them:

```sql
-- Run with OR REPLACE (already in the script)
CREATE OR REPLACE FUNCTION add_interview_message(...) ...
```

### Error: "permission denied"

Make sure you're logged in as the database owner or have sufficient privileges.

### Error: "invalid input syntax for type uuid"

Use actual UUIDs from your database. Get a real candidate_id:

```sql
SELECT id FROM candidate_profiles LIMIT 1;
```

## 📱 Enable Realtime (Optional)

If you want real-time updates in your UI:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE interview_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE interview_state;
```

## 🔄 Rollback (If Needed)

If something goes wrong and you need to rollback:

```sql
-- Remove new tables
DROP TABLE IF EXISTS interview_messages CASCADE;
DROP TABLE IF EXISTS interview_state CASCADE;

-- Remove helper functions
DROP FUNCTION IF EXISTS add_interview_message;
DROP FUNCTION IF EXISTS finalize_interview;
DROP FUNCTION IF EXISTS get_interview_transcript;
DROP FUNCTION IF EXISTS migrate_existing_transcripts;

-- Remove new RLS policies
DROP POLICY IF EXISTS "Users can create own interviews" ON ai_interviews;
DROP POLICY IF EXISTS "Users can update own interviews" ON ai_interviews;
```

Note: The original `ai_interviews` table and existing data will remain intact.

## ⚡ After Setup

Once setup is complete:

1. Restart your Next.js dev server: `npm run dev`
2. Test the interview flow at: `http://localhost:3000/dashboard/interviews/new`
3. Conversations will now be stored in the new tables!
4. Check messages in Supabase dashboard under `interview_messages` table

## 📊 Monitor Storage

Check storage usage:

```sql
-- Count total messages
SELECT COUNT(*) FROM interview_messages;

-- Count messages per interview
SELECT interview_id, COUNT(*) as message_count
FROM interview_messages
GROUP BY interview_id
ORDER BY message_count DESC;

-- Active interviews
SELECT COUNT(*) FROM interview_state WHERE is_active = true;
```

## 🎉 Done!

Your interview conversations are now stored in Supabase with full RLS security, helper functions, and real-time capabilities!

For more details, see `CONVERSATION_STORAGE_SETUP.md`.



