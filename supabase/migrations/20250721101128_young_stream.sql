/*
  # Remove passcode requirement from users table

  1. Changes
    - Make passcode column nullable since we're using external auth
    - This allows AstraDB users to be synced without requiring a passcode
*/

-- Make passcode nullable since we use external authentication
ALTER TABLE users ALTER COLUMN passcode DROP NOT NULL;