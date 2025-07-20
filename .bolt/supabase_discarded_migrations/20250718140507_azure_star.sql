/*
  # Create users table for authentication

  1. New Tables
    - `users`
      - `id` (text, primary key) - User ID for login
      - `passcode` (text) - User password/passcode
      - `name` (text) - Display name
      - `role` (text) - User role (admin, teacher, student)
      - `created_at` (timestamp)
      - `is_active` (boolean) - Whether user can login

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for admins to manage all users

  3. Initial Data
    - Insert the existing mock users into the database
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  passcode text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  USING (current_setting('app.current_user_role', true) = 'admin');

-- Insert initial users (same as the mock data)
INSERT INTO users (id, passcode, name, role) VALUES
  ('Arnesh', '0008', 'Arnesh', 'admin'),
  ('Night', '69', 'Night', 'admin'),
  ('Focus', 'stud123', 'Focus', 'student')
ON CONFLICT (id) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);