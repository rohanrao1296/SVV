import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { api, authService } from '../services/api';

interface RegisterData {
  name: string;
  phone: string;
  password: string;
  role?: UserRole;
  email?: string;
  classId?: string;
  sectionId?: string;
  department?: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  updateCurrentUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('svv_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('svv_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({ phone, password });

      if (response && response.success && response.user) {
        if (response.token) {
          api.setToken(response.token);
        }
        setCurrentUser(response.user);
        localStorage.setItem('svv_user', JSON.stringify(response.user));
        setIsLoading(false);
        return true;
      }
    } catch (apiErr: any) {
      setError(apiErr?.message || 'Invalid phone number or password. Please try again.');
    }

    setIsLoading(false);
    return false;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(data);
      if (response && response.success && response.user) {
        if (response.token) {
          api.setToken(response.token);
        }
        setCurrentUser(response.user);
        localStorage.setItem('svv_user', JSON.stringify(response.user));
        setIsLoading(false);
        return true;
      }
    } catch (apiErr: any) {
      setError(apiErr?.message || 'Registration failed');
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    api.removeToken();
    setCurrentUser(null);
    localStorage.removeItem('svv_user');
  };

  const updateCurrentUser = async (userData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...userData };
    setCurrentUser(updated);
    localStorage.setItem('svv_user', JSON.stringify(updated));

    try {
      await authService.updateProfile(userData);
    } catch (e) {
      console.warn('Could not sync profile to backend:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isLoading, error, updateCurrentUser }}>
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
