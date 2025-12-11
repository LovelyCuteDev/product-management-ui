import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { http } from '../lib/http';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (params: { email: string; password: string }) => Promise<void>;
  signup: (params: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);
    http
      .get<AuthUser>('/auth/me')
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem('auth_token');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAuthSuccess = (data: { accessToken: string; user: AuthUser }) => {
    setToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('auth_token', data.accessToken);
  };

  const login = async (params: { email: string; password: string }) => {
    const res = await http.post('/auth/login', params);
    handleAuthSuccess(res.data);
  };

  const signup = async (params: {
    email: string;
    password: string;
    name: string;
  }) => {
    const res = await http.post('/auth/signup', params);
    handleAuthSuccess(res.data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const value: AuthContextValue = {
    user,
    token,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}


