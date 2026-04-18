import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiMail, FiPhone, FiHelpCircle, FiLogOut, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallOption, setShowInstallOption] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallOption(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallOption(false);
      toast.success('Loyalvest installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleManualInstall = async () => {
    if (!deferredPrompt) {
      toast.error('Installation not available. Try using Chrome browser.');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('App installed successfully!');
        setShowInstallOption(false);
      } else {
        toast.error('Installation cancelled');
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
      toast.error('Failed to install app');
    }
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setChangingPassword(true);
    const success = await changePassword(currentPassword, newPassword);
    setChangingPassword(false);
    
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };
  
  const handleSupport = () => {
    const supportEmail = 'support@loyalvest.com';
    window.location.href = `mailto:${supportEmail}`;
    toast.success('Opening email client...');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white pt-8 pb-12 px-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-purple-100 mt-1">Manage your account preferences</p>
      </div>
      
      <div className="px-4 -mt-6 space-y-4">
        {/* Profile Info */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.phone || user?.email}</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-t">
            <span className="text-gray-600">Account Level</span>
            <span className="font-semibold text-blue-600">{user?.level}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t">
            <span className="text-gray-600">Member Since</span>
            <span className="text-gray-900">{new Date(user?.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Install App - Only show if not installed */}
        {showInstallOption && !isInstalled && (
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiDownload className="text-green-600" /> Install App
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Install Loyalvest on your device for a better experience:
            </p>
            <ul className="text-xs text-gray-500 mb-3 space-y-1">
              <li>✓ Faster access from home screen</li>
              <li>✓ Offline mode support</li>
              <li>✓ Better performance</li>
              <li>✓ App-like experience</li>
            </ul>
            <button 
              onClick={handleManualInstall} 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <FiDownload className="w-4 h-4" /> Install Loyalvest
            </button>
          </div>
        )}
        
        {/* Already Installed Message */}
        {isInstalled && (
          <div className="card bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiDownload className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">App Installed!</h3>
                <p className="text-xs text-green-600">You're using the installed version of Loyalvest</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Change Password */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiLock className="text-blue-600" /> Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="New Password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />
            <button
              type="submit"
              disabled={changingPassword}
              className="btn-primary w-full"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
        
        {/* Support */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiHelpCircle className="text-green-600" /> Support
          </h3>
          <button onClick={handleSupport} className="btn-secondary w-full mb-2">
            Contact Support Team
          </button>
          <div className="text-sm text-gray-500 mt-2">
            <p>📧 Email: support@loyalvest.com</p>
            <p>📞 Phone: +251-XXX-XXXXXX</p>
            <p>⏰ Response Time: Within 24 hours</p>
          </div>
        </div>
        
        {/* Logout */}
        <button
          onClick={logout}
          className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;