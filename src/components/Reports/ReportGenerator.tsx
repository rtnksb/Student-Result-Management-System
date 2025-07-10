import React, { useState } from 'react';
import { Download, FileText, Search, Filter, Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Student, StudentResult } from '../../types';
import { generateStudentResultPDF } from '../../utils/pdfGenerator';

const ReportGenerator: React.FC = () => {
  const { students, subjects, grades } = useData();
  const { user, canAccessClass } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [resultType, setResultType] = useState<'half-yearly' | 'full-yearly'>('half-yearly');
  const [academicYear, setAcademicYear] = useState('2024-25');

  // Filter students based on user permissions
  const accessibleStudents = user?.role === 'admin' 
    ? students 
    : students.filter(student => canAccessClass(student.class));

  const filteredStudents = accessibleStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    return matchesSearch && matchesClass && matchesSection;
  });

  const getStudentResult = (student: Student): StudentResult => {
    const studentGrades = grades.filter(grade => 
      grade.studentId === student.id && 
      grade.academicYear === academicYear
    );
    
    const studentSubjects = subjects.filter(subject => 
      subject.classes.includes(student.class) &&
      studentGrades.some(grade => grade.subjectId === subject.id)
    );
    
    // Calculate marks based on result type with new assignment system
    let totalMarks = 0;
    let obtainedMarks = 0;
    
    studentSubjects.forEach(subject => {
      const subjectGrades = studentGrades.filter(grade => grade.subjectId === subject.id);
      
      // Get assignments by term
      const term1Assignments = subjectGrades.filter(g => 
        g.examType === 'assignment' && g.remarks?.includes('Term 1')
      );
      const term2Assignments = subjectGrades.filter(g => 
        g.examType === 'assignment' && g.remarks?.includes('Term 2')
      );
      const halfYearlyGrade = subjectGrades.find(g => g.examType === 'half-yearly');
      const finalGrade = subjectGrades.find(g => g.examType === 'final');
      
      const term1AssignmentMarks = term1Assignments.reduce((sum, g) => sum + g.marksObtained, 0);
      const term2AssignmentMarks = term2Assignments.reduce((sum, g) => sum + g.marksObtained, 0);
      const halfYearlyMarks = halfYearlyGrade?.marksObtained || 0;
      const finalMarks = finalGrade?.marksObtained || 0;
      
      if (resultType === 'half-yearly') {
        // Half yearly: Term 1 assignments (40) + Half yearly exam (100) = 140 total
        totalMarks += 40 + subject.maxMarks; // 40 for assignments + subject max marks for half yearly
        obtainedMarks += term1AssignmentMarks + halfYearlyMarks;
      } else {
        // Full yearly: All assignments (80) + Half yearly (100) + Final (100) = 280 total
        totalMarks += 80 + (subject.maxMarks * 2); // 80 for all assignments + 2 exams
        obtainedMarks += term1AssignmentMarks + term2AssignmentMarks + halfYearlyMarks + finalMarks;
      }
    });
    
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    
    const grade = percentage >= 90 ? 'A+' :
                 percentage >= 80 ? 'A' :
                 percentage >= 70 ? 'B' :
                 percentage >= 60 ? 'C' :
                 percentage >= 50 ? 'D' :
                 percentage >= 40 ? 'E' : 'F';
    
    const status = percentage >= 40 ? 'pass' : 'fail';

    // Filter grades based on result type
    let relevantGrades = studentGrades;
    if (resultType === 'half-yearly') {
      relevantGrades = studentGrades.filter(grade => 
        (grade.examType === 'assignment' && grade.remarks?.includes('Term 1')) ||
        grade.examType === 'half-yearly'
      );
    }

    return {
      student,
      grades: relevantGrades,
      subjects: studentSubjects,
      totalMarks,
      obtainedMarks,
      percentage,
      grade,
      status,
      resultType
    };
  };

  const handleGenerateReport = (student: Student) => {
    const studentResult = getStudentResult(student);
    generateStudentResultPDF(studentResult, academicYear);
  };

  const handleBulkReportGeneration = () => {
    filteredStudents.forEach((student, index) => {
      setTimeout(() => {
        handleGenerateReport(student);
      }, index * 100);
    });
  };

  const classes = ['all', ...new Set(accessibleStudents.map(s => s.class))];
  const sections = ['all', ...new Set(accessibleStudents.map(s => s.section))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Report Generator</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBulkReportGeneration}
            disabled={filteredStudents.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Generate All Reports
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Report Configuration</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Result Type</label>
            <select
              value={resultType}
              onChange={(e) => setResultType(e.target.value as 'half-yearly' | 'full-yearly')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="half-yearly">Half Yearly Result</option>
              <option value="full-yearly">Full Yearly Result</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <div className={`p-3 rounded-lg ${resultType === 'half-yearly' ? 'bg-blue-50' : 'bg-purple-50'}`}>
              <p className={`text-sm font-medium ${resultType === 'half-yearly' ? 'text-blue-700' : 'text-purple-700'}`}>
                {resultType === 'half-yearly' 
                  ? '2 Assignments (Term 1) + Half Yearly' 
                  : '4 Assignments (Both Terms) + Half Yearly + Final'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Access Level Indicator */}
      {user?.role === 'teacher' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-amber-800">
              You can only generate reports for students in your assigned classes: {user.assignedClasses?.join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {classes.map(cls => (
                <option key={cls} value={cls}>
                  {cls === 'all' ? 'All Classes' : `Class ${cls}`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sections.map(section => (
                <option key={section} value={section}>
                  {section === 'all' ? 'All Sections' : `Section ${section}`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {resultType === 'half-yearly' ? 'Half Yearly' : 'Full Yearly'} Results ({academicYear})
          </h3>
        </div>
        
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Student</th>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Roll No.</th>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Class</th>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm hidden sm:table-cell">Total</th>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm hidden sm:table-cell">Obtained</th>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">%</th>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Grade</th>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Status</th>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const result = getStudentResult(student);
                return (
                  <tr key={student.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-2 sm:px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-medium text-blue-600">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 text-sm truncate max-w-24 sm:max-w-none">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm">{student.rollNumber}</td>
                    <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm">{student.class}-{student.section}</td>
                    <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden sm:table-cell">{result.totalMarks}</td>
                    <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden sm:table-cell">{result.obtainedMarks}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        result.percentage >= 80 ? 'bg-green-100 text-green-800' :
                        result.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        result.grade === 'A+' || result.grade === 'A' ? 'bg-green-100 text-green-800' :
                        result.grade === 'B' || result.grade === 'C' ? 'bg-blue-100 text-blue-800' :
                        result.grade === 'D' || result.grade === 'E' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        result.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <button
                        onClick={() => handleGenerateReport(student)}
                        className={`text-white px-2 sm:px-3 py-1 rounded-md hover:opacity-90 transition-colors flex items-center text-xs sm:text-sm ${
                          resultType === 'half-yearly' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;