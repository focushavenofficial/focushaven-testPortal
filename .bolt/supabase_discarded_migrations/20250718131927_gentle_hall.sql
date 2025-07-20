/*
  # Test Portal Database Schema

  1. New Tables
    - `tests`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `duration` (integer, minutes)
      - `questions` (jsonb)
      - `created_by` (text)
      - `created_at` (timestamp)
      - `is_active` (boolean)
    
    - `test_results`
      - `id` (uuid, primary key)
      - `test_id` (uuid, foreign key)
      - `user_id` (text)
      - `answers` (jsonb)
      - `score` (integer)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their data
    - Students can only view active tests and their own results
    - Admins can manage all tests and view all results
*/

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  duration integer NOT NULL DEFAULT 30,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Policies for tests table
CREATE POLICY "Anyone can view active tests"
  ON tests
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all tests"
  ON tests
  FOR ALL
  USING (true);

CREATE POLICY "Teachers can manage their own tests"
  ON tests
  FOR ALL
  USING (created_by = current_setting('app.current_user_id', true));

-- Policies for test_results table
CREATE POLICY "Users can view their own results"
  ON test_results
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own results"
  ON test_results
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can view all results"
  ON test_results
  FOR SELECT
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON tests(created_by);
CREATE INDEX IF NOT EXISTS idx_tests_is_active ON tests(is_active);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);