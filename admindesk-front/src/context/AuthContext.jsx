import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ← novo
  const navigate = useNavigate();

  // ✅ Recupera o usuário ao recarregar a página
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('userEmail'); // ← salvar no login
    if (token && savedEmail) {
      setUser(savedEmail);
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email); // ← novo
    setUser(email);
    navigate('/dashboard');
  }

  async function register(data) {
    await api.post('/auth/register', data);
    navigate('/');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail'); // ← novo
    setUser(null);
    navigate('/');
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}