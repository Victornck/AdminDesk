import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data;
    localStorage.setItem('token', token);
    setUser(email);
    navigate('/dashboard');
  }

  async function register(data) {
    await api.post('/auth/register', data);
    navigate('/');
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}