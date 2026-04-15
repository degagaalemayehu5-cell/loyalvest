import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiMail, FiPhone, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
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
              <p className="text-sm text-gray-500">{user?.email}</p>
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
              placeholder="New Password"
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