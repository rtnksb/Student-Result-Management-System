import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Analytics from './components/Analytics/Analytics';
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

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Main Layout Component
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

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
    // This could be enhanced to pre-select the student in reports
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onOpenSettings={() => setShowAccountSettings(true)} />
      
      <div className="flex min-h-0">
        <Navigation />
        
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          {React.cloneElement(children as React.ReactElement, {
            onAddStudent: handleAddStudent,
            onEditStudent: handleEditStudent,
            onGenerateReport: handleGenerateReport
          })}
        </main>
      </div>

      {showStudentForm && (
        <StudentForm
          student={editingStudent ?? undefined}
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

const AppContent: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useData();

  if (authLoading || dataLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Login route */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
        } 
      />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/students" element={
        <ProtectedRoute>
          <MainLayout>
            <StudentList 
              onAddStudent={() => {}} 
              onEditStudent={() => {}} 
              onGenerateReport={() => {}} 
            />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/grades" element={
        <ProtectedRoute>
          <MainLayout>
            <GradeEntry />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <ReportGenerator />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <MainLayout>
            <Analytics />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Admin-only routes */}
      <Route path="/teachers" element={
        <ProtectedRoute adminOnly>
          <MainLayout>
            <TeacherManagement />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/subjects" element={
        <ProtectedRoute adminOnly>
          <MainLayout>
            <SubjectManagement />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/classes" element={
        <ProtectedRoute adminOnly>
          <MainLayout>
            <ClassManagement />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Default redirects */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } 
      />
      
      {/* Catch all route */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppContent />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;