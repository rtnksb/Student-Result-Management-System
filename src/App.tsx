import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import StudentList from './components/Students/StudentList';
import StudentForm from './components/Students/StudentForm';
import GradeEntry from './components/Grades/GradeEntry';
import ReportGenerator from './components/Reports/ReportGenerator';
import TeacherManagement from './components/Admin/TeacherManagement';
import SubjectManagement from './components/Admin/SubjectManagement';
import ClassManagement from './components/Admin/ClassManagement';
import AccountSettings from './components/Auth/AccountSettings';
import { Student } from './types';

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useData();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  if (authLoading || dataLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setShowStudentForm(false);
    setEditingStudent(null);
  };

  const handleAddStudent = () => {
    setShowStudentForm(true);
    setEditingStudent(null);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleSaveStudent = () => {
    setShowStudentForm(false);
    setEditingStudent(null);
  };

  const handleGenerateReport = (student: Student) => {
    console.log('Generating report for:', student.name);
    setCurrentPage('reports');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return (
          <StudentList 
            onAddStudent={handleAddStudent}
            onEditStudent={handleEditStudent}
            onGenerateReport={handleGenerateReport}
          />
        );
      case 'teachers':
        return user?.role === 'admin' ? <TeacherManagement /> : <Dashboard />;
      case 'subjects':
        return user?.role === 'admin' ? <SubjectManagement /> : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Subject Management</h3>
            <p className="text-gray-600">Subject management functionality coming soon!</p>
          </div>
        );
      case 'classes':
        return user?.role === 'admin' ? <ClassManagement /> : <Dashboard />;
      case 'grades':
        return <GradeEntry />;
      case 'reports':
        return <ReportGenerator />;
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">Analytics dashboard coming soon!</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        currentPage={currentPage} 
        onOpenSettings={() => setShowAccountSettings(true)}
      />
      
      <div className="flex min-h-0">
        <Navigation 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
        />
        
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {showStudentForm && (
        <StudentForm
          student={editingStudent}
          onSave={handleSaveStudent}
          onCancel={() => {
            setShowStudentForm(false);
            setEditingStudent(null);
          }}
        />
      )}

      {showAccountSettings && (
        <AccountSettings
          onClose={() => setShowAccountSettings(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;