import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { API_URL } from '../config';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (token: string, onSuccess: () => void) => void;
  logout: (onSuccess: () => void) => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem('adminToken');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/check`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Authorization: `Bearer ${token}`,
          },
        });

        setIsAuthenticated(response.ok);

        if (!response.ok) {
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminLoginSuccess');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminLoginSuccess');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Admin login should not survive a page refresh or browser/tab close.
  useEffect(() => {
    const clearAdminSession = () => {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminLoginSuccess');
    };

    window.addEventListener('beforeunload', clearAdminSession);
    return () => window.removeEventListener('beforeunload', clearAdminSession);
  }, []);

  const login = useCallback(async (token: string, onSuccess: () => void) => {
    try {
      setLoading(true);
      sessionStorage.setItem('adminToken', token);
      sessionStorage.setItem('adminLoginSuccess', 'true');
      setIsAuthenticated(true);
      onSuccess();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback((onSuccess: () => void) => {
    try {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminLoginSuccess');
      setIsAuthenticated(false);
      onSuccess();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAuthenticated, 
        login, 
        logout, 
        loading 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
