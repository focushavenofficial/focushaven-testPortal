/*
  # Test Portal Database Schema

  1. New Tables
    - `users`
      - `id` (text, primary key) - User ID from AstraDB
      - `name` (text) - User display name
      - `role` (text) - User role (admin, teacher, student)
      - `is_active` (boolean) - Whether user is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tests`
      - `id` (uuid, primary key)
      - `title` (text) - Test title
      - `description` (text) - Test description
      - `duration` (integer) - Test duration in minutes
      - `questions` (jsonb) - Array of questions with options and correct answers
      - `created_by` (text) - User ID who created the test
      - `is_active` (boolean) - Whether test is active/available
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `test_results`
      - `id` (uuid, primary key)
      - `test_id` (uuid) - Foreign key to tests table
      - `user_id` (text) - User ID who took the test
      - `answers` (jsonb) - User's answers mapped by question ID
      - `score` (integer) - Test score percentage
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Students can only see active tests and their own results
    - Teachers can see tests they created and all results
    - Admins can see everything

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize for test listing and result queries
*/

-- Create users table (for reference, auth handled by AstraDB)
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  completed_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON tests(created_by);
CREATE INDEX IF NOT EXISTS idx_tests_is_active ON tests(is_active);
CREATE INDEX IF NOT EXISTS idx_tests_created_at ON tests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at DESC);

-- Add foreign key constraint for created_by (references users table)
ALTER TABLE tests ADD CONSTRAINT fk_tests_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id);

-- Add foreign key constraint for test_results user_id
ALTER TABLE test_results ADD CONSTRAINT fk_test_results_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_updated_at 
  BEFORE UPDATE ON tests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id', true) 
      AND role = 'admin'
    )
  );

-- RLS Policies for tests table
CREATE POLICY "Students can view active tests"
  ON tests
  FOR SELECT
  TO authenticated
  USING (
    is_active = true OR
    created_by = current_setting('app.current_user_id', true) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id', true) 
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Teachers and admins can create tests"
  ON tests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = current_setting('app.current_user_id', true) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id', true) 
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Teachers can update their own tests, admins can update all"
  ON tests
  FOR UPDATE
  TO authenticated
  USING (
    created_by = current_setting('app.current_user_id', true) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id', true) 
      AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can delete their own tests, admins can delete all"
  ON tests
  FOR DELETE
  TO authenticated
  USING (
    created_by = current_setting('app.current_user_id', true) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id', true) 
      AND role = 'admin'
    )
  );

-- RLS Policies for test_results table
CREATE POLICY "Users can view their own results, teachers and admins can view all"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (
    user_id = current_setting('app.current_user_id', true) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id', true) 
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Users can insert their own test results"
  ON test_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)
  );

CREATE POLICY "Admins can update test results"
  ON test_results
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id', true) 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete test results"
  ON test_results
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id', true) 
      AND role = 'admin'
    )
  );