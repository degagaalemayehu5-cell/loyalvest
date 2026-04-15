import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated, fetchUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('AdminLogin - Auth State:', { isAuthenticated, user });
    
    // Check localStorage directly
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    console.log('AdminLogin - LocalStorage:', { token: !!token, storedUser });
    
    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.isAdmin) {
        console.log('Found admin in localStorage, redirecting');
        navigate('/admin');
      }
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Attempting login with:', email);
    
    try {
      const success = await login(email, password);
      console.log('Login success:', success);
      
      if (success) {
        // Check localStorage after login
        setTimeout(() => {
          const token = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          console.log('After login - Token:', !!token);
          console.log('After login - User:', storedUser);
          
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.isAdmin) {
              console.log('Admin detected, navigating to /admin');
              navigate('/admin');
            } else {
              toast.error('This account does not have admin privileges');
              navigate('/');
            }
          } else {
            toast.error('Login failed - no user data');
          }
        }, 500);
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 mt-1">Secure access to admin panel</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@loyalvest.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Default Admin: admin@loyalvest.com / Admin@123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;