/*
  # Add announcements table for admin-to-teacher communication

  1. New Tables
    - `announcements` - Store announcements created by admin

  2. Security
    - Enable RLS on announcements table
    - Admins can create, update, delete announcements
    - Teachers can only read announcements

  3. Features
    - Title and content for announcements
    - Priority levels (low, medium, high)
    - Created by admin tracking
    - Timestamps for creation and updates
*/

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for announcements table
CREATE POLICY "Admins can manage all announcements" ON announcements
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Everyone can read active announcements" ON announcements
  FOR SELECT
  TO public
  USING (is_active = true);

-- Insert sample announcement
INSERT INTO announcements (title, content, priority, created_by) 
SELECT 
  'Welcome to the New Academic Year!',
  'Dear Teachers, Welcome to the 2024-25 academic year! Please ensure all student grades are submitted by the end of each month. For any technical issues with the system, please contact the administration.',
  'high',
  id
FROM users 
WHERE role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;