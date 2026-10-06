import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('weshare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('weshare_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify and refresh user on initial load
  const verifySession = useCallback(async () => {
    const savedToken = localStorage.getItem('weshare_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('weshare_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session verification failed, logging out');
      localStorage.removeItem('weshare_token');
      localStorage.removeItem('weshare_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('weshare_token', newToken);
        localStorage.setItem('weshare_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('weshare_token', newToken);
        localStorage.setItem('weshare_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('weshare_token');
    localStorage.removeItem('weshare_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
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
