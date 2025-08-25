/*
  # Add timing fields to test_results table

  1. Changes
    - Add `started_at` column to track when test was started
    - Add `time_spent` column to track actual time spent on test (in seconds)

  2. Security
    - No changes to RLS policies needed as existing policies cover the new columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE test_results ADD COLUMN started_at timestamptz DEFAULT now();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results' AND column_name = 'time_spent'
  ) THEN
    ALTER TABLE test_results ADD COLUMN time_spent integer DEFAULT 0;
  END IF;
END $$;

-- Add index for better performance on timing queries
CREATE INDEX IF NOT EXISTS idx_test_results_started_at ON test_results(started_at);

-- Add comment to explain timing fields
COMMENT ON COLUMN test_results.started_at IS 'Timestamp when the test was started by the student';
COMMENT ON COLUMN test_results.time_spent IS 'Actual time spent on test in seconds';