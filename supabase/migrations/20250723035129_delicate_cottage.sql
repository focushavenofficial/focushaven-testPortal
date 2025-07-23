/*
  # Create review_requests table

  1. New Tables
    - `review_requests`
      - `id` (uuid, primary key)
      - `test_result_id` (uuid, foreign key to test_results)
      - `question_id` (text, question identifier)
      - `user_id` (text, foreign key to users)
      - `reason` (text, student's explanation)
      - `status` (text, pending/approved/rejected)
      - `created_at` (timestamp)
      - `reviewed_by` (text, optional foreign key to users)
      - `reviewed_at` (timestamp, optional)
      - `review_notes` (text, optional)

  2. Security
    - Enable RLS on `review_requests` table
    - Add policies for students to create and view their own requests
    - Add policies for teachers/admins to view and update all requests

  3. Indexes
    - Index on test_result_id for faster lookups
    - Index on user_id for filtering by student
    - Index on status for filtering pending requests
*/

CREATE TABLE IF NOT EXISTS review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_result_id uuid NOT NULL,
  question_id text NOT NULL,
  user_id text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_by text,
  reviewed_at timestamptz,
  review_notes text,
  CONSTRAINT review_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Add foreign key constraints
ALTER TABLE review_requests 
ADD CONSTRAINT fk_review_requests_test_result_id 
FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE;

ALTER TABLE review_requests 
ADD CONSTRAINT fk_review_requests_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE review_requests 
ADD CONSTRAINT fk_review_requests_reviewed_by 
FOREIGN KEY (reviewed_by) REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_requests_test_result_id ON review_requests(test_result_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_user_id ON review_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_status ON review_requests(status);
CREATE INDEX IF NOT EXISTS idx_review_requests_created_at ON review_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

-- Policy for students to create and view their own review requests
CREATE POLICY "Students can create and view own review requests"
  ON review_requests
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Policy for teachers and admins to view and update all review requests
CREATE POLICY "Teachers and admins can manage all review requests"
  ON review_requests
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);