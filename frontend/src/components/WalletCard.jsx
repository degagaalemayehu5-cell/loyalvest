import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUp, FiArrowDown, FiEye, FiEyeOff } from 'react-icons/fi';

const WalletCard = ({ stats }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(0);
  
  useEffect(() => {
    if (stats?.balance !== undefined) {
      setBalance(stats.balance);
    }
  }, [stats]);
  
  const toggleBalance = () => {
    setShowBalance(!showBalance);
  };
  
  return (
    <div className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="flex justify-between items-start mb-2">
        <p className="text-blue-100 text-sm">Wallet Balance</p>
        <button onClick={toggleBalance} className="text-blue-200 hover:text-white">
          {showBalance ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
        </button>
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
          <p className="font-semibold">ETB{stats?.totalRecharged?.toLocaleString() || 0}</p>
        </div>
        <div>
          <p className="text-blue-100 text-xs">Total Profit</p>
          <p className="font-semibold">ETB{stats?.totalProfit?.toLocaleString() || 0}</p>
        </div>
        <div>
          <p className="text-blue-100 text-xs">Pending Withdrawals</p>
          <p className="font-semibold">ETB{stats?.pendingWithdrawals?.toLocaleString() || 0}</p>
        </div>
        <div>
          <p className="text-blue-100 text-xs">Referrals</p>
          <p className="font-semibold">{stats?.totalReferrals || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;