import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { authService } from '@/services/authService';
import { currentUser as fallbackUser } from '@/services/mockData';

interface AuthContextType {
  user: User;
  role: UserRole;
  switchRole: (role: UserRole) => Promise<void>;
  login: (email: string, password: string, role?: UserRole) => Promise<User>;
  signUp: (email: string, password: string, role: UserRole, name?: string) => Promise<User>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(fallbackUser);
  const [role, setRole] = useState<UserRole>('founder');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const u = await authService.getCurrentUser();
        if (u) {
          setUser(u);
          setRole(u.role);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const switchRole = async (newRole: UserRole) => {
    const updated = await authService.switchRole(newRole);
    setUser(updated);
    setRole(newRole);
  };

  const login = async (email: string, password: string, loginRole?: UserRole): Promise<User> => {
    const u = await authService.login(email, password, loginRole);
    setUser(u);
    setRole(u.role);
    return u;
  };

  const signUp = async (email: string, password: string, signUpRole: UserRole = 'founder', name?: string): Promise<User> => {
    const u = await authService.signUp(email, password, signUpRole, name);
    setUser(u);
    setRole(u.role);
    return u;
  };

  const logout = async () => {
    await authService.logout();
    setUser(fallbackUser);
    setRole('founder');
  };

  return (
    <AuthContext.Provider value={{ user, role, switchRole, login, signUp, logout, isLoading }}>
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
