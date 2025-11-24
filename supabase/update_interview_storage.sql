-- ============================================
-- ENHANCED AI INTERVIEW CONVERSATION STORAGE
-- ============================================

-- Add missing RLS policies for ai_interviews
-- Users should be able to create their own interviews
CREATE POLICY "Users can create own interviews"
  ON ai_interviews FOR INSERT
  WITH CHECK (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

-- Users should be able to update their own interviews
CREATE POLICY "Users can update own interviews"
  ON ai_interviews FOR UPDATE
  USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id = auth.uid()));

-- ============================================
-- INTERVIEW MESSAGES TABLE (Granular Storage)
-- ============================================

-- Create a separate table for individual conversation messages
-- This allows better querying, real-time updates, and message-level operations
CREATE TABLE IF NOT EXISTS interview_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID REFERENCES ai_interviews(id) ON DELETE CASCADE NOT NULL,
  speaker VARCHAR(50) NOT NULL, -- 'interviewer' or 'candidate'
  content TEXT NOT NULL,
  message_order INTEGER NOT NULL, -- Order of message in conversation
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on interview_messages
ALTER TABLE interview_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview_messages
CREATE POLICY "Users can view own interview messages"
  ON interview_messages FOR SELECT
  USING (
    interview_id IN (
      SELECT ai.id FROM ai_interviews ai
      JOIN candidate_profiles cp ON ai.candidate_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own interview messages"
  ON interview_messages FOR INSERT
  WITH CHECK (
    interview_id IN (
      SELECT ai.id FROM ai_interviews ai
      JOIN candidate_profiles cp ON ai.candidate_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

-- Index for fast message retrieval
CREATE INDEX idx_interview_messages_interview_id ON interview_messages(interview_id);
CREATE INDEX idx_interview_messages_order ON interview_messages(interview_id, message_order);
CREATE INDEX idx_interview_messages_timestamp ON interview_messages(interview_id, timestamp);

-- ============================================
-- CONVERSATION STATE TABLE (Real-time tracking)
-- ============================================

-- Track active interview state for real-time features
CREATE TABLE IF NOT EXISTS interview_state (
  interview_id UUID PRIMARY KEY REFERENCES ai_interviews(id) ON DELETE CASCADE,
  current_question_index INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on interview_state
ALTER TABLE interview_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview_state
CREATE POLICY "Users can view own interview state"
  ON interview_state FOR SELECT
  USING (
    interview_id IN (
      SELECT ai.id FROM ai_interviews ai
      JOIN candidate_profiles cp ON ai.candidate_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own interview state"
  ON interview_state FOR INSERT
  WITH CHECK (
    interview_id IN (
      SELECT ai.id FROM ai_interviews ai
      JOIN candidate_profiles cp ON ai.candidate_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own interview state"
  ON interview_state FOR UPDATE
  USING (
    interview_id IN (
      SELECT ai.id FROM ai_interviews ai
      JOIN candidate_profiles cp ON ai.candidate_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

-- Index for active interview queries
CREATE INDEX idx_interview_state_active ON interview_state(is_active) WHERE is_active = true;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get interview messages as JSONB array (for backward compatibility)
CREATE OR REPLACE FUNCTION get_interview_transcript(interview_uuid UUID)
RETURNS JSONB AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'speaker', speaker,
        'content', content,
        'timestamp', timestamp
      ) ORDER BY message_order
    ),
    '[]'::jsonb
  )
  FROM interview_messages
  WHERE interview_id = interview_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to add a message to an interview
CREATE OR REPLACE FUNCTION add_interview_message(
  interview_uuid UUID,
  speaker_value VARCHAR(50),
  content_value TEXT
)
RETURNS UUID AS $$
DECLARE
  next_order INTEGER;
  new_message_id UUID;
BEGIN
  -- Get the next message order
  SELECT COALESCE(MAX(message_order), -1) + 1 INTO next_order
  FROM interview_messages
  WHERE interview_id = interview_uuid;

  -- Insert the message
  INSERT INTO interview_messages (interview_id, speaker, content, message_order)
  VALUES (interview_uuid, speaker_value, content_value, next_order)
  RETURNING id INTO new_message_id;

  -- Update interview state last activity
  UPDATE interview_state
  SET last_activity_at = NOW()
  WHERE interview_id = interview_uuid;

  RETURN new_message_id;
END;
$$ LANGUAGE plpgsql;

-- Function to finalize an interview
CREATE OR REPLACE FUNCTION finalize_interview(
  interview_uuid UUID,
  duration INTEGER,
  summary TEXT DEFAULT NULL,
  insights JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update interview record
  UPDATE ai_interviews
  SET 
    duration_seconds = duration,
    ai_summary = COALESCE(summary, ai_summary),
    key_insights = COALESCE(insights, key_insights),
    transcript = get_interview_transcript(interview_uuid)
  WHERE id = interview_uuid;

  -- Mark interview state as inactive
  UPDATE interview_state
  SET 
    is_active = false,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE interview_id = interview_uuid;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update interview_state.updated_at
CREATE TRIGGER update_interview_state_updated_at
  BEFORE UPDATE ON interview_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- REALTIME PUBLICATION (for Supabase Realtime)
-- ============================================

-- Enable realtime for interview_messages (optional, for live updates)
-- This allows the UI to subscribe to new messages in real-time
-- Uncomment if you want real-time features:
-- ALTER PUBLICATION supabase_realtime ADD TABLE interview_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE interview_state;

-- ============================================
-- MIGRATION HELPER
-- ============================================

-- Function to migrate existing transcripts to interview_messages
CREATE OR REPLACE FUNCTION migrate_existing_transcripts()
RETURNS INTEGER AS $$
DECLARE
  interview_record RECORD;
  message_record JSONB;
  messages_migrated INTEGER := 0;
  msg_order INTEGER;
BEGIN
  -- Loop through all interviews with transcripts
  FOR interview_record IN
    SELECT id, transcript
    FROM ai_interviews
    WHERE transcript IS NOT NULL AND jsonb_array_length(transcript) > 0
  LOOP
    msg_order := 0;
    
    -- Loop through each message in the transcript
    FOR message_record IN
      SELECT * FROM jsonb_array_elements(interview_record.transcript)
    LOOP
      -- Insert message if it doesn't already exist
      INSERT INTO interview_messages (interview_id, speaker, content, message_order, timestamp)
      VALUES (
        interview_record.id,
        message_record->>'speaker',
        message_record->>'content',
        msg_order,
        COALESCE((message_record->>'timestamp')::TIMESTAMP WITH TIME ZONE, NOW())
      )
      ON CONFLICT DO NOTHING;
      
      msg_order := msg_order + 1;
      messages_migrated := messages_migrated + 1;
    END LOOP;
  END LOOP;

  RETURN messages_migrated;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INDEXES FOR INTERVIEW TRANSCRIPT SEARCH
-- ============================================

-- GIN index for full-text search on transcript JSONB
CREATE INDEX idx_ai_interviews_transcript_gin ON ai_interviews USING GIN (transcript);

-- Index for interview date queries
CREATE INDEX idx_ai_interviews_date ON ai_interviews(interview_date DESC);

-- Index for interview type queries
CREATE INDEX idx_ai_interviews_type ON ai_interviews(interview_type);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE interview_messages IS 'Stores individual conversation messages for granular querying and real-time updates';
COMMENT ON TABLE interview_state IS 'Tracks active interview state for real-time features and progress monitoring';
COMMENT ON FUNCTION get_interview_transcript IS 'Retrieves interview messages as JSONB array for backward compatibility';
COMMENT ON FUNCTION add_interview_message IS 'Adds a new message to an interview conversation';
COMMENT ON FUNCTION finalize_interview IS 'Finalizes an interview by updating duration, summary, and marking as inactive';
COMMENT ON FUNCTION migrate_existing_transcripts IS 'Migrates existing JSONB transcripts to interview_messages table';

-- ============================================
-- PANEL REVIEWS BACKFILL
-- ============================================

-- Ensure panel reviews can reference the interview
ALTER TABLE panel_reviews
  ADD COLUMN IF NOT EXISTS interview_id UUID REFERENCES ai_interviews(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_panel_reviews_interview ON panel_reviews(interview_id);

-- Panel reviews RLS policies to allow authenticated candidates to read/write their own reviews
ALTER TABLE panel_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'panel_reviews'
      AND policyname = 'panel_reviews_insert_own'
  ) THEN
    CREATE POLICY panel_reviews_insert_own ON public.panel_reviews
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.candidate_profiles cp
          WHERE cp.id = panel_reviews.candidate_id
            AND cp.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'panel_reviews'
      AND policyname = 'panel_reviews_select_own'
  ) THEN
    CREATE POLICY panel_reviews_select_own ON public.panel_reviews
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.candidate_profiles cp
          WHERE cp.id = panel_reviews.candidate_id
            AND cp.user_id = auth.uid()
        )
      );
  END IF;
END$$;

