import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import LocalAuthService, { User } from '../services/LocalAuthService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = () => {
      const currentUser = LocalAuthService.getCurrentUser();
      const isAuth = LocalAuthService.isAuthenticated();

      setUser(currentUser);
      setIsAuthenticated(isAuth);
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, role: string) => {
    try {
      setIsLoading(true);
      const tokens = await LocalAuthService.login(username, role);

      // Store tokens
      localStorage.setItem('id_token', tokens.id_token);
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      // Update context state
      const currentUser = LocalAuthService.parseToken(tokens.id_token);
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await LocalAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (role: string): boolean => {
    return LocalAuthService.hasRole(role);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
