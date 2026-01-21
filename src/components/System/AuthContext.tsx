import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  username: string;
  name: string;
  role: 'admin' | 'researcher';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials for now (will migrate to Azure SSO)
// Two-tier system: Admin (sees all pitches) vs Researcher (sees only their own)
const VALID_USERS = [
  {
    username: 'software@pflugerarchitects.com',
    password: '123456Softwares!',
    name: 'Pfluger Admin',
    role: 'admin' as const
  },
  {
    username: 'user@pflugerarchitects.com',
    password: '123456Softwares!',
    name: 'Pfluger Researcher',
    role: 'researcher' as const
  },
  {
    username: 'nilen.varade@pflugerarchitects.com',
    password: '123456Softwares!',
    name: 'Nilen Varade',
    role: 'researcher' as const
  },
  {
    username: 'monse.rios@pflugerarchitects.com',
    password: '123456Softwares!',
    name: 'Monse Rios',
    role: 'researcher' as const
  },
  {
    username: 'katherine.wiley@pflugerarchitects.com',
    password: '123456Softwares!',
    name: 'Katherine Wiley',
    role: 'researcher' as const
  },
  {
    username: 'leah.vandersanden@pflugerarchitects.com',
    password: '123456Softwares!',
    name: 'Leah VanderSanden',
    role: 'researcher' as const
  },
  {
    username: 'agustin.salinas@pflugerarchitects.com',
    password: '123456Softwares!',
    name: 'Agustin Salinas',
    role: 'researcher' as const
  },
  {
    username: 'logan.steitle@pflugerarchitects.com',
    password: '123456Softwares!',
    name: 'Logan Steitle',
    role: 'researcher' as const
  },
  {
    username: 'braden.haley@pflugerarchitects.com',
    password: '123456Softwares!',
    name: 'Braden Haley',
    role: 'researcher' as const
  }
];

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

    // Check credentials against valid users
    const validUser = VALID_USERS.find(
      u => u.username === username && u.password === password
    );

    if (validUser) {
      const userData: User = {
        username: validUser.username,
        name: validUser.name,
        role: validUser.role
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
