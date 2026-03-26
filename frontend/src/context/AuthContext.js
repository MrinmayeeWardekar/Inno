import { createContext, useContext, useState } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('innoventure_user');
      return s ? JSON.parse(s) : null;
    } catch { localStorage.clear(); return null; }
  });

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    const u = { _id: data._id, name: data.name, email: data.email, role: data.role, xp: data.xp, level: data.level, badges: data.badges, tutorStatus: data.tutorStatus };
    setUser(u);
    localStorage.setItem('innoventure_user', JSON.stringify(u));
    localStorage.setItem('innoventure_token', data.token);
    return u;
  };

  const loginWithToken = (userData, token) => {
    setUser(userData);
    localStorage.setItem('innoventure_user', JSON.stringify(userData));
    localStorage.setItem('innoventure_token', token);
  };

  const register = async (name, email, password, role) => {
    const { data } = await API.post('/auth/register', { name, email, password, role });
    if (data.token) {
      const u = { _id: data._id, name: data.name, email: data.email, role: data.role, xp: data.xp, level: data.level, badges: data.badges, tutorStatus: data.tutorStatus };
      setUser(u);
      localStorage.setItem('innoventure_user', JSON.stringify(u));
      localStorage.setItem('innoventure_token', data.token);
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('innoventure_user');
    localStorage.removeItem('innoventure_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithToken, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
