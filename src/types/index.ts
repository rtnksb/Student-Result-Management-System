export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  email: string;
  admissionDate: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  maxMarks: number;
  passingMarks: number;
  classes: string[]; // Which classes this subject is taught in
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  remarks?: string;
  examType: 'assignment' | 'half-yearly' | 'final';
  examDate: string;
  academicYear: string; // e.g., "2024-25"
}

export interface StudentResult {
  student: Student;
  grades: Grade[];
  subjects: Subject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: 'pass' | 'fail';
  resultType: 'half-yearly' | 'full-yearly';
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'teacher';
  name: string;
  email: string;
  assignedClasses?: string[]; // For teachers - which classes they can access
  accessId?: string; // Generated access ID for teachers
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ClassInfo {
  id: string;
  name: string;
  sections: string[];
  assignedTeacher?: string; // Teacher ID
}