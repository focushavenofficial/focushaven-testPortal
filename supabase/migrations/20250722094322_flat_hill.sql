/*
  # Add detailed_results column to test_results table

  1. Changes
    - Add `detailed_results` column to `test_results` table to store AI similarity scores and detailed analysis
    - Column will store JSONB data with question-level results including similarity scores

  2. Security
    - No changes to RLS policies needed as existing policies cover the new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'test_results' AND column_name = 'detailed_results'
  ) THEN
    ALTER TABLE test_results ADD COLUMN detailed_results jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;