import React, { useState } from 'react';
import { Save, Search, BookOpen, Trophy, Calendar, AlertCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Student, Subject, Grade } from '../../types';

const GradeEntry: React.FC = () => {
  const { students, subjects, grades, addGrade } = useData();
  const { user, canAccessClass } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeData, setGradeData] = useState({
    marksObtained: '',
    examType: 'assignment' as const,
    examDate: new Date().toISOString().split('T')[0],
    academicYear: '2024-25',
    remarks: '',
    term: 'first' as 'first' | 'second'
  });

  // Filter students based on user permissions
  const accessibleStudents = user?.role === 'admin' 
    ? students 
    : students.filter(student => canAccessClass(student.class));

  const filteredStudents = accessibleStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject) return;

    // Check if user can access this student's class
    if (!canAccessClass(selectedStudent.class)) {
      alert('You do not have permission to enter grades for this student.');
      return;
    }

    // Check assignment limits
    if (gradeData.examType === 'assignment') {
      const existingAssignments = grades.filter(g => 
        g.studentId === selectedStudent.id && 
        g.subjectId === selectedSubject.id && 
        g.examType === 'assignment' &&
        g.academicYear === gradeData.academicYear &&
        g.remarks?.includes(gradeData.term === 'first' ? 'Term 1' : 'Term 2')
      );

      if (existingAssignments.length >= 2) {
        alert(`Maximum 2 assignments per term already entered for ${gradeData.term === 'first' ? 'first' : 'second'} term.`);
        return;
      }
    }

    const assignmentNumber = gradeData.examType === 'assignment' 
      ? grades.filter(g => 
          g.studentId === selectedStudent.id && 
          g.subjectId === selectedSubject.id && 
          g.examType === 'assignment' &&
          g.academicYear === gradeData.academicYear &&
          g.remarks?.includes(gradeData.term === 'first' ? 'Term 1' : 'Term 2')
        ).length + 1
      : null;

    const newGrade: Omit<Grade, 'id'> = {
      studentId: selectedStudent.id,
      subjectId: selectedSubject.id,
      marksObtained: parseInt(gradeData.marksObtained),
      examType: gradeData.examType,
      examDate: gradeData.examDate,
      academicYear: gradeData.academicYear,
      remarks: gradeData.examType === 'assignment' 
        ? `${gradeData.term === 'first' ? 'Term 1' : 'Term 2'} Assignment ${assignmentNumber}`
        : gradeData.remarks
    };

    addGrade(newGrade);
    
    // Reset form
    setGradeData({
      marksObtained: '',
      examType: 'assignment',
      examDate: new Date().toISOString().split('T')[0],
      academicYear: '2024-25',
      remarks: '',
      term: 'first'
    });
    
    alert('Grade saved successfully!');
  };

  const getStudentGrades = (studentId: string) => {
    return grades.filter(grade => grade.studentId === studentId);
  };

  const getAssignmentsByTerm = (studentId: string, subjectId: string, term: 'first' | 'second') => {
    return grades.filter(grade => 
      grade.studentId === studentId && 
      grade.subjectId === subjectId &&
      grade.examType === 'assignment' &&
      grade.academicYear === gradeData.academicYear &&
      grade.remarks?.includes(term === 'first' ? 'Term 1' : 'Term 2')
    );
  };

  const getGradesByType = (studentId: string, examType: string) => {
    return grades.filter(grade => 
      grade.studentId === studentId && 
      grade.examType === examType &&
      grade.academicYear === gradeData.academicYear
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Grade Entry</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <BookOpen className="h-4 w-4" />
          <span>Enter and manage student grades</span>
        </div>
      </div>

      {/* Academic Year Selector */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Academic Year: {gradeData.academicYear}</span>
          </div>
          <select
            value={gradeData.academicYear}
            onChange={(e) => setGradeData(prev => ({ ...prev, academicYear: e.target.value }))}
            className="px-3 py-1 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
          </select>
        </div>
      </div>

      {/* Assignment System Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <span className="text-amber-800 font-medium">Assignment System</span>
        </div>
        <p className="text-amber-700 text-sm">
          Each subject has exactly 4 assignments per year: 2 in first term + 2 in second term
        </p>
      </div>

      {/* Access Level Indicator */}
      {user?.role === 'teacher' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-amber-800">
              You can only enter grades for students in your assigned classes: {user.assignedClasses?.join(', ')}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Selection */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Student</h3>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2">
            {filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedStudent?.id === student.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.rollNumber} - Class {student.class}-{student.section}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {getStudentGrades(student.id).length} grades
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No accessible students found
            </div>
          )}
        </div>

        {/* Grade Entry Form */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Grade</h3>
          
          {!selectedStudent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Select a student to enter grades</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">{selectedStudent.name}</h4>
                <p className="text-sm text-blue-700">{selectedStudent.rollNumber} - Class {selectedStudent.class}-{selectedStudent.section}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <select
                  value={selectedSubject?.id || ''}
                  onChange={(e) => setSelectedSubject(subjects.find(s => s.id === e.target.value) || null)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Subject</option>
                  {subjects.filter(subject => subject.classes.includes(selectedStudent.class)).map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubject && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  Max Marks: {selectedSubject.maxMarks} | Passing Marks: {selectedSubject.passingMarks}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type *</label>
                <select
                  value={gradeData.examType}
                  onChange={(e) => setGradeData(prev => ({ ...prev, examType: e.target.value as any }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="assignment">Assignment</option>
                  <option value="half-yearly">Half Yearly Exam</option>
                  <option value="final">Final Exam</option>
                </select>
              </div>

              {gradeData.examType === 'assignment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
                  <select
                    value={gradeData.term}
                    onChange={(e) => setGradeData(prev => ({ ...prev, term: e.target.value as 'first' | 'second' }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="first">First Term</option>
                    <option value="second">Second Term</option>
                  </select>
                  {selectedSubject && (
                    <div className="mt-2 text-sm text-gray-600">
                      {gradeData.term === 'first' ? 'First' : 'Second'} term assignments: {
                        getAssignmentsByTerm(selectedStudent.id, selectedSubject.id, gradeData.term).length
                      }/2 completed
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marks Obtained *</label>
                <input
                  type="number"
                  value={gradeData.marksObtained}
                  onChange={(e) => setGradeData(prev => ({ ...prev, marksObtained: e.target.value }))}
                  min="0"
                  max={gradeData.examType === 'assignment' ? 20 : selectedSubject?.maxMarks || 100}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {gradeData.examType === 'assignment' && (
                  <p className="text-xs text-gray-500 mt-1">Assignment marks: Max 20</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date *</label>
                <input
                  type="date"
                  value={gradeData.examDate}
                  onChange={(e) => setGradeData(prev => ({ ...prev, examDate: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {gradeData.examType !== 'assignment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    value={gradeData.remarks}
                    onChange={(e) => setGradeData(prev => ({ ...prev, remarks: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Grade
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Student Grades Overview */}
      {selectedStudent && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Grades Overview for {selectedStudent.name} ({gradeData.academicYear})
          </h3>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Subject</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm hidden sm:table-cell">Term 1</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm hidden sm:table-cell">Term 2</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Half</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Final</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {subjects.filter(subject => subject.classes.includes(selectedStudent.class)).map(subject => {
                  const term1Assignments = getAssignmentsByTerm(selectedStudent.id, subject.id, 'first');
                  const term2Assignments = getAssignmentsByTerm(selectedStudent.id, subject.id, 'second');
                  const halfYearlyGrade = grades.find(g => 
                    g.studentId === selectedStudent.id && 
                    g.subjectId === subject.id && 
                    g.examType === 'half-yearly' &&
                    g.academicYear === gradeData.academicYear
                  );
                  const finalGrade = grades.find(g => 
                    g.studentId === selectedStudent.id && 
                    g.subjectId === subject.id && 
                    g.examType === 'final' &&
                    g.academicYear === gradeData.academicYear
                  );
                  
                  const term1Total = term1Assignments.reduce((sum, g) => sum + g.marksObtained, 0);
                  const term2Total = term2Assignments.reduce((sum, g) => sum + g.marksObtained, 0);
                  const totalAssignments = term1Total + term2Total;
                  
                  return (
                    <tr key={subject.id} className="border-t">
                      <td className="py-3 px-2 sm:px-4 font-medium text-sm">{subject.name}</td>
                      <td className="py-3 px-2 sm:px-4 text-sm hidden sm:table-cell">
                        <span className={`${term1Assignments.length === 2 ? 'text-green-600' : 'text-orange-600'}`}>
                          {term1Total}/40 ({term1Assignments.length}/2)
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-sm hidden sm:table-cell">
                        <span className={`${term2Assignments.length === 2 ? 'text-green-600' : 'text-orange-600'}`}>
                          {term2Total}/40 ({term2Assignments.length}/2)
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-sm">
                        {halfYearlyGrade ? (
                          <span className="text-blue-600">{halfYearlyGrade.marksObtained}/{subject.maxMarks}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-sm">
                        {finalGrade ? (
                          <span className="text-purple-600">{finalGrade.marksObtained}/{subject.maxMarks}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-sm">
                        <span className="font-semibold text-gray-900">{totalAssignments}/80</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeEntry;