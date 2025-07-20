/*
  # Fix RLS policies for proper authentication

  1. Security Updates
    - Update RLS policies to work with Supabase Auth
    - Remove dependency on custom RPC functions
    - Use auth.uid() for user identification

  2. Policy Changes
    - Simplify user identification in policies
    - Ensure proper access control for all roles
*/

-- Drop existing policies that depend on custom functions
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can read all user data" ON users;
DROP POLICY IF EXISTS "Students can view active tests" ON tests;
DROP POLICY IF EXISTS "Teachers and admins can create tests" ON tests;
DROP POLICY IF EXISTS "Teachers can delete their own tests, admins can delete all" ON tests;
DROP POLICY IF EXISTS "Teachers can update their own tests, admins can update all" ON tests;
DROP POLICY IF EXISTS "Users can insert their own test results" ON test_results;
DROP POLICY IF EXISTS "Users can view their own results, teachers and admins can view " ON test_results;
DROP POLICY IF EXISTS "Admins can delete test results" ON test_results;
DROP POLICY IF EXISTS "Admins can update test results" ON test_results;

-- Create simplified policies for users table
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
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid()::text 
      AND u.role = 'admin'
    )
  );

-- Create simplified policies for tests table
CREATE POLICY "Anyone can view active tests"
  ON tests
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR created_by = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid()::text 
      AND u.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Teachers and admins can create tests"
  ON tests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid()::text 
      AND u.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Teachers can update their own tests, admins can update all"
  ON tests
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid()::text 
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Teachers can delete their own tests, admins can delete all"
  ON tests
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid()::text 
      AND u.role = 'admin'
    )
  );

-- Create simplified policies for test_results table
CREATE POLICY "Users can view their own results, teachers and admins can view all"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid()::text 
      AND u.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Users can insert their own test results"
  ON test_results
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Admins can update test results"
  ON test_results
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid()::text 
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete test results"
  ON test_results
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid()::text 
      AND u.role = 'admin'
    )
  );