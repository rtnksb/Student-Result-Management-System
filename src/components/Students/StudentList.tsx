import React, { useState } from 'react';
import { Plus, Search, Edit, FileText, Phone, Mail, Trash2 } from 'lucide-react';
import { Student } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface StudentListProps {
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onGenerateReport: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ onAddStudent, onEditStudent, onGenerateReport }) => {
  const { students, deleteStudent } = useData();
  const { user, canAccessClass } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Filter students based on user permissions
  const accessibleStudents = user?.role === 'admin' 
    ? students 
    : students.filter(student => canAccessClass(student.class));

  const filteredStudents = accessibleStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const classes = ['all', ...new Set(accessibleStudents.map(s => s.class))];

  const handleDeleteStudent = (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}? This will also remove all their grades.`)) {
      deleteStudent(student.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
        <button
          onClick={onAddStudent}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Student
        </button>
      </div>

      {/* Access Level Indicator */}
      {user?.role === 'teacher' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-amber-800">
              You can only view and manage students from your assigned classes: {user.assignedClasses?.join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
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
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {classes.map(cls => (
              <option key={cls} value={cls}>
                {cls === 'all' ? 'All Classes' : `Class ${cls}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm sm:text-lg font-semibold text-blue-600">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.rollNumber}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Class:</span>
                <span className="text-sm font-medium text-gray-900">{student.class}-{student.section}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Father:</span>
                <span className="text-sm font-medium text-gray-900 truncate max-w-32">{student.fatherName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 truncate">{student.phone}</span>
              </div>
              {student.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">{student.email}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => onEditStudent(student)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => onGenerateReport(student)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
              >
                <FileText className="h-4 w-4 mr-1" />
                Report
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleDeleteStudent(student)}
                  className="sm:w-auto bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default StudentList;