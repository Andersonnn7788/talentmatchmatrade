# Conversation Storage Setup Guide

## Overview

The interview conversation storage has been enhanced with:
- **Granular message storage** in `interview_messages` table
- **Real-time interview state tracking** in `interview_state` table
- **Proper RLS policies** for secure conversation access
- **Helper functions** for easy message management
- **Backward compatibility** with existing JSONB transcript field

## 🚀 Quick Setup

### 1. Apply Database Changes

Run the SQL migration in your Supabase dashboard:

```bash
# Option A: Via Supabase Dashboard
# 1. Go to your Supabase project
# 2. Navigate to SQL Editor
# 3. Copy and paste contents of supabase/update_interview_storage.sql
# 4. Run the script
```

Or using Supabase CLI:

```bash
# Option B: Via CLI
supabase db push --file supabase/update_interview_storage.sql
```

### 2. Verify Tables Created

Check that these tables exist in your Supabase dashboard:

- ✅ `ai_interviews` (already existed, now has additional policies)
- ✅ `interview_messages` (new - stores individual messages)
- ✅ `interview_state` (new - tracks interview progress)

### 3. Migrate Existing Data (Optional)

If you have existing interviews with transcripts, run this in SQL Editor:

```sql
SELECT migrate_existing_transcripts();
```

This will copy all existing JSONB transcripts to the new `interview_messages` table.

### 4. Test the Setup

Test the conversation storage:

```sql
-- Check if helper functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name IN ('add_interview_message', 'finalize_interview', 'get_interview_transcript');

-- Should return 3 functions
```

## 📊 New Database Structure

### Table: `interview_messages`

Stores individual conversation messages for granular querying:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `interview_id` | UUID | References ai_interviews |
| `speaker` | VARCHAR(50) | 'interviewer' or 'candidate' |
| `content` | TEXT | Message content |
| `message_order` | INTEGER | Order in conversation |
| `timestamp` | TIMESTAMPTZ | When message was sent |
| `created_at` | TIMESTAMPTZ | Record creation time |

### Table: `interview_state`

Tracks active interview progress:

| Column | Type | Description |
|--------|------|-------------|
| `interview_id` | UUID | Primary key, references ai_interviews |
| `current_question_index` | INTEGER | Current question (0-based) |
| `total_questions` | INTEGER | Total questions (default 3) |
| `is_active` | BOOLEAN | Interview in progress? |
| `started_at` | TIMESTAMPTZ | Interview start time |
| `last_activity_at` | TIMESTAMPTZ | Last message timestamp |
| `updated_at` | TIMESTAMPTZ | Last state update |

## 🔧 Helper Functions

### `add_interview_message()`

Adds a message to an interview conversation:

```sql
-- Usage
SELECT add_interview_message(
  'interview-uuid-here',  -- interview_id
  'interviewer',          -- speaker ('interviewer' or 'candidate')
  'What is your experience with React?' -- content
);
```

### `get_interview_transcript()`

Retrieves all messages as JSONB array (backward compatible):

```sql
-- Usage
SELECT get_interview_transcript('interview-uuid-here');

-- Returns: [{"speaker": "interviewer", "content": "...", "timestamp": "..."}]
```

### `finalize_interview()`

Finalizes an interview and marks it complete:

```sql
-- Usage
SELECT finalize_interview(
  'interview-uuid-here',  -- interview_id
  60,                     -- duration in seconds
  'Great interview!',     -- ai_summary (optional)
  '{"strengths": ["technical skills"]}'::jsonb -- insights (optional)
);
```

### `migrate_existing_transcripts()`

One-time migration of existing JSONB transcripts:

```sql
-- Run once to migrate all existing data
SELECT migrate_existing_transcripts();
```

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with policies:

### `ai_interviews` policies:
- ✅ Users can **view** their own interviews
- ✅ Users can **create** their own interviews
- ✅ Users can **update** their own interviews

### `interview_messages` policies:
- ✅ Users can **view** messages from their interviews
- ✅ Users can **create** messages in their interviews

### `interview_state` policies:
- ✅ Users can **view** their interview state
- ✅ Users can **create** their interview state
- ✅ Users can **update** their interview state

## 🔄 How It Works

### Creating an Interview

```typescript
// 1. Create interview record
const { data: interview } = await supabase
  .from('ai_interviews')
  .insert({
    candidate_id: 'candidate-uuid',
    interview_type: 'technical',
    transcript: [],
    duration_seconds: 0
  })
  .select('id')
  .single()

// 2. Create interview state
await supabase
  .from('interview_state')
  .insert({
    interview_id: interview.id,
    current_question_index: 0,
    total_questions: 3,
    is_active: true
  })
```

### Adding Messages

