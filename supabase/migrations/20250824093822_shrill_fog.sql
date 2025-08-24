/*
  # Add reviewed_questions column to test_results table

  1. Changes
    - Add `reviewed_questions` column to `test_results` table to store question IDs that were reviewed
    - Column will store array of text values (question IDs)

  2. Security
    - No changes to RLS policies needed as existing policies cover the new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results' AND column_name = 'reviewed_questions'
  ) THEN
    ALTER TABLE test_results ADD COLUMN reviewed_questions text[] DEFAULT '{}';
  END IF;
END $$;