-- Migration 003: Allow NULL lesson_id in user_progress
-- Allows typing sessions without a strict lesson catalog UUID (e.g., adaptive weakness drills, typing tests, custom practice)

ALTER TABLE user_progress ALTER COLUMN lesson_id DROP NOT NULL;

COMMENT ON COLUMN user_progress.lesson_id IS 'Optional reference to lessons table. Can be NULL for custom/weakness drills or general typing tests.';
