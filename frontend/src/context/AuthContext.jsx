import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };
  
  // Initialize auth from token and validate with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('Initial load - Token:', !!token);
      console.log('Initial load - Stored user:', storedUser);

      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('user');
          }
        }

        try {
          const response = await api.get('/auth/me');
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User validated from API:', userData);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          logout();
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);
  
  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User fetched from API:', userData);
      return userData;
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
      return null;
    }
  };
  
  const login = async (phone, password) => {
    try {
      const response = await api.post('/auth/login', { phone, password });
      const { token, user: userData } = response.data;
      
      // 1. Storage first
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // 2. Set Axios Header immediately
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 3. Update State
      setUser(userData);
      
      return true; 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };
  
  const register = async (name, phone, password, referralCode) => {
    try {
      const response = await api.post('/auth/register', { name, phone, password, referralCode });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };
  
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      return false;
    }
  };
  
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    changePassword,
    fetchUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};