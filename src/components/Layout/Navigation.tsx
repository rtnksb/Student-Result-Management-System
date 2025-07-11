import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, BookOpen, ClipboardList, BarChart3, FileText, UserPlus, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'students', label: 'Students', icon: Users, path: '/students' },
    { id: 'teachers', label: 'Teachers', icon: UserPlus, path: '/teachers' },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, path: '/subjects' },
    { id: 'classes', label: 'Classes', icon: Settings, path: '/classes' },
    { id: 'grades', label: 'Grade Entry', icon: ClipboardList, path: '/grades' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' }
  ];

  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'students', label: 'Students', icon: Users, path: '/students' },
    { id: 'grades', label: 'Grade Entry', icon: ClipboardList, path: '/grades' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' }
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : teacherNavItems;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="bg-gray-50 border-r border-gray-200 min-h-screen w-16 sm:w-64 transition-all duration-200">
      <div className="p-2 sm:p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={item.label}
                >
                  <Icon className="h-5 w-5 sm:mr-3" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;