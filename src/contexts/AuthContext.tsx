import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';
import { verifyPassword } from '../utils/passwordUtils';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  canAccessClass: (classId: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on app load (using sessionStorage instead of localStorage)
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        sessionStorage.removeItem('currentUser');
      }
    }
    setLoading(false);

    // Add event listener for browser close (not refresh)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only clear session if it's actually a browser close, not a refresh
      // We can't reliably detect this, so we'll rely on sessionStorage behavior
      // sessionStorage persists through page refreshes but clears on browser close
    };

    // Set up a heartbeat to detect if the browser was closed
    const heartbeatInterval = setInterval(() => {
      sessionStorage.setItem('heartbeat', Date.now().toString());
    }, 1000);

    // Check if this is a fresh browser session (no heartbeat from previous session)
    const lastHeartbeat = sessionStorage.getItem('heartbeat');
    if (!lastHeartbeat) {
      // This is a new browser session, keep the user logged in if they have valid session data
    }

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Query Supabase for user
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (!userData) {
        return false;
      }

      // Verify password using bcrypt
      const isPasswordValid = await verifyPassword(password, userData.password);
      if (!isPasswordValid) {
        console.error('Invalid password');
        return false;
      }

      // Convert database user to application user
      const user: User = {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        role: userData.role,
        name: userData.name,
        email: userData.email,
        assignedClasses: userData.assigned_classes || [],
        accessId: userData.access_id
      };

      const authUser = { ...user };
      delete (authUser as any).password; // Remove password from stored user data
      
      setAuthState({
        user: authUser,
        isAuthenticated: true
      });
      
      sessionStorage.setItem('currentUser', JSON.stringify(authUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false
    });
    sessionStorage.removeItem('currentUser');
  };

  const canAccessClass = (classId: string): boolean => {
    if (!authState.user) return false;
    if (authState.user.role === 'admin') return true;
    if (authState.user.role === 'teacher') {
      return authState.user.assignedClasses?.includes(classId) || false;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      canAccessClass,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};