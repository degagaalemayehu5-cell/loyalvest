import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPhone, FiLock, FiArrowLeft } from 'react-icons/fi'; // Changed FiMail to FiPhone
import toast from 'react-hot-toast'; // Added missing import

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth(); // Added isAuthenticated
  const navigate = useNavigate();

  // Redirect if already logged in (prevents layering)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(phone, password);

      if (success) {
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (storedUser && storedUser.isAdmin) {
          localStorage.clear(); 
          window.location.href = '/admin-login?error=admin_attempt'; 
          return;
        } else {
          toast.success('Login successful!');
          // Using window.location.href ensures the Login component 
          // is physically removed from the browser memory.
          window.location.href = '/'; 
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Loyalvest</h1>
            <p className="text-gray-500 mt-2">Welcome back!</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel" // Changed from 'phone' to 'tel'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-10 w-full"
                  placeholder="09..."
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 w-full"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg flex justify-center items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Register
              </Link>
            </p>
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mt-3">
              <FiArrowLeft className="text-sm" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;