```typescript
// Add interviewer question
await supabase.rpc('add_interview_message', {
  interview_uuid: interviewId,
  speaker_value: 'interviewer',
  content_value: 'Tell me about your experience with React?'
})

// Add candidate response
await supabase.rpc('add_interview_message', {
  interview_uuid: interviewId,
  speaker_value: 'candidate',
  content_value: 'I have 3 years of experience...'
})
```

### Tracking Progress

```typescript
// Update interview state
await supabase
  .from('interview_state')
  .update({
    current_question_index: 1,
    last_activity_at: new Date().toISOString()
  })
  .eq('interview_id', interviewId)
```

### Finalizing Interview

```typescript
// Finalize and generate transcript
await supabase.rpc('finalize_interview', {
  interview_uuid: interviewId,
  duration: 60,
  summary: 'Excellent technical knowledge demonstrated',
  insights: { strengths: ['React', 'Node.js', 'System Design'] }
})
```

## 📱 Real-time Updates (Optional)

To enable real-time conversation updates in your UI:

### 1. Enable Realtime in SQL Editor

```sql
-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE interview_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE interview_state;
```

### 2. Subscribe in Client Code

```typescript
// Subscribe to new messages
const channel = supabase
  .channel('interview-messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'interview_messages',
      filter: `interview_id=eq.${interviewId}`
    },
    (payload) => {
      console.log('New message:', payload.new)
      // Update UI with new message
    }
  )
  .subscribe()

// Subscribe to state changes
const stateChannel = supabase
  .channel('interview-state')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'interview_state',
      filter: `interview_id=eq.${interviewId}`
    },
    (payload) => {
      console.log('State updated:', payload.new)
      // Update progress bar, etc.
    }
  )
  .subscribe()
```

## 🔍 Querying Conversations

### Get all messages for an interview

```typescript
const { data: messages } = await supabase
  .from('interview_messages')
  .select('*')
  .eq('interview_id', interviewId)
  .order('message_order', { ascending: true })
```

### Get interview state

```typescript
const { data: state } = await supabase
  .from('interview_state')
  .select('*')
  .eq('interview_id', interviewId)
  .single()
```

### Get active interviews

```typescript
const { data: activeInterviews } = await supabase
  .from('interview_state')
  .select('interview_id, current_question_index, total_questions')
  .eq('is_active', true)
```

### Full-text search in transcripts

```sql
-- Search for keywords in interview transcripts
SELECT DISTINCT ai.id, ai.interview_type, ai.interview_date
FROM ai_interviews ai
JOIN interview_messages im ON ai.id = im.interview_id
WHERE im.content ILIKE '%React%'
  AND ai.candidate_id = 'candidate-uuid';
```

## 📈 Benefits

### Before (JSONB only):
- ❌ Hard to query individual messages
- ❌ No real-time updates
- ❌ Difficult to track progress
- ❌ Limited search capabilities

### After (Granular storage):
- ✅ Easy message-level queries
- ✅ Real-time updates possible
- ✅ Progress tracking built-in
- ✅ Full-text search enabled
- ✅ Better performance for large conversations
- ✅ Backward compatible with existing code

## 🐛 Troubleshooting

### Messages not saving

Check RLS policies are enabled:

```sql
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('interview_messages', 'interview_state');
```

### Function not found

Verify functions exist:

```sql
\df add_interview_message
\df finalize_interview
\df get_interview_transcript
```

### Migration failed

Check for existing data conflicts:

```sql
-- Check for duplicate messages
SELECT interview_id, COUNT(*) 
FROM interview_messages 
GROUP BY interview_id 
HAVING COUNT(*) > 6;  -- More than expected for 3 Q&A
```

## 🔄 Backward Compatibility

The system maintains backward compatibility:

1. **Old code** using `transcript` JSONB field still works
2. **New code** uses `interview_messages` table
3. **`finalize_interview()`** function syncs both storage methods
4. **Migration function** moves old data to new format

You can gradually migrate existing code without breaking functionality.

## ✅ Verification Checklist

After setup, verify:

- [ ] Tables created: `interview_messages`, `interview_state`
- [ ] RLS policies active on all tables
- [ ] Helper functions exist: `add_interview_message`, `finalize_interview`, `get_interview_transcript`
- [ ] Existing transcripts migrated (if applicable)
- [ ] Test interview creates messages successfully
- [ ] Indexes created for performance
- [ ] (Optional) Realtime enabled if needed

## 📚 Additional Resources

- See `lib/agents/interviewAgent.ts` for implementation
- See `lib/agents/panelAgent.ts` for how panel reads conversations
- See `app/types/database.types.ts` for TypeScript types
- See `AI_INTERVIEW_GUIDE.md` for complete interview system docs

## 🎉 Summary

Your interview conversations are now stored in Supabase with:
- ✅ Granular message-level storage
- ✅ Real-time progress tracking
- ✅ Secure RLS policies
- ✅ Helper functions for easy access
- ✅ Full backward compatibility
- ✅ Search and query capabilities

All interview conversations are automatically saved to Supabase!



