import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showNotification } from '../../utils/notification';

interface HeaderProps {
  onOpenSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    showNotification('Logged out successfully.', 'success');
  };

  // Get page name from pathname
  const getPageName = (pathname: string) => {
    const pathMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/students': 'Students',
      '/teachers': 'Teachers',
      '/subjects': 'Subjects',
      '/classes': 'Classes',
      '/grades': 'Grade Entry',
      '/reports': 'Reports',
      '/analytics': 'Analytics'
    };
    return pathMap[pathname] || 'Dashboard';
  };

  const currentPage = getPageName(location.pathname);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div className="flex items-center min-w-0 flex-1">
            {/* <BookOpen className="h-8 w-8 text-blue-600 mr-3" /> */}
            <img
              src="/school-logo.png"
              alt="School Logo"
              className="h-10 w-auto rounded"
              style={{ background: 'white' }}
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">J. R. Preparatory School</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Student Result Management System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900 truncate max-w-32 lg:max-w-none">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate">
                {user?.role === 'admin' ? 'Administrator' : 'Teacher'} • {currentPage}
              </p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <button
                onClick={onOpenSettings}
                className="p-1.5 sm:p-2 bg-gray-50 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
                title="Account Settings"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 bg-red-50 rounded-full hover:bg-red-100 cursor-pointer transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;