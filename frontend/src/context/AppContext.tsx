import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PatientTab, UserRole, ChatMessage, User, AuthResponse } from '../types';
import api from '../utils/api';
import {
  clearStoredSession,
  getStoredSession,
  saveStoredSession,
} from '../utils/auth';
import { getBackendOrigin } from '../utils/authUrls';

import { useNavigate } from 'react-router-dom';

interface AppContextValue {
  userRole: UserRole;
  currentUser: User | null;
  activeTab: PatientTab;
  setActiveTab: (tab: PatientTab) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (
    msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;
  lastMoodScan: string | null;
  setLastMoodScan: (mood: string | null) => void;
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  handleLogin: (
    email: string,
    password: string,
    role: 'user' | 'doctor' | 'admin'
  ) => Promise<string | null>;
  handleSignUp: (
    data: {
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      dateOfBirth: string,
      acceptedTerms: boolean,
    }
  ) => Promise<string | null>;
  handleLogout: () => Promise<void>;
  handleAuthSuccess: (access_token: string, user: User, redirectPath?: string) => void;
  authReady: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const initialSession = getStoredSession();
  const [userRole, setUserRole] = useState<UserRole>(
    initialSession?.user.role ?? null,
  );
  const [currentUser, setCurrentUserState] = useState<User | null>(
    initialSession?.user ?? null,
  );
  const [authReady] = useState(true);
  const [activeTab, setActiveTab] = useState<PatientTab>('dashboard');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lastMoodScan, setLastMoodScan] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setCurrentUserState(null);
    setUserRole(null);
    setActiveTab('dashboard');
    setChatMessages([]);
    setLastMoodScan(null);
    setCurrentChatId(null);
  }, []);

  useEffect(() => {
    const onSessionExpired = () => clearSession();
    window.addEventListener('zehnify:session-expired', onSessionExpired);
    return () => window.removeEventListener('zehnify:session-expired', onSessionExpired);
  }, [clearSession]);

  const handleAuthSuccess = useCallback((
    access_token: string,
    user: User,
    redirectPath?: string,
  ) => {
    saveStoredSession(access_token, user);

    setCurrentUserState(user);
    setUserRole(user.role as UserRole);

    const target =
      redirectPath ||
      (user.role === 'doctor' ? '/doctor' : user.role === 'admin' ? '/admin' : '/app');
    navigate(target, { replace: true });
  }, [navigate]);

  const handleLogin = React.useCallback(async (
    email: string,
    password: string,
    role: 'user' | 'doctor' | 'admin'
  ): Promise<string | null> => {
    try {
      console.log('Attempting login:', { email, role });
      const response = await api.post<AuthResponse>('/auth/local/signin', {
        email,
        password,
      });

      const { access_token, user } = response.data;
      console.log('Login successful:', user);

      if (user.role !== role && user.role !== 'admin') {
        return 'Invalid credentials or role mismatch.';
      }

      handleAuthSuccess(access_token, user);
      return null;
    } catch (error: any) {
      console.error('Login error details:', error);
      if (error.code === 'ERR_NETWORK') {
        return `Network error: Cannot connect to the server at ${getBackendOrigin()}. Is the backend running?`;
      }
      return error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  }, [handleAuthSuccess]);

  const handleSignUp = React.useCallback(async (data: {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    dateOfBirth: string,
    acceptedTerms: boolean,
  }): Promise<string | null> => {
    try {
      console.log('Attempting signup with data:', data);
      const response = await api.post<AuthResponse>('/auth/local/signup', data);
      const { access_token, user } = response.data;
      console.log('Signup successful:', user);

      handleAuthSuccess(access_token, user);
      return null;
    } catch (error: any) {
      console.error('Signup error details:', error);
      if (error.code === 'ERR_NETWORK') {
        return `Network error: Cannot connect to the server at ${getBackendOrigin()}. Is the backend running?`;
      }
      return error.response?.data?.message || 'Sign up failed. Please try again.';
    }
  }, [handleAuthSuccess]);

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      navigate('/');
    }
  }, [clearSession, navigate]);

  return (
    <AppContext.Provider
      value={{
        userRole,
        currentUser,
        activeTab,
        setActiveTab,
        chatMessages,
        setChatMessages,
        lastMoodScan,
        setLastMoodScan,
        currentChatId,
        setCurrentChatId,
        handleLogin,
        handleSignUp,
        handleLogout,
        handleAuthSuccess,
        authReady,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx)
    throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
