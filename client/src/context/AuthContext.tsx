import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUserContext: (profile: UserProfile) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fittrack_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('fittrack_token')) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        setProfile(res.data.profile || null);
      }
    } catch (err) {
      console.warn('Session restoration failed:', err);
      localStorage.removeItem('fittrack_token');
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('fittrack_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setProfile(newUser.profile || null);
  };

  const logout = () => {
    localStorage.removeItem('fittrack_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateUserContext = (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (user) {
      setUser({ ...user, profile: newProfile });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        logout,
        updateUserContext,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
