import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [phone, setPhone] = useState('');
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

  try {
    const success = await login(phone, password);

    if (success) {
      // Get the user data from localStorage immediately
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (storedUser && !storedUser.isAdmin) {
        // 1. STOPS THE SPINNING: Clear storage immediately
        localStorage.clear(); 
        
        // 2. Hard redirect to the User Login page
        // We use window.location.href to kill the state and the spinner instantly
        window.location.href = '/login?error=user_on_admin_portal'; 
        return; 
      } else {
        // It's a valid Admin
        toast.success('Admin access granted');
        navigate('/admin');
      }
    }
  } catch (error) {
    console.error('Admin Login error:', error);
    toast.error('An error occurred during admin login');
  } finally {
    // Ensures spinner stops if login fails or role check isn't triggered
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Admin phone
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="phone"
                  value={phone}
                  name="phone"
                  id="phone"
                  autoComplete='tel'
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin phone"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  name="password"    
                  id="password"
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