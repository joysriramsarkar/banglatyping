-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Lessons table: Stores lesson metadata
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  level VARCHAR(50) NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  category VARCHAR(100), -- e.g., 'home-row', 'top-row', 'bottom-row', 'kar-row', 'word-drill', 'paragraph', 'game'
  description TEXT,
  is_word_drill BOOLEAN DEFAULT FALSE,
  is_paragraph BOOLEAN DEFAULT FALSE,
  content_type VARCHAR(50) DEFAULT 'text', -- 'text' or 'drills'
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson drills: Stores individual drills for lessons
CREATE TABLE lesson_drills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prompt VARCHAR(255) NOT NULL, -- Character or word to type
  steps JSONB NOT NULL, -- Array of SingleDrill objects
  drill_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lesson_drills_lesson_id ON lesson_drills(lesson_id);

-- User progress: Stores typing session results
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL, -- Firebase UID
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  wpm FLOAT DEFAULT 0,
  accuracy FLOAT DEFAULT 0, -- Percentage (0-100)
  errors INTEGER DEFAULT 0,
  time_elapsed INTEGER DEFAULT 0, -- Milliseconds
  erred_characters JSONB DEFAULT '[]'::jsonb, -- Array of {char, count}
  session_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_progress_session_timestamp ON user_progress(session_timestamp);

-- Character errors: Aggregated error tracking by character
CREATE TABLE character_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  character VARCHAR(10) NOT NULL,
  error_count INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  accuracy_rate FLOAT DEFAULT 100, -- Percentage
  last_error_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, character)
);

CREATE INDEX idx_character_errors_user_id ON character_errors(user_id);
CREATE INDEX idx_character_errors_accuracy_rate ON character_errors(accuracy_rate);

-- Custom drills: Generated drills based on weak characters
CREATE TABLE custom_drills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  characters VARCHAR(500) NOT NULL, -- Comma-separated characters
  drill_data JSONB NOT NULL, -- Pre-generated drills array
  focus_characters JSONB NOT NULL, -- {char: accuracy_rate} object
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_custom_drills_user_id ON custom_drills(user_id);
CREATE INDEX idx_custom_drills_created_at ON custom_drills(created_at DESC);

-- User lesson completion: Track which lessons users have completed
CREATE TABLE user_lesson_completion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  times_completed INTEGER DEFAULT 1,
  best_accuracy FLOAT DEFAULT 0,
  best_wpm FLOAT DEFAULT 0,
  last_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_lesson_completion_user_id ON user_lesson_completion(user_id);
CREATE INDEX idx_user_lesson_completion_lesson_id ON user_lesson_completion(lesson_id);

-- Paragraph content storage
CREATE TABLE paragraph_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  difficulty_level VARCHAR(50), -- 'easy', 'medium', 'hard'
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update character error stats after each session
CREATE OR REPLACE FUNCTION update_character_errors(
  p_user_id VARCHAR(255),
  p_erred_characters JSONB
) RETURNS void AS $$
DECLARE
  v_item JSONB;
BEGIN
  FOR v_item IN SELECT jsonb_array_elements(p_erred_characters)
  LOOP
    INSERT INTO character_errors (user_id, character, error_count, total_attempts)
    VALUES (
      p_user_id,
      v_item->>'char',
      (v_item->>'count')::INTEGER,
      (v_item->>'count')::INTEGER
    )
    ON CONFLICT (user_id, character) DO UPDATE
    SET 
      error_count = character_errors.error_count + (v_item->>'count')::INTEGER,
      total_attempts = character_errors.total_attempts + (v_item->>'count')::INTEGER,
      accuracy_rate = ROUND(
        CAST((100.0 * (character_errors.total_attempts - (character_errors.error_count + (v_item->>'count')::INTEGER))) 
        / character_errors.total_attempts AS NUMERIC), 2
      ),
      last_error_at = NOW(),
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call update_character_errors after inserting progress
CREATE OR REPLACE FUNCTION trigger_update_character_errors()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.erred_characters IS NOT NULL AND jsonb_array_length(NEW.erred_characters) > 0 THEN
    PERFORM update_character_errors(NEW.user_id, NEW.erred_characters);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_character_errors ON user_progress;
CREATE TRIGGER trg_update_character_errors
AFTER INSERT ON user_progress
FOR EACH ROW
EXECUTE FUNCTION trigger_update_character_errors();

-- Create views for easier data access
CREATE VIEW user_weak_characters AS
SELECT 
  user_id,
  character,
  accuracy_rate,
  error_count,
  total_attempts,
  CASE 
    WHEN accuracy_rate >= 95 THEN 'Strong'
    WHEN accuracy_rate >= 80 THEN 'Good'
    WHEN accuracy_rate >= 60 THEN 'Weak'
    ELSE 'Very Weak'
  END as strength_level
FROM character_errors
WHERE accuracy_rate < 95
ORDER BY accuracy_rate ASC;

CREATE VIEW user_statistics AS
SELECT 
  user_id,
  COUNT(DISTINCT lesson_id) as lessons_practiced,
  ROUND(CAST(AVG(accuracy) AS NUMERIC), 2) as average_accuracy,
  ROUND(CAST(AVG(wpm) AS NUMERIC), 2) as average_wpm,
  MAX(wpm) as best_wpm,
  MAX(accuracy) as best_accuracy,
  COUNT(*) as total_sessions
FROM user_progress
GROUP BY user_id;
