import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiLogOut, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin-login');
  };
  
  // Get current tab name for active state
  const getTabName = () => {
    if (location.pathname.includes('/admin/withdrawals')) return 'withdrawals';
    if (location.pathname.includes('/admin/requests')) return 'requests';
    if (location.pathname.includes('/admin/users')) return 'users';
    return 'dashboard';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="pt-8 pb-12 px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FiShield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{title || 'Admin Dashboard'}</h1>
                <p className="text-purple-100 mt-1 text-sm">
                  {subtitle || `Welcome back, ${user?.name || 'Administrator'}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm font-medium"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 -mt-6 pb-8">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;