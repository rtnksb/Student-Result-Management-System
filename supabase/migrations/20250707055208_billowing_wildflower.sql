/*
  # Complete School Management System Database Schema

  1. New Tables
    - `users` - System users (admin and teachers)
    - `classes` - School classes with sections
    - `subjects` - Academic subjects
    - `students` - Student records
    - `grades` - Student grades and marks

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Admins have full access, teachers have limited access to assigned classes

  3. Sample Data
    - Default admin user
    - Sample classes (1-10)
    - Basic subjects
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  -- Drop policies for users table
  DROP POLICY IF EXISTS "Admins can manage all users" ON users;
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  
  -- Drop policies for classes table
  DROP POLICY IF EXISTS "Admins can manage classes" ON classes;
  DROP POLICY IF EXISTS "Everyone can read classes" ON classes;
  
  -- Drop policies for subjects table
  DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects;
  DROP POLICY IF EXISTS "Everyone can read subjects" ON subjects;
  
  -- Drop policies for students table
  DROP POLICY IF EXISTS "Users can manage students in their classes" ON students;
  DROP POLICY IF EXISTS "Users can read students in their classes" ON students;
  
  -- Drop policies for grades table
  DROP POLICY IF EXISTS "Users can manage grades for their students" ON grades;
  DROP POLICY IF EXISTS "Users can read grades for their students" ON grades;
EXCEPTION
  WHEN undefined_table THEN
    NULL; -- Table doesn't exist yet, continue
  WHEN undefined_object THEN
    NULL; -- Policy doesn't exist, continue
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'teacher')),
  name text NOT NULL,
  email text NOT NULL,
  assigned_classes text[] DEFAULT '{}',
  access_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id text PRIMARY KEY,
  name text NOT NULL,
  sections text[] DEFAULT '{}',
  assigned_teacher uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  max_marks integer DEFAULT 100,
  passing_marks integer DEFAULT 40,
  classes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  roll_number text UNIQUE NOT NULL,
  class text NOT NULL,
  section text NOT NULL,
  father_name text NOT NULL,
  mother_name text NOT NULL,
  date_of_birth date NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text,
  admission_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  marks_obtained integer NOT NULL,
  exam_type text NOT NULL CHECK (exam_type IN ('assignment', 'half-yearly', 'final')),
  exam_date date NOT NULL,
  academic_year text NOT NULL,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_academic_year ON grades(academic_year);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Create RLS policies for classes table
CREATE POLICY "Admins can manage classes" ON classes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Everyone can read classes" ON classes
  FOR SELECT TO authenticated
  USING (true);

-- Create RLS policies for subjects table
CREATE POLICY "Admins can manage subjects" ON subjects
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Everyone can read subjects" ON subjects
  FOR SELECT TO authenticated
  USING (true);

-- Create RLS policies for students table
CREATE POLICY "Users can manage students in their classes" ON students
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR students.class = ANY(users.assigned_classes))
    )
  );

CREATE POLICY "Users can read students in their classes" ON students
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR students.class = ANY(users.assigned_classes))
    )
  );

-- Create RLS policies for grades table
CREATE POLICY "Users can manage grades for their students" ON grades
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON u.id = auth.uid()
      WHERE s.id = grades.student_id 
      AND (u.role = 'admin' OR s.class = ANY(u.assigned_classes))
    )
  );

CREATE POLICY "Users can read grades for their students" ON grades
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON u.id = auth.uid()
      WHERE s.id = grades.student_id 
      AND (u.role = 'admin' OR s.class = ANY(u.assigned_classes))
    )
  );

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role, name, email) 
VALUES ('admin', 'admin123', 'admin', 'System Administrator', 'admin@school.edu')
ON CONFLICT (username) DO NOTHING;

-- Insert sample classes
INSERT INTO classes (id, name, sections) VALUES 
  ('1', 'Class 1', ARRAY['A', 'B']),
  ('2', 'Class 2', ARRAY['A', 'B']),
  ('3', 'Class 3', ARRAY['A', 'B']),
  ('4', 'Class 4', ARRAY['A', 'B']),
  ('5', 'Class 5', ARRAY['A', 'B']),
  ('6', 'Class 6', ARRAY['A', 'B']),
  ('7', 'Class 7', ARRAY['A', 'B']),
  ('8', 'Class 8', ARRAY['A', 'B']),
  ('9', 'Class 9', ARRAY['A', 'B']),
  ('10', 'Class 10', ARRAY['A', 'B'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample subjects
INSERT INTO subjects (name, code, max_marks, passing_marks, classes) VALUES 
  ('Mathematics', 'MATH', 100, 40, ARRAY['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
  ('English', 'ENG', 100, 40, ARRAY['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
  ('Science', 'SCI', 100, 40, ARRAY['3', '4', '5', '6', '7', '8', '9', '10']),
  ('Social Studies', 'SS', 100, 40, ARRAY['3', '4', '5', '6', '7', '8', '9', '10']),
  ('Hindi', 'HIN', 100, 40, ARRAY['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
ON CONFLICT (code) DO NOTHING;