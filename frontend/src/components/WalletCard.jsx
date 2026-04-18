import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUp, FiArrowDown, FiEye, FiEyeOff, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const WalletCard = ({ stats, onRefresh }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (stats && typeof stats.balance !== 'undefined') {
      setBalance(stats.balance);
    }
  }, [stats]);
  
  const toggleBalance = () => {
    setShowBalance(!showBalance);
  };
  
  const refreshBalance = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/wallet/balance');
      setBalance(response.data.balance);
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      }
      toast.success('Balance updated');
    } catch (error) {
      console.error('Refresh balance error:', error);
      toast.error('Failed to refresh balance');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Safe defaults with fallbacks
  const totalRecharged = stats?.totalRecharged ?? 0;
  const totalProfit = stats?.totalProfit ?? 0;
  const pendingWithdrawals = stats?.pendingWithdrawals ?? 0;
  const totalReferrals = stats?.totalReferrals ?? 0;
  
  return (
    <div className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="flex justify-between items-start mb-2">
        <p className="text-blue-100 text-sm">Wallet Balance</p>
        <div className="flex gap-2">
          <button 
            onClick={refreshBalance} 
            disabled={refreshing} 
            className="text-blue-200 hover:text-white transition-colors"
            aria-label="Refresh balance"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={toggleBalance} 
            className="text-blue-200 hover:text-white transition-colors"
            aria-label="Toggle balance visibility"
          >
            {showBalance ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <p className="text-3xl font-bold mt-1">
        {showBalance ? `ETB${balance.toLocaleString()}` : '••••••'}
      </p>
      
      <div className="flex gap-3 mt-4">
        <Link
          to="/recharge"
          className="flex-1 bg-white/20 backdrop-blur-sm py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
        >
          <FiArrowDown className="text-green-300" /> Recharge
        </Link>
        <Link
          to="/withdraw"
          className="flex-1 bg-white/20 backdrop-blur-sm py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
        >
          <FiArrowUp className="text-orange-300" /> Withdraw
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/20">
        <div>
          <p className="text-blue-100 text-xs">Total Invested</p>
          <p className="font-semibold">ETB{totalRecharged.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-blue-100 text-xs">Total Profit</p>
          <p className="font-semibold">ETB{totalProfit.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-blue-100 text-xs">Pending Withdrawals</p>
          <p className="font-semibold">ETB{pendingWithdrawals.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-blue-100 text-xs">Referrals</p>
          <p className="font-semibold">{totalReferrals.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;