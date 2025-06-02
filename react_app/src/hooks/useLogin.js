// src/hooks/useLogin.js - Updated version
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login: authLogin, error: authError } = useAuth();

  const login = async (email, password) => {
    setLoading(true);
    
    try {
      const result = await authLogin(email, password);
      return result;
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error: authError };
};

export default useLogin;