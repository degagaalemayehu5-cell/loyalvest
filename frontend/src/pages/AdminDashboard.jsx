import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { FiUsers, FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiUserCheck, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AdminDashboard = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [recharges, setRecharges] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('withdrawals');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWithdrawals: 0,
    totalRecharges: 0,
    pendingRequests: 0,
    totalUsers: 0
  });
  
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'withdrawals') {
        const res = await api.get('/admin/withdrawals/pending');
        setWithdrawals(res.data.withdrawals);
        setStats(prev => ({ ...prev, totalWithdrawals: res.data.withdrawals.length }));
      } else if (activeTab === 'recharges') {
        const res = await api.get('/admin/recharge/pending');
        setRecharges(res.data.recharges);
        setStats(prev => ({ ...prev, totalRecharges: res.data.recharges.length }));
      } else if (activeTab === 'requests') {
        const res = await api.get('/admin/requests/pending');
        setAdminRequests(res.data.requests);
        setStats(prev => ({ ...prev, pendingRequests: res.data.requests.length }));
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data.users);
        setStats(prev => ({ ...prev, totalUsers: res.data.users.length }));
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveWithdrawal = async (id) => {
    try {
      await api.put(`/admin/withdrawals/${id}/approve`);
      toast.success('Withdrawal approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve withdrawal');
    }
  };
  
  const handleRejectWithdrawal = async (id) => {
    const reason = prompt('Please enter reason for rejection:');
    if (reason) {
      try {
        await api.put(`/admin/withdrawals/${id}/reject`, { reason });
        toast.success('Withdrawal rejected');
        fetchData();
      } catch (error) {
        toast.error('Failed to reject withdrawal');
      }
    }
  };
  
  const handleApproveRecharge = async (id) => {
    try {
      await api.put(`/admin/recharge/${id}/approve`);
      toast.success('Recharge approved and amount credited');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve recharge');
    }
  };
  
  const handleRejectRecharge = async (id) => {
    const reason = prompt('Please enter reason for rejection:');
    if (reason) {
      try {
        await api.put(`/admin/recharge/${id}/reject`, { reason });
        toast.success('Recharge rejected');
        fetchData();
      } catch (error) {
        toast.error('Failed to reject recharge');
      }
    }
  };
  
  const handleApproveAdminRequest = async (id) => {
    try {
      await api.put(`/admin/requests/${id}/approve`);
      toast.success('Admin request approved');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve admin request');
    }
  };
  
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };
  
  const tabs = [
    { id: 'withdrawals', label: 'Withdrawals', icon: FiDollarSign, count: withdrawals.length },
    { id: 'recharges', label: 'Recharge Requests', icon: FiUpload, count: recharges.length },
    { id: 'requests', label: 'Admin Requests', icon: FiUserCheck, count: adminRequests.length },
    { id: 'users', label: 'Users', icon: FiUsers, count: users.length },
  ];
  
  return (
    <AdminLayout title="Admin Dashboard" subtitle="Manage platform operations">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pending Withdrawals</p>
              <p className="text-xl font-bold text-orange-600">{stats.totalWithdrawals}</p>
            </div>
            <FiDollarSign className="w-6 h-6 text-orange-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pending Recharges</p>
              <p className="text-xl font-bold text-green-600">{stats.totalRecharges}</p>
            </div>
            <FiUpload className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Admin Requests</p>
              <p className="text-xl font-bold text-purple-600">{stats.pendingRequests}</p>
            </div>
            <FiUserCheck className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Users</p>
              <p className="text-xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <FiUsers className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          {/* Withdrawals Tab */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-3">
              {withdrawals.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <FiClock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No pending withdrawals</p>
                </div>
              ) : (
                withdrawals.map(w => (
                  <div key={w._id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{w.user?.name}</p>
                        <p className="text-sm text-gray-500">{w.user?.email}</p>
                      </div>
                      <span className="text-xl font-bold text-orange-600">₹{w.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
                      <p>🏦 Bank: {w.bankDetails?.bankName}</p>
                      <p>🔢 Account: {w.bankDetails?.accountNumber}</p>
                      <p>📇 IFSC: {w.bankDetails?.ifscCode}</p>
                      <p>👤 Holder: {w.bankDetails?.accountHolder}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveWithdrawal(w._id)}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 transition"
                      >
                        <FiCheckCircle /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectWithdrawal(w._id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 transition"
                      >
                        <FiXCircle /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Recharge Requests Tab */}
          {activeTab === 'recharges' && (
            <div className="space-y-3">
              {recharges.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No pending recharge requests</p>
                </div>
              ) : (
                recharges.map(r => (
                  <div key={r._id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{r.user?.name}</p>
                        <p className="text-sm text-gray-500">{r.user?.email}</p>
                      </div>
                      <span className="text-xl font-bold text-green-600">₹{r.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
                      <p>🔑 Transaction ID: {r.reference || 'N/A'}</p>
                      <p>📅 Requested: {new Date(r.createdAt).toLocaleString()}</p>
                      <p>💬 Note: {r.adminNotes || 'Awaiting verification'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRecharge(r._id)}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 transition"
                      >
                        <FiCheckCircle /> Approve & Credit
                      </button>
                      <button
                        onClick={() => handleRejectRecharge(r._id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 transition"
                      >
                        <FiXCircle /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Admin Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {adminRequests.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <FiUserCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No pending admin requests</p>
                </div>
              ) : (
                adminRequests.map(req => (
                  <div key={req._id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{req.user?.name}</p>
                        <p className="text-sm text-gray-500">{req.user?.email}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Invested: ₹{req.user?.totalInvestment?.toLocaleString() || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
                      📝 Reason: {req.reason}
                    </p>
                    <button
                      onClick={() => handleApproveAdminRequest(req._id)}
                      className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle /> Approve Admin Request
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              {users.map(u => (
                <div key={u._id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.isAdmin ? '👑 Admin' : '👤 User'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
                    <span>🏆 Level: {u.level}</span>
                    <span>💰 Invested: ₹{u.totalInvestment?.toLocaleString() || 0}</span>
                    <span>📈 Profit: ₹{u.totalProfit?.toLocaleString() || 0}</span>
                    <span>📅 Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                      className={`flex-1 py-2 rounded-lg transition ${
                        u.isActive
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {u.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;