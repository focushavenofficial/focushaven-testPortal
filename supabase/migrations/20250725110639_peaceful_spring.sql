/*
  # Add subject column to tests table

  1. Changes
    - Add `subject` column to `tests` table to store subject codes
    - Add index on subject column for better query performance

  2. Security
    - No changes to RLS policies needed
*/

-- Add subject column to tests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tests' AND column_name = 'subject'
  ) THEN
    ALTER TABLE tests ADD COLUMN subject text;
  END IF;
END $$;

-- Add index on subject column for better performance
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);