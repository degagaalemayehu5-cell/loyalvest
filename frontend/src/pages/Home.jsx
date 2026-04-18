import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/ProfileHeader';
import WalletCard from '../components/WalletCard';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { FiTrendingUp, FiUsers, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    balance: 0,
    totalRecharged: 0,
    totalWithdrawn: 0,
    totalProfit: 0,
    totalReferrals: 0,
    pendingWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchData = useCallback(async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        api.get('/investments/products'),
        api.get('/users/stats')
      ]);
      
      // FIX: Check if products exists before setting
      if (productsRes?.data?.products) {
        setProducts(productsRes.data.products);
      } else {
        setProducts([]);
      }
      
      if (statsRes?.data?.stats) {
        setStats(prev => ({ ...prev, ...statsRes.data.stats }));
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  // FIX: This is the key - safe check before using .length
  const hasProducts = products && Array.isArray(products) && products.length > 0;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ProfileHeader user={user} />
      
      <div className="px-4 space-y-4">
        <div className="flex justify-end">
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="text-gray-500 hover:text-blue-600 transition"
          >
            <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <WalletCard stats={stats} onRefresh={fetchData} />
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <FiTrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Total Profit</p>
            <p className="font-bold text-gray-900">ETB{(stats?.totalProfit || 0).toLocaleString()}</p>
          </div>
          <div className="card text-center">
            <FiUsers className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Referrals</p>
            <p className="font-bold text-gray-900">{stats?.totalReferrals || 0}</p>
          </div>
          <div className="card text-center">
            <FiDollarSign className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Invested</p>
            <p className="font-bold text-gray-900">ETB{(stats?.totalRecharged || 0).toLocaleString()}</p>
          </div>
        </div>
        
        {/* Investment Products - FIXED LINE 71 */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Investment Plans</h2>
          {hasProducts ? (
            <div className="space-y-3">
              {products.map(product => (
                <ProductCard key={product._id} product={product} onInvest={fetchData} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-500">No investment plans available at your level.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;