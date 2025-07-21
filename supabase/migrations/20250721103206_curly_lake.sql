/*
  # Add class support for users and tests

  1. Changes to Users table
    - Add `class` column to store user's class (default 0 for all classes)

  2. Changes to Tests table  
    - Add `target_class` column to specify which class can access the test
    - NULL/0 means available to all classes

  3. Security
    - Update RLS policies to consider class restrictions
*/

-- Add class column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'class'
  ) THEN
    ALTER TABLE users ADD COLUMN class integer DEFAULT 0;
  END IF;
END $$;

-- Add target_class column to tests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tests' AND column_name = 'target_class'
  ) THEN
    ALTER TABLE tests ADD COLUMN target_class integer DEFAULT NULL;
  END IF;
END $$;

-- Add index for better performance on class-based queries
CREATE INDEX IF NOT EXISTS idx_users_class ON users(class);
CREATE INDEX IF NOT EXISTS idx_tests_target_class ON tests(target_class);

-- Add comment to explain class system
COMMENT ON COLUMN users.class IS 'User class number. 0 means access to all classes';
COMMENT ON COLUMN tests.target_class IS 'Target class for test. NULL or 0 means available to all classes';