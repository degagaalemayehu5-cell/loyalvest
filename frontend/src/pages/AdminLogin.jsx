import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiPhone, FiLock, FiArrowLeft, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated, fetchUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      navigate('/admin');
    } else if (isAuthenticated && !user?.isAdmin) {
      toast.error('Regular users cannot access admin area');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Ethiopian phone validation
    const phoneRegex = /^(?:\+251|0)[79]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid Ethiopian phone number');
      setLoading(false);
      return;
    }
    
    const success = await login(phone, password);
    
    if (success) {
      setTimeout(async () => {
        await fetchUser();
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.isAdmin) {
            navigate('/admin');
          } else {
            toast.error('This account does not have admin privileges');
            navigate('/login');
          }
        }
      }, 500);
    }
    
    setLoading(false);
  };
  
  const formatPhoneNumber = (value) => {
    let formatted = value.replace(/\D/g, '');
    if (formatted.startsWith('251') && formatted.length > 12) {
      formatted = formatted.slice(0, 12);
    } else if (formatted.length > 10) {
      formatted = formatted.slice(0, 10);
    }
    setPhone(formatted);
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
              <label htmlFor="admin-phone" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  id="admin-phone"
   
                  value={phone}
                  onChange={(e) => formatPhoneNumber(e.target.value)}
                  className="input-field pl-10"
                  placeholder="0912345678 or +251912345678"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter admin registered phone number</p>
            </div>
            
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="admin-password"
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
          
          <div className="mt-6 pt-4 border-t text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              <FiUser className="text-sm" /> User Login
            </Link>
          </div>
         
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;