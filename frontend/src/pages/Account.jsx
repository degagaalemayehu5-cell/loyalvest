import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiCopy, FiUsers, FiRefreshCw, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PendingOrderList from '../components/PendingOrderList';

const Account = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const [referralsRes, statsRes] = await Promise.all([
        api.get('/users/referrals'),
        api.get('/users/stats')
      ]);
      setReferrals(referralsRes.data.referrals);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const copyReferralCode = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    toast.success('Referral code copied!');
  };
  
  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pt-8 pb-12 px-4">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-blue-100 mt-1">Manage your investments and referrals</p>
      </div>
      
      <div className="px-4 -mt-6 space-y-4">
        {/* Referral Section */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FiUsers className="text-blue-600" /> Referral Program
          </h2>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded-lg font-mono text-lg text-center">
                {user?.referralCode}
              </code>
              <button onClick={copyReferralCode} className="btn-secondary px-4">
                <FiCopy />
              </button>
            </div>
            <button onClick={copyReferralLink} className="btn-primary w-full mt-3">
              Share Referral Link
            </button>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Total Referrals</span>
            <span className="font-bold text-gray-900">{referrals.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Referral Bonus Earned</span>
            <span className="font-bold text-green-600">ETB{stats?.totalProfit || 0}</span>
          </div>
        </div>
        
        {/* Referrals List */}
        {referrals.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Your Referrals</h3>
            <div className="space-y-2">
              {referrals.map(ref => (
                <div key={ref._id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-900">{ref.name}</p>
                    <p className="text-xs text-gray-500">{new Date(ref.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm text-gray-600">ETB{ref.totalInvestment || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pending Orders */}
        <PendingOrderList />
      </div>
    </div>
  );
};

export default Account;