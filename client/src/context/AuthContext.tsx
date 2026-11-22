import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fitforge_token'));
  const [loading, setLoading] = useState(true);

  // Validate or restore session
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('fitforge_token');
      const storedUser = localStorage.getItem('fitforge_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (e) {
          localStorage.removeItem('fitforge_token');
          localStorage.removeItem('fitforge_user');
        }
      } else {
        // Automatically default to Guest Mode if not logged in
        const guestUser: User = { id: 'guest', email: 'Guest User', isGuest: true };
        setUser(guestUser);
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('fitforge_token', data.token);
        localStorage.setItem('fitforge_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (e: any) {
      return { success: false, error: 'Network error connecting to auth server' };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('fitforge_token', data.token);
        localStorage.setItem('fitforge_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (e: any) {
      return { success: false, error: 'Network error connecting to auth server' };
    }
  };

  const loginAsGuest = async () => {
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('fitforge_token', data.token);
        localStorage.setItem('fitforge_user', JSON.stringify(data.user));
      }
    } catch (e) {
      const guestUser: User = { id: 'guest', email: 'Guest User', isGuest: true };
      setUser(guestUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('fitforge_token');
    localStorage.removeItem('fitforge_user');
    const guestUser: User = { id: 'guest', email: 'Guest User', isGuest: true };
    setUser(guestUser);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, loginAsGuest, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
