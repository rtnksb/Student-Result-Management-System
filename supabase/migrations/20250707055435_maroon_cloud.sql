/*
  # Add INSERT policy for users table

  1. Security Changes
    - Add policy to allow admins to insert new users
    - This enables the admin functionality to create new teacher accounts

  The policy checks if the current authenticated user has admin role
  before allowing them to insert new user records.
*/

-- Add policy to allow admins to insert new users
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );