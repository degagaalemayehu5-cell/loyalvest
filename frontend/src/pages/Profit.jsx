import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiCalendar, FiDollarSign, FiClock, FiRefreshCw, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profit = () => {
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [claiming, setClaiming] = useState(false);
  
  useEffect(() => {
    fetchData();
    // Refresh real-time profit every 10 seconds
    const interval = setInterval(fetchRealTimeProfit, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [investmentsRes, transactionsRes] = await Promise.all([
        api.get('/investments/my-investments'),
        api.get('/wallet/transactions?type=profit')
      ]);
      setInvestments(investmentsRes.data.investments);
      setTransactions(transactionsRes.data.transactions);
      await fetchRealTimeProfit();
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRealTimeProfit = async () => {
    try {
      const response = await api.get('/investments/real-time-profit');
      setRealTimeData(response.data);
      
      // Update investments with real-time data
      if (response.data.investments) {
        setInvestments(prev => prev.map(inv => {
          const updated = response.data.investments.find(i => i.id === inv._id);
          if (updated) {
            return {
              ...inv,
              currentProfit: updated.accruedProfit,
              totalProfitSoFar: updated.totalProfit,
              progress: updated.progress,
              earnedProfit: updated.earnedProfit,
              accruedProfit: updated.accruedProfit
            };
          }
          return inv;
        }));
      }
    } catch (error) {
      console.error('Real-time profit error:', error);
    }
  };
  
  const handleClaimProfit = async () => {
    setClaiming(true);
    try {
      const response = await api.post('/investments/claim-profit');
      toast.success(response.data.message);
      await fetchData();
    } catch (error) {
      console.error('Claim profit error:', error);
      toast.error('Failed to claim profit');
    } finally {
      setClaiming(false);
    }
  };
  
  const handleRefresh = () => {
    setUpdating(true);
    fetchData().finally(() => setUpdating(false));
  };
  
  const totalClaimedProfit = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalAccruedProfit = realTimeData?.totalAccruedProfit || 0;
  const totalWithAccrued = totalClaimedProfit + totalAccruedProfit;
  
  // Prepare chart data
  const chartData = transactions
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(t => ({
      date: new Date(t.createdAt).toLocaleDateString(),
      amount: t.amount
    }));
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white pt-8 pb-12 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Profit Overview</h1>
            <p className="text-green-100 mt-1">Watch your money grow in real-time</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={updating}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
          >
            <FiRefreshCw className={`w-5 h-5 ${updating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="px-4 -mt-6 space-y-4">
        {/* Total Profit Card with Real-time */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm">Total Profit (including unclaimed)</p>
              <p className="text-3xl font-bold text-green-600">ETB{totalWithAccrued.toFixed(2)}</p>
              {totalAccruedProfit > 0 && (
                <p className="text-xs text-green-500 mt-1">
                  +ETB{totalAccruedProfit.toFixed(2)} unclaimed profit
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t">
            <div>
              <p className="text-xs text-gray-500">Claimed</p>
              <p className="font-semibold text-gray-900">ETB{totalClaimedProfit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Accruing</p>
              <p className="font-semibold text-orange-600">ETB{totalAccruedProfit.toFixed(2)}</p>
            </div>
            <button
              onClick={handleClaimProfit}
              disabled={claiming || totalAccruedProfit < 0.01}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              {claiming ? 'Claiming...' : `Claim ETB${totalAccruedProfit.toFixed(2)}`}
            </button>
          </div>
        </div>
        
        {/* Profit Chart */}
        {chartData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Profit History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Active Investments with Real-time Progress */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiClock className="text-green-500" /> Active Investments (Real-time)
          </h3>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : investments.filter(i => i.status === 'active').length > 0 ? (
            <div className="space-y-4">
              {investments.filter(i => i.status === 'active').map(inv => (
                <div key={inv._id} className="border-b pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{inv.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        Invested: ETB{inv.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Profit Rate</p>
                      <p className="font-semibold text-green-600">{inv.product?.profitRate}%</p>
                    </div>
                  </div>
                  
                  {/* Real-time profit display */}
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-gray-600">Earned so far:</span>
                    <span className="font-semibold text-green-600">
                      ETB{(inv.profitEarned + (inv.accruedProfit || 0)).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress to target</span>
                      <span>{Math.min(100, (inv.progress || 0)).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${Math.min(100, (inv.progress || 0))}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Daily earnings rate */}
                  <div className="mt-2 text-xs text-gray-400">
                    <p>Earning ≈ ETB{((inv.amount * (inv.product?.profitRate / 100)) / 30 / 24).toFixed(4)} per hour</p>
                    <p>Ends: {new Date(inv.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No active investments</p>
          )}
        </div>
        
        {/* Recent Profit Transactions */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Profit Credits</h3>
          {transactions.slice(0, 10).length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 10).map(t => (
                <div key={t._id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Profit Credit</p>
                    <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="font-semibold text-green-600">+ETB{t.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No profit transactions yet</p>
          )}
        </div>
        
        {/* How it works explanation */}
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">📈 How Real-time Profit Works</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Profit accrues every minute, 24/7</p>
            <p>• You can claim profit anytime (even small amounts)</p>
            <p>• Unclaimed profit continues to grow</p>
            <p>• Higher investment = faster growth</p>
            <p>• Claimed profit is added to your wallet instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profit;