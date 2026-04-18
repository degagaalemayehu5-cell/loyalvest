import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPhone, FiLock, FiArrowLeft, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Ethiopian phone validation (09... or +2519...)
    const phoneRegex = /^(?:\+251|0)[79]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid Ethiopian phone number (e.g., 0912345678 or +251912345678)');
      setLoading(false);
      return;
    }
    
    const success = await login(phone, password);
    setLoading(false);
    if (success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.isAdmin) {
        toast.error('Admin accounts cannot access user area');
        localStorage.clear();
        navigate('/admin-login');
      } else {
        navigate('/');
      }
    }
  };
  
  const formatPhoneNumber = (value) => {
    // Allow Ethiopian phone number format
    let formatted = value.replace(/[^\d+]/g, ''); // Allow digits and +
    if (formatted.includes('+') && !formatted.startsWith('+')) {
      formatted = formatted.replace(/\+/g, ''); // Remove + if not leading
    }
    if (formatted.startsWith('+')) {
      if (formatted.slice(1).startsWith('251') && formatted.length > 13) {
        formatted = formatted.slice(0, 13);
      } else if (formatted.length > 11) {
        formatted = formatted.slice(0, 11);
      }
    } else {
      if (formatted.startsWith('251') && formatted.length > 12) {
        formatted = formatted.slice(0, 12);
      } else if (formatted.length > 10) {
        formatted = formatted.slice(0, 10);
      }
    }
    setPhone(formatted);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Loyalvest</h1>
            <p className="text-gray-500 mt-2">Login with your phone number</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => formatPhoneNumber(e.target.value)}
                  className="input-field pl-10"
                  placeholder="0912345678 or +251912345678"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Example: 0912345678 or +251912345678</p>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
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
              className="btn-primary w-full py-3 text-lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Register
              </Link>
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t text-center">
            <Link to="/admin-login" className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center gap-1">
              <FiShield className="text-sm" /> Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;