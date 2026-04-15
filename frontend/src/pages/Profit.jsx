import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiCalendar, FiDollarSign } from 'react-icons/fi';

const Profit = () => {
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const [investmentsRes, transactionsRes] = await Promise.all([
        api.get('/investments/my-investments'),
        api.get('/wallet/transactions?type=profit')
      ]);
      setInvestments(investmentsRes.data.investments);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const totalProfit = transactions.reduce((sum, t) => sum + t.amount, 0);
  
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
        <h1 className="text-2xl font-bold">Profit Overview</h1>
        <p className="text-green-100 mt-1">Track your earnings</p>
      </div>
      
      <div className="px-4 -mt-6 space-y-4">
        {/* Total Profit Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm">Total Profit Earned</p>
              <p className="text-3xl font-bold text-green-600">₹{totalProfit.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
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
        
        {/* Active Investments */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Active Investments</h3>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : investments.filter(i => i.status === 'active').length > 0 ? (
            <div className="space-y-3">
              {investments.filter(i => i.status === 'active').map(inv => (
                <div key={inv._id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{inv.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        Invested: ₹{inv.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Profit Rate</p>
                      <p className="font-semibold text-green-600">{inv.product?.profitRate}%</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {inv.currentProfit?.toFixed(2) || 0} / {inv.amount * (inv.product?.profitRate / 100)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 rounded-full h-2"
                        style={{ 
                          width: `${Math.min(100, ((inv.profitEarned || 0) / (inv.amount * (inv.product?.profitRate / 100))) * 100)}%` 
                        }}
                      ></div>
                    </div>
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
                  <span className="font-semibold text-green-600">+₹{t.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No profit transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profit;