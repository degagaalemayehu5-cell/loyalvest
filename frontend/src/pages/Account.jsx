import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiCopy, FiUsers, FiRefreshCw } from 'react-icons/fi';
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
    setLoading(true);
    try {
      console.log('Fetching account data...');
      
      // Fetch referrals list
      const referralsRes = await api.get('/users/referrals');
      console.log('Referrals response:', referralsRes.data);
      setReferrals(referralsRes.data.referrals || []);
      
      // Fetch user stats (includes totalReferralBonus)
      const statsRes = await api.get('/users/stats');
      console.log('Stats response:', statsRes.data);
      console.log('totalReferralBonus from API:', statsRes.data.stats?.totalReferralBonus);
      setStats(statsRes.data.stats);
      
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
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
  
  // Get referral bonus from stats API - THIS IS THE KEY FIX
  const referralBonus = stats?.totalReferralBonus || 0;
  
  console.log('Referral bonus being displayed:', referralBonus);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pt-8 pb-12 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Account</h1>
            <p className="text-blue-100 mt-1">Manage your investments and referrals</p>
          </div>
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="px-4 -mt-6 space-y-4">
        {/* Referral Section */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FiUsers className="text-blue-600" /> Referral Program
          </h2>
          
          {/* Referral Code Box */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded-lg font-mono text-lg text-center">
                {user?.referralCode}
              </code>
              <button onClick={copyReferralCode} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition">
                <FiCopy />
              </button>
            </div>
            <button onClick={copyReferralLink} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition mt-3">
              Share Referral Link
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{referrals.length}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-500">Referral Bonus Earned</p>
              <p className="text-2xl font-bold text-green-600">ETB{referralBonus}</p>
            </div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500">Total Wallet Balance</p>
            <p className="text-2xl font-bold text-blue-600">ETB{(stats?.balance || 0).toLocaleString()}</p>
          </div>
        </div>
        
        {/* Referrals List */}
        {referrals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiUsers className="text-green-600" /> Your Referrals ({referrals.length})
            </h3>
            <div className="space-y-2">
              {referrals.map((ref) => (
                <div key={ref._id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{ref.name}</p>
                    <p className="text-xs text-gray-500">{new Date(ref.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-green-600">+ETB50</span>
                    <p className="text-xs text-gray-400">Referral bonus</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total Bonus Summary */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Total Referral Bonus</span>
                <span className="text-lg font-bold text-green-600">ETB{referralBonus}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* No Referrals Message */}
        {referrals.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No referrals yet</p>
            <p className="text-xs text-gray-400 mt-1">Share your referral code to earn ETB50 per referral!</p>
          </div>
        )}
        
        {/* Pending Orders */}
        <PendingOrderList />
      </div>
    </div>
  );
};

export default Account;