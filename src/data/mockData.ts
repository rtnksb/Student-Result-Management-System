import { Student, Subject, Grade, User, ClassInfo } from '../types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    rollNumber: 'JRP001',
    class: '10',
    section: 'A',
    fatherName: 'Hassan Ali',
    motherName: 'Fatima Hassan',
    dateOfBirth: '2008-05-15',
    address: '123 Main Street, Karachi',
    phone: '+92-300-1234567',
    email: 'ahmed.hassan@email.com',
    admissionDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Sara Khan',
    rollNumber: 'JRP002',
    class: '10',
    section: 'A',
    fatherName: 'Khan Muhammad',
    motherName: 'Aisha Khan',
    dateOfBirth: '2008-03-22',
    address: '456 Garden Road, Karachi',
    phone: '+92-300-2345678',
    email: 'sara.khan@email.com',
    admissionDate: '2023-01-15'
  },
  {
    id: '3',
    name: 'Ali Ahmed',
    rollNumber: 'JRP003',
    class: '5',
    section: 'B',
    fatherName: 'Ahmed Raza',
    motherName: 'Zainab Ali',
    dateOfBirth: '2010-07-10',
    address: '789 University Road, Karachi',
    phone: '+92-300-3456789',
    email: 'ali.ahmed@email.com',
    admissionDate: '2023-01-15'
  }
];

export const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    code: 'MATH',
    maxMarks: 100,
    passingMarks: 40,
    classes: ['1', '2', '3', '4', '5']
  },
  {
    id: '2',
    name: 'English',
    code: 'ENG',
    maxMarks: 100,
    passingMarks: 40,
    classes: ['PNC', 'LKG', 'UKG', '1', '2', '3', '4', '5']
  },
  {
    id: '3',
    name: 'Science',
    code: 'SCI',
    maxMarks: 100,
    passingMarks: 40,
    classes: ['3', '4', '5']
  },
  {
    id: '4',
    name: 'Urdu',
    code: 'URD',
    maxMarks: 100,
    passingMarks: 40,
    classes: ['1', '2', '3', '4', '5']
  },
  {
    id: '5',
    name: 'Islamic Studies',
    code: 'ISL',
    maxMarks: 100,
    passingMarks: 40,
    classes: ['1', '2', '3', '4', '5']
  }
];

export const mockGrades: Grade[] = [
  {
    id: '1',
    studentId: '1',
    subjectId: '1',
    marksObtained: 85,
    examType: 'final',
    examDate: '2024-01-15',
    academicYear: '2024-25',
    remarks: 'Excellent performance'
  },
  {
    id: '2',
    studentId: '1',
    subjectId: '2',
    marksObtained: 78,
    examType: 'half-yearly',
    examDate: '2024-01-16',
    academicYear: '2024-25',
    remarks: 'Good understanding'
  },
  {
    id: '3',
    studentId: '2',
    subjectId: '1',
    marksObtained: 92,
    examType: 'final',
    examDate: '2024-01-15',
    academicYear: '2024-25',
    remarks: 'Outstanding'
  },
  {
    id: '4',
    studentId: '1',
    subjectId: '1',
    marksObtained: 15,
    examType: 'assignment',
    examDate: '2024-01-10',
    academicYear: '2024-25',
    remarks: 'Term 1 Assignment 1'
  },
  {
    id: '5',
    studentId: '1',
    subjectId: '1',
    marksObtained: 18,
    examType: 'assignment',
    examDate: '2024-01-20',
    academicYear: '2024-25',
    remarks: 'Term 1 Assignment 2'
  },
  {
    id: '6',
    studentId: '1',
    subjectId: '1',
    marksObtained: 16,
    examType: 'assignment',
    examDate: '2024-02-10',
    academicYear: '2024-25',
    remarks: 'Term 2 Assignment 1'
  },
  {
    id: '7',
    studentId: '1',
    subjectId: '1',
    marksObtained: 19,
    examType: 'assignment',
    examDate: '2024-02-20',
    academicYear: '2024-25',
    remarks: 'Term 2 Assignment 2'
  },
  {
    id: '8',
    studentId: '1',
    subjectId: '1',
    marksObtained: 82,
    examType: 'half-yearly',
    examDate: '2024-01-25',
    academicYear: '2024-25',
    remarks: 'Half yearly examination'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'School Administrator',
    email: 'admin@jrprep.edu.pk'
  },
  {
    id: '2',
    username: 'teacher1',
    password: 'teacher123',
    role: 'teacher',
    name: 'Ms. Sarah Ahmed',
    email: 'sarah.ahmed@jrprep.edu.pk',
    assignedClasses: ['5'],
    accessId: 'TCH001'
  },
  {
    id: '3',
    username: 'teacher2',
    password: 'teacher123',
    role: 'teacher',
    name: 'Mr. Ali Hassan',
    email: 'ali.hassan@jrprep.edu.pk',
    assignedClasses: ['3', '4'],
    accessId: 'TCH002'
  }
];

export const mockClasses: ClassInfo[] = [
  { id: 'PNC', name: 'Pre-Nursery Class', sections: ['A'], assignedTeacher: undefined },
  { id: 'LKG', name: 'Lower Kindergarten', sections: ['A'], assignedTeacher: undefined },
  { id: 'UKG', name: 'Upper Kindergarten', sections: ['A'], assignedTeacher: undefined },
  { id: '1', name: 'Class 1', sections: ['A', 'B'], assignedTeacher: undefined },
  { id: '2', name: 'Class 2', sections: ['A', 'B'], assignedTeacher: undefined },
  { id: '3', name: 'Class 3', sections: ['A', 'B'], assignedTeacher: '3' },
  { id: '4', name: 'Class 4', sections: ['A', 'B'], assignedTeacher: '3' },
  { id: '5', name: 'Class 5', sections: ['A', 'B'], assignedTeacher: '2' }
];