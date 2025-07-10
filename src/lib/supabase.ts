import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password: string;
          role: 'admin' | 'teacher';
          name: string;
          email: string;
          assigned_classes: string[];
          access_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password: string;
          role: 'admin' | 'teacher';
          name: string;
          email: string;
          assigned_classes?: string[];
          access_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password?: string;
          role?: 'admin' | 'teacher';
          name?: string;
          email?: string;
          assigned_classes?: string[];
          access_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          sections: string[];
          assigned_teacher: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          sections: string[];
          assigned_teacher?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sections?: string[];
          assigned_teacher?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string;
          max_marks: number;
          passing_marks: number;
          classes: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          max_marks?: number;
          passing_marks?: number;
          classes: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          max_marks?: number;
          passing_marks?: number;
          classes?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          name: string;
          roll_number: string;
          class: string;
          section: string;
          father_name: string;
          mother_name: string;
          date_of_birth: string;
          address: string;
          phone: string;
          email: string | null;
          admission_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          roll_number: string;
          class: string;
          section: string;
          father_name: string;
          mother_name: string;
          date_of_birth: string;
          address: string;
          phone: string;
          email?: string | null;
          admission_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          roll_number?: string;
          class?: string;
          section?: string;
          father_name?: string;
          mother_name?: string;
          date_of_birth?: string;
          address?: string;
          phone?: string;
          email?: string | null;
          admission_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      grades: {
        Row: {
          id: string;
          student_id: string;
          subject_id: string;
          marks_obtained: number;
          exam_type: 'assignment' | 'half-yearly' | 'final';
          exam_date: string;
          academic_year: string;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject_id: string;
          marks_obtained: number;
          exam_type: 'assignment' | 'half-yearly' | 'final';
          exam_date: string;
          academic_year: string;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          subject_id?: string;
          marks_obtained?: number;
          exam_type?: 'assignment' | 'half-yearly' | 'final';
          exam_date?: string;
          academic_year?: string;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}