import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fm_token'));
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(res => setUser(res.data))
      .catch(() => { localStorage.removeItem('fm_token'); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    localStorage.setItem('fm_token', res.data.token);
    setToken(res.data.token);
    setUser({ username: res.data.username });
  };

  const logout = () => {
    localStorage.removeItem('fm_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
