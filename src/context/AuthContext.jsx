import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('farmers-mart-token')));

  useEffect(() => {
    if (!localStorage.getItem('farmers-mart-token')) return;
    api('/auth/me')
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => localStorage.removeItem('farmers-mart-token'))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
      localStorage.setItem('farmers-mart-token', result.token);
      setUser(result.user);
      return result.user;
    },
    async register(details) {
      const result = await api('/auth/register', { method: 'POST', body: JSON.stringify(details) });
      localStorage.setItem('farmers-mart-token', result.token);
      setUser(result.user);
      return result.user;
    },
    logout() {
      localStorage.removeItem('farmers-mart-token');
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
