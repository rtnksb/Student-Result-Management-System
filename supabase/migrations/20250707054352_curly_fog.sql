/*
  # Initial Schema for Student Result Management System

  1. New Tables
    - `users` - System users (admin, teachers)
    - `classes` - Class information with sections
    - `subjects` - Subject details and class assignments
    - `students` - Student information
    - `grades` - Student grades and exam results

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Admin can access everything
    - Teachers can only access their assigned classes

  3. Features
    - User authentication and role management
    - Class and subject management
    - Student enrollment and grade tracking
    - Assignment and exam result storage
*/

-- Create users table for system authentication
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
  sections text[] NOT NULL DEFAULT '{}',
  assigned_teacher uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  max_marks integer NOT NULL DEFAULT 100,
  passing_marks integer NOT NULL DEFAULT 40,
  classes text[] NOT NULL DEFAULT '{}',
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for classes table
CREATE POLICY "Everyone can read classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for subjects table
CREATE POLICY "Everyone can read subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subjects"
  ON subjects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for students table
CREATE POLICY "Users can read students in their classes"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR class = ANY(assigned_classes)
      )
    )
  );

CREATE POLICY "Users can manage students in their classes"
  ON students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR class = ANY(assigned_classes)
      )
    )
  );

-- Create policies for grades table
CREATE POLICY "Users can read grades for their students"
  ON grades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON u.id = auth.uid()
      WHERE s.id = grades.student_id
      AND (
        u.role = 'admin'
        OR s.class = ANY(u.assigned_classes)
      )
    )
  );

CREATE POLICY "Users can manage grades for their students"
  ON grades
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON u.id = auth.uid()
      WHERE s.id = grades.student_id
      AND (
        u.role = 'admin'
        OR s.class = ANY(u.assigned_classes)
      )
    )
  );

-- Insert initial data
INSERT INTO users (id, username, password, role, name, email, assigned_classes, access_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin123', 'admin', 'School Administrator', 'admin@jrprep.edu.pk', '{}', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'teacher1', 'teacher123', 'teacher', 'Ms. Sarah Ahmed', 'sarah.ahmed@jrprep.edu.pk', '{"5"}', 'TCH001'),
  ('550e8400-e29b-41d4-a716-446655440003', 'teacher2', 'teacher123', 'teacher', 'Mr. Ali Hassan', 'ali.hassan@jrprep.edu.pk', '{"3","4"}', 'TCH002')
ON CONFLICT (username) DO NOTHING;

INSERT INTO classes (id, name, sections, assigned_teacher) VALUES
  ('PNC', 'Pre-Nursery Class', '{"A"}', NULL),
  ('LKG', 'Lower Kindergarten', '{"A"}', NULL),
  ('UKG', 'Upper Kindergarten', '{"A"}', NULL),
  ('1', 'Class 1', '{"A","B"}', NULL),
  ('2', 'Class 2', '{"A","B"}', NULL),
  ('3', 'Class 3', '{"A","B"}', '550e8400-e29b-41d4-a716-446655440003'),
  ('4', 'Class 4', '{"A","B"}', '550e8400-e29b-41d4-a716-446655440003'),
  ('5', 'Class 5', '{"A","B"}', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO subjects (id, name, code, max_marks, passing_marks, classes) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'Mathematics', 'MATH', 100, 40, '{"1","2","3","4","5"}'),
  ('550e8400-e29b-41d4-a716-446655440012', 'English', 'ENG', 100, 40, '{"PNC","LKG","UKG","1","2","3","4","5"}'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Science', 'SCI', 100, 40, '{"3","4","5"}'),
  ('550e8400-e29b-41d4-a716-446655440014', 'Urdu', 'URD', 100, 40, '{"1","2","3","4","5"}'),
  ('550e8400-e29b-41d4-a716-446655440015', 'Islamic Studies', 'ISL', 100, 40, '{"1","2","3","4","5"}')
ON CONFLICT (code) DO NOTHING;

INSERT INTO students (id, name, roll_number, class, section, father_name, mother_name, date_of_birth, address, phone, email, admission_date) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 'Ahmed Hassan', 'JRP001', '10', 'A', 'Hassan Ali', 'Fatima Hassan', '2008-05-15', '123 Main Street, Karachi', '+92-300-1234567', 'ahmed.hassan@email.com', '2023-01-15'),
  ('550e8400-e29b-41d4-a716-446655440022', 'Sara Khan', 'JRP002', '10', 'A', 'Khan Muhammad', 'Aisha Khan', '2008-03-22', '456 Garden Road, Karachi', '+92-300-2345678', 'sara.khan@email.com', '2023-01-15'),
  ('550e8400-e29b-41d4-a716-446655440023', 'Ali Ahmed', 'JRP003', '5', 'B', 'Ahmed Raza', 'Zainab Ali', '2010-07-10', '789 University Road, Karachi', '+92-300-3456789', 'ali.ahmed@email.com', '2023-01-15')
ON CONFLICT (roll_number) DO NOTHING;

INSERT INTO grades (id, student_id, subject_id, marks_obtained, exam_type, exam_date, academic_year, remarks) VALUES
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 85, 'final', '2024-01-15', '2024-25', 'Excellent performance'),
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440012', 78, 'half-yearly', '2024-01-16', '2024-25', 'Good understanding'),
  ('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440011', 92, 'final', '2024-01-15', '2024-25', 'Outstanding'),
  ('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 15, 'assignment', '2024-01-10', '2024-25', 'Term 1 Assignment 1'),
  ('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 18, 'assignment', '2024-01-20', '2024-25', 'Term 1 Assignment 2'),
  ('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 16, 'assignment', '2024-02-10', '2024-25', 'Term 2 Assignment 1'),
  ('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 19, 'assignment', '2024-02-20', '2024-25', 'Term 2 Assignment 2'),
  ('550e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 82, 'half-yearly', '2024-01-25', '2024-25', 'Half yearly examination')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_academic_year ON grades(academic_year);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);