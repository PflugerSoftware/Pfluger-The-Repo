import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  username: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials for now
const VALID_USERNAME = 'software';
const VALID_PASSWORD = '123456Softwares!';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('ezra-auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUser(authData.user);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check credentials
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const userData: User = {
        username: VALID_USERNAME,
        name: 'Pfluger Team'
      };

      setIsAuthenticated(true);
      setUser(userData);

      // Save to localStorage
      localStorage.setItem('ezra-auth', JSON.stringify({
        isAuthenticated: true,
        user: userData
      }));

      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('ezra-auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
