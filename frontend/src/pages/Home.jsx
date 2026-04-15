import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/ProfileHeader';
import WalletCard from '../components/WalletCard';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        api.get('/investments/products'),
        api.get('/users/stats')
      ]);
      setProducts(productsRes.data.products);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ProfileHeader user={user} />
      
      <div className="px-4 space-y-4">
        <WalletCard stats={stats} />
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <FiTrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Total Profit</p>
            <p className="font-bold text-gray-900">ETB{stats?.totalProfit?.toLocaleString() || 0}</p>
          </div>
          <div className="card text-center">
            <FiUsers className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Referrals</p>
            <p className="font-bold text-gray-900">{stats?.totalReferrals || 0}</p>
          </div>
          <div className="card text-center">
            <FiDollarSign className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Invested</p>
            <p className="font-bold text-gray-900">ETB{stats?.totalRecharged?.toLocaleString() || 0}</p>
          </div>
        </div>
        
        {/* Investment Products */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Investment Plans</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-3">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
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