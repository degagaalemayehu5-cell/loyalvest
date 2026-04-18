import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPhone, FiLock, FiArrowLeft, FiShield, FiDownload, FiX, FiSmartphone } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [platform, setPlatform] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }
    
    // Detect platform
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
      setPlatform('ios');
    } else if (/Android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
    
    // Show popup after 3 seconds (only once per session)
    const hasSeen = sessionStorage.getItem('installPopupShown');
    if (!hasSeen) {
      setTimeout(() => setShowInstallPopup(true), 3000);
    }
    
    // Capture install prompt for Android/Desktop Chrome
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Also show popup when install is available
      setShowInstallPopup(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  const handleInstall = async () => {
    // For Android and Desktop Chrome with automatic install
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('Installing Loyalvest...');
        setShowInstallPopup(false);
        sessionStorage.setItem('installPopupShown', 'true');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }
    
    // For iOS - show instructions
    if (platform === 'ios') {
      setShowInstallPopup(false);
      alert('📱 How to install Loyalvest on iPhone/iPad:\n\n1. Tap Share button (⬆️)\n2. Scroll down\n3. Tap "Add to Home Screen"\n4. Tap "Add"');
      sessionStorage.setItem('installPopupShown', 'true');
      return;
    }
    
    // Fallback - show instructions
    setShowInstallPopup(false);
    alert('📱 To install Loyalvest:\n\n• Chrome: Tap menu (⋮) → Install app\n• Safari: Tap Share → Add to Home Screen');
    sessionStorage.setItem('installPopupShown', 'true');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const phoneRegex = /^(?:\+251|0)[79]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid Ethiopian phone number');
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
    let formatted = value.replace(/[^\d+]/g, '');
    if (formatted.includes('+') && !formatted.startsWith('+')) {
      formatted = formatted.replace(/\+/g, '');
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
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Loyalvest</h1>
            <p className="text-gray-500 mt-2">Login with your phone number</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
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
          
          {/* VISIBLE INSTALL BUTTON - Always visible, not just popup */}
          {!isInstalled && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={handleInstall}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-teal-600 transition-all"
              >
                <FiDownload className="w-5 h-5" />
                {deferredPrompt ? '📲 Install Loyalvest App (One Click)' : '📲 Install Loyalvest App'}
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">
                {platform === 'ios' && '🍎 Tap Share → Add to Home Screen'}
                {platform === 'android' && '🤖 One-click install available'}
                {platform === 'desktop' && '💻 Click install in address bar or button above'}
              </p>
            </div>
          )}
          
          {/* Already installed message */}
          {isInstalled && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="bg-green-50 text-green-700 text-center py-2 rounded-lg text-sm">
                ✅ Loyalvest is installed on your device
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* POPUP - Appears automatically */}
      {showInstallPopup && !isInstalled && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
            {/* Close button */}
            <button 
              onClick={() => setShowInstallPopup(false)}
              className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full transition"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
            
            {/* App Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">L</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Install Loyalvest App
            </h2>
            <p className="text-center text-gray-500 text-sm mb-6">
              Get better experience on your device
            </p>
            
            {/* Features - Mobile friendly */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-green-500 text-lg">✓</span> One-tap access from home screen
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-green-500 text-lg">✓</span> Works offline
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-green-500 text-lg">✓</span> Faster performance
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-green-500 text-lg">✓</span> Automatic updates
              </div>
            </div>
            
            {/* Install Button - Big and clear for mobile */}
            <button
              onClick={handleInstall}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <FiDownload className="w-6 h-6" />
              {deferredPrompt ? '📲 Install Now (One Click)' : '📲 Install App'}
            </button>
            
            {/* Later button */}
            <button
              onClick={() => {
                setShowInstallPopup(false);
                sessionStorage.setItem('installPopupShown', 'true');
              }}
              className="w-full mt-3 text-gray-400 text-sm py-2 hover:text-gray-600 transition"
            >
              Maybe Later
            </button>
            
            {/* Platform-specific instruction */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <FiSmartphone className="w-3 h-3" />
                {platform === 'ios' && 'Tap Share (⬆️) → Add to Home Screen'}
                {platform === 'android' && 'One-click install available above'}
                {platform === 'desktop' && 'Click install in browser address bar'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;