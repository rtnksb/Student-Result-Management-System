import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Subject, Grade, User, ClassInfo } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType {
  students: Student[];
  subjects: Subject[];
  grades: Grade[];
  users: User[];
  classes: ClassInfo[];
  loading: boolean;
  error: string | null;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addGrade: (grade: Omit<Grade, 'id'>) => Promise<void>;
  updateGrade: (id: string, grade: Partial<Grade>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  updateClass: (id: string, classInfo: Partial<ClassInfo>) => Promise<void>;
  generateTeacherCredentials: () => { username: string; password: string; accessId: string };
  generateUsernameFromName: (name: string) => string;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database row to application types
  const convertDbUser = (dbUser: any): User => ({
    id: dbUser.id,
    username: dbUser.username,
    password: dbUser.password,
    role: dbUser.role,
    name: dbUser.name,
    email: dbUser.email,
    assignedClasses: dbUser.assigned_classes || [],
    accessId: dbUser.access_id
  });

  const convertDbClass = (dbClass: any): ClassInfo => ({
    id: dbClass.id,
    name: dbClass.name,
    sections: dbClass.sections || [],
    assignedTeacher: dbClass.assigned_teacher
  });

  const convertDbSubject = (dbSubject: any): Subject => ({
    id: dbSubject.id,
    name: dbSubject.name,
    code: dbSubject.code,
    maxMarks: dbSubject.max_marks,
    passingMarks: dbSubject.passing_marks,
    classes: dbSubject.classes || []
  });

  const convertDbStudent = (dbStudent: any): Student => ({
    id: dbStudent.id,
    name: dbStudent.name,
    rollNumber: dbStudent.roll_number,
    class: dbStudent.class,
    section: dbStudent.section,
    fatherName: dbStudent.father_name,
    motherName: dbStudent.mother_name,
    dateOfBirth: dbStudent.date_of_birth,
    address: dbStudent.address,
    phone: dbStudent.phone,
    email: dbStudent.email || '',
    admissionDate: dbStudent.admission_date
  });

  const convertDbGrade = (dbGrade: any): Grade => ({
    id: dbGrade.id,
    studentId: dbGrade.student_id,
    subjectId: dbGrade.subject_id,
    marksObtained: dbGrade.marks_obtained,
    examType: dbGrade.exam_type,
    examDate: dbGrade.exam_date,
    academicYear: dbGrade.academic_year,
    remarks: dbGrade.remarks || ''
  });

  // Load all data from Supabase
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [usersResult, classesResult, subjectsResult, studentsResult, gradesResult] = await Promise.allSettled([
        supabase.from('users').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('subjects').select('*'),
        supabase.from('students').select('*'),
        supabase.from('grades').select('*')
      ]);

      // Process users
      if (usersResult.status === 'fulfilled' && !usersResult.value.error) {
        setUsers(usersResult.value.data?.map(convertDbUser) || []);
      } else {
        console.error('Error loading users:', usersResult.status === 'fulfilled' ? usersResult.value.error : usersResult.reason);
      }

      // Process classes
      if (classesResult.status === 'fulfilled' && !classesResult.value.error) {
        setClasses(classesResult.value.data?.map(convertDbClass) || []);
      } else {
        console.error('Error loading classes:', classesResult.status === 'fulfilled' ? classesResult.value.error : classesResult.reason);
      }

      // Process subjects
      if (subjectsResult.status === 'fulfilled' && !subjectsResult.value.error) {
        setSubjects(subjectsResult.value.data?.map(convertDbSubject) || []);
      } else {
        console.error('Error loading subjects:', subjectsResult.status === 'fulfilled' ? subjectsResult.value.error : subjectsResult.reason);
      }

      // Process students
      if (studentsResult.status === 'fulfilled' && !studentsResult.value.error) {
        setStudents(studentsResult.value.data?.map(convertDbStudent) || []);
      } else {
        console.error('Error loading students:', studentsResult.status === 'fulfilled' ? studentsResult.value.error : studentsResult.reason);
      }

      // Process grades
      if (gradesResult.status === 'fulfilled' && !gradesResult.value.error) {
        setGrades(gradesResult.value.data?.map(convertDbGrade) || []);
      } else {
        console.error('Error loading grades:', gradesResult.status === 'fulfilled' ? gradesResult.value.error : gradesResult.reason);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const generateTeacherCredentials = () => {
    const teacherCount = users.filter(u => u.role === 'teacher').length;
    const accessId = `TCH${String(teacherCount + 1).padStart(3, '0')}`;
    const password = Math.random().toString(36).slice(-8);
    const username = `teacher${String(teacherCount + 1).padStart(3, '0')}`;
    
    return { username, password, accessId };
  };

const generateUsernameFromName = (name: string): string => {
  // Clean and split the name
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '').trim();

  // Extract up to 4 letters
  const namePart = cleanName.slice(0, 4).padEnd(4, 'x'); // fallback to 'x' padding if too short

  let username = '';
  let attempt = 0;
  const maxAttempts = 10000;

  // Try different digit combinations until a unique one is found
  while (attempt < maxAttempts) {
    const digitsLength = Math.floor(Math.random() * 3) + 4; // Random between 4 and 6
    const digits = Math.floor(Math.random() * Math.pow(10, digitsLength))
      .toString()
      .padStart(digitsLength, '0');

    username = namePart + digits;

    if (!users.some(user => user.username === username)) {
      return username;
    }

    attempt++;
  }

  throw new Error('Unable to generate unique username after multiple attempts');
};


  // Student operations
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          name: studentData.name,
          roll_number: studentData.rollNumber,
          class: studentData.class,
          section: studentData.section,
          father_name: studentData.fatherName,
          mother_name: studentData.motherName,
          date_of_birth: studentData.dateOfBirth,
          address: studentData.address,
          phone: studentData.phone,
          email: studentData.email || null,
          admission_date: studentData.admissionDate
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setStudents(prev => [...prev, convertDbStudent(data)]);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      const updateData: any = {};
      if (studentData.name) updateData.name = studentData.name;
      if (studentData.rollNumber) updateData.roll_number = studentData.rollNumber;
      if (studentData.class) updateData.class = studentData.class;
      if (studentData.section) updateData.section = studentData.section;
      if (studentData.fatherName) updateData.father_name = studentData.fatherName;
      if (studentData.motherName) updateData.mother_name = studentData.motherName;
      if (studentData.dateOfBirth) updateData.date_of_birth = studentData.dateOfBirth;
      if (studentData.address) updateData.address = studentData.address;
      if (studentData.phone) updateData.phone = studentData.phone;
      if (studentData.email !== undefined) updateData.email = studentData.email || null;
      if (studentData.admissionDate) updateData.admission_date = studentData.admissionDate;

      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setStudents(prev => prev.map(student => 
          student.id === id ? convertDbStudent(data) : student
        ));
      }
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStudents(prev => prev.filter(student => student.id !== id));
      setGrades(prev => prev.filter(grade => grade.studentId !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  };

  // Grade operations
  const addGrade = async (gradeData: Omit<Grade, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert({
          student_id: gradeData.studentId,
          subject_id: gradeData.subjectId,
          marks_obtained: gradeData.marksObtained,
          exam_type: gradeData.examType,
          exam_date: gradeData.examDate,
          academic_year: gradeData.academicYear,
          remarks: gradeData.remarks || null
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setGrades(prev => [...prev, convertDbGrade(data)]);
      }
    } catch (error) {
      console.error('Error adding grade:', error);
      throw error;
    }
  };

  const updateGrade = async (id: string, gradeData: Partial<Grade>) => {
    try {
      const updateData: any = {};
      if (gradeData.studentId) updateData.student_id = gradeData.studentId;
      if (gradeData.subjectId) updateData.subject_id = gradeData.subjectId;
      if (gradeData.marksObtained !== undefined) updateData.marks_obtained = gradeData.marksObtained;
      if (gradeData.examType) updateData.exam_type = gradeData.examType;
      if (gradeData.examDate) updateData.exam_date = gradeData.examDate;
      if (gradeData.academicYear) updateData.academic_year = gradeData.academicYear;
      if (gradeData.remarks !== undefined) updateData.remarks = gradeData.remarks || null;

      const { data, error } = await supabase
        .from('grades')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setGrades(prev => prev.map(grade => 
          grade.id === id ? convertDbGrade(data) : grade
        ));
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  };

  const deleteGrade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGrades(prev => prev.filter(grade => grade.id !== id));
    } catch (error) {
      console.error('Error deleting grade:', error);
      throw error;
    }
  };

  // User operations
  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: userData.username,
          password: userData.password,
          role: userData.role,
          name: userData.name,
          email: userData.email,
          assigned_classes: userData.assignedClasses || [],
          access_id: userData.accessId || null
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setUsers(prev => [...prev, convertDbUser(data)]);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const updateData: any = {};
      if (userData.username) updateData.username = userData.username;
      if (userData.password) updateData.password = userData.password;
      if (userData.role) updateData.role = userData.role;
      if (userData.name) updateData.name = userData.name;
      if (userData.email) updateData.email = userData.email;
      if (userData.assignedClasses !== undefined) updateData.assigned_classes = userData.assignedClasses;
      if (userData.accessId !== undefined) updateData.access_id = userData.accessId || null;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setUsers(prev => prev.map(user => 
          user.id === id ? convertDbUser(data) : user
        ));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Unassign teacher from classes
      await supabase
        .from('classes')
        .update({ assigned_teacher: null })
        .eq('assigned_teacher', id);

      // Delete user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  // Subject operations
  const addSubject = async (subjectData: Omit<Subject, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: subjectData.name,
          code: subjectData.code,
          max_marks: subjectData.maxMarks,
          passing_marks: subjectData.passingMarks,
          classes: subjectData.classes
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSubjects(prev => [...prev, convertDbSubject(data)]);
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  };

  const updateSubject = async (id: string, subjectData: Partial<Subject>) => {
    try {
      const updateData: any = {};
      if (subjectData.name) updateData.name = subjectData.name;
      if (subjectData.code) updateData.code = subjectData.code;
      if (subjectData.maxMarks !== undefined) updateData.max_marks = subjectData.maxMarks;
      if (subjectData.passingMarks !== undefined) updateData.passing_marks = subjectData.passingMarks;
      if (subjectData.classes !== undefined) updateData.classes = subjectData.classes;

      const { data, error } = await supabase
        .from('subjects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSubjects(prev => prev.map(subject => 
          subject.id === id ? convertDbSubject(data) : subject
        ));
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubjects(prev => prev.filter(subject => subject.id !== id));
      setGrades(prev => prev.filter(grade => grade.subjectId !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  };

  // Class operations
  const updateClass = async (id: string, classData: Partial<ClassInfo>) => {
    try {
      const updateData: any = {};
      if (classData.name) updateData.name = classData.name;
      if (classData.sections !== undefined) updateData.sections = classData.sections;
      if (classData.assignedTeacher !== undefined) updateData.assigned_teacher = classData.assignedTeacher || null;

      const { data, error } = await supabase
        .from('classes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setClasses(prev => prev.map(cls => 
          cls.id === id ? convertDbClass(data) : cls
        ));
      }
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      students,
      subjects,
      grades,
      users,
      classes,
      loading,
      error,
      addStudent,
      updateStudent,
      deleteStudent,
      addGrade,
      updateGrade,
      deleteGrade,
      addUser,
      updateUser,
      deleteUser,
      addSubject,
      updateSubject,
      deleteSubject,
      updateClass,
      generateTeacherCredentials,
      generateUsernameFromName,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};