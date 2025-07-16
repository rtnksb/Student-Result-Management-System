import React, { useState } from 'react';
import { Users, BookOpen, TrendingUp, FileText, ClipboardList } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // <-- Add this import
import AnnouncementSection from './AnnouncementSection';

const Dashboard: React.FC = () => {
  const { students, subjects, grades } = useData();
  const { user, canAccessClass } = useAuth();
  const navigate = useNavigate(); // <-- Add this line

  // Filter data based on user role and permissions
  const filteredStudents = user?.role === 'admin' 
    ? students 
    : students.filter(student => canAccessClass(student.class));

  const filteredGrades = user?.role === 'admin'
    ? grades
    : grades.filter(grade => {
        const student = students.find(s => s.id === grade.studentId);
        return student && canAccessClass(student.class);
      });

  const totalStudents = filteredStudents.length;
  const totalSubjects = subjects.length;
  const totalGrades = filteredGrades.length;
  const averageMarks = filteredGrades.length > 0 
    ? filteredGrades.reduce((sum, grade) => sum + grade.marksObtained, 0) / filteredGrades.length 
    : 0;

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Subjects',
      value: totalSubjects,
      icon: BookOpen,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Grades Entered',
      value: totalGrades,
      icon: FileText,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Average Marks',
      value: averageMarks.toFixed(1),
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  // Calculate class performance for accessible classes
  const accessibleClasses = user?.role === 'admin' 
    ? [...new Set(students.map(s => s.class))]
    : user?.assignedClasses || [];

  const classPerformance = accessibleClasses.map(classId => {
    const classStudents = students.filter(s => s.class === classId);
    const classGrades = grades.filter(grade => {
      const student = students.find(s => s.id === grade.studentId);
      return student && student.class === classId;
    });
    
    const avgScore = classGrades.length > 0 
      ? classGrades.reduce((sum, grade) => sum + grade.marksObtained, 0) / classGrades.length 
      : 0;
    
    return {
      class: classId,
      students: classStudents.length,
      avgScore: avgScore.toFixed(1)
    };
  });

  // Example admin message state (replace with context or backend as needed)
  const [adminMessage, setAdminMessage] = useState<string>('Welcome to the new academic year! Please submit grades by Friday.');
  const [editing, setEditing] = useState(false);
  const [tempMessage, setTempMessage] = useState(adminMessage);

  const handleSave = () => {
    setAdminMessage(tempMessage);
    setEditing(false);
    // TODO: Save to backend or context
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-600">
          Welcome back, {user?.name}! Here's what's happening in your {user?.role === 'admin' ? 'school' : 'classes'}.
        </div>
      </div>

      {/* Role-based access indicator */}
      {user?.role === 'teacher' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              You have access to Class{user.assignedClasses && user.assignedClasses.length > 1 ? 'es' : ''}: {user.assignedClasses?.join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-lg p-4 sm:p-6 transition-transform hover:scale-105`}>
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Announcements Section */}
        <AnnouncementSection />

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              onClick={() => navigate('/students')}
            >
              <Users className="h-5 w-5 mr-2" />
              Add New Student
            </button>
            <button
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              onClick={() => navigate('/grades')}
            >
              <ClipboardList className="h-5 w-5 mr-2" />
              Enter Grades
            </button>
            <button
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              onClick={() => navigate('/reports')}
            >
              <FileText className="h-5 w-5 mr-2" />
              Generate Reports
            </button>
          </div>
        </div>
      </div>

      {/* Class Performance Overview */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {user?.role === 'admin' ? 'School Performance Overview' : 'Your Classes Performance'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classPerformance.map((classData, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="text-lg font-bold text-gray-900">Class {classData.class}</div>
              <div className="text-sm text-gray-600 mt-1">
                {classData.students} students • Avg: {classData.avgScore}%
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(parseFloat(classData.avgScore), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          
          {classPerformance.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No class data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;