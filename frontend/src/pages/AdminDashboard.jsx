import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  FiUsers, FiDollarSign, FiClock, FiCheckCircle, FiXCircle, 
  FiUserCheck, FiUpload, FiPackage, FiEdit2, FiTrash2, 
  FiPlus, FiX, FiSave, FiCopy 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AdminDashboard = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [recharges, setRecharges] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('withdrawals');
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    minLevel: 'BRONZE',
    minInvestment: '',
    maxInvestment: '',
    profitRate: '',
    duration: '30',
    isActive: true
  });
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
      } else if (activeTab === 'products') {
        const res = await api.get('/admin/products');
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text, label) => {
    if (text && text !== 'N/A') {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    }
  };
  
  // Withdrawal Handlers
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
  
  // Recharge Handlers
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
  
  // Admin Request Handlers
  const handleApproveAdminRequest = async (id) => {
    try {
      await api.put(`/admin/requests/${id}/approve`);
      toast.success('Admin request approved');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve admin request');
    }
  };
  
  // User Management Handlers
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };
  
  // Product CRUD Operations - FULLY INTERACTIVE
  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.minInvestment || !productForm.profitRate) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await api.post('/admin/products', {
        ...productForm,
        minInvestment: parseFloat(productForm.minInvestment),
        maxInvestment: productForm.maxInvestment ? parseFloat(productForm.maxInvestment) : null,
        profitRate: parseFloat(productForm.profitRate),
        duration: parseInt(productForm.duration)
      });
      toast.success('Product created successfully');
      setShowProductModal(false);
      resetProductForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to create product');
    }
  };
  
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      await api.put(`/admin/products/${editingProduct._id}`, {
        name: productForm.name,
        description: productForm.description,
        minLevel: productForm.minLevel,
        minInvestment: parseFloat(productForm.minInvestment),
        maxInvestment: productForm.maxInvestment ? parseFloat(productForm.maxInvestment) : null,
        profitRate: parseFloat(productForm.profitRate),
        duration: parseInt(productForm.duration),
        isActive: productForm.isActive
      });
      toast.success('Product updated successfully');
      setEditingProduct(null);
      setShowProductModal(false);
      resetProductForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };
  
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${productId}`);
        toast.success('Product deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };
  
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      minLevel: product.minLevel,
      minInvestment: product.minInvestment,
      maxInvestment: product.maxInvestment || '',
      profitRate: product.profitRate,
      duration: product.duration,
      isActive: product.isActive
    });
    setShowProductModal(true);
  };
  
  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      minLevel: 'BRONZE',
      minInvestment: '',
      maxInvestment: '',
      profitRate: '',
      duration: '30',
      isActive: true
    });
  };
  
  const tabs = [
    { id: 'withdrawals', label: 'Withdrawals', icon: FiDollarSign, count: withdrawals.length },
    { id: 'recharges', label: 'Recharge Requests', icon: FiUpload, count: recharges.length },
    { id: 'requests', label: 'Admin Requests', icon: FiUserCheck, count: adminRequests.length },
    { id: 'users', label: 'Users', icon: FiUsers, count: users.length },
    { id: 'products', label: 'Products', icon: FiPackage, count: products.length },
  ];
  
  const levelOptions = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  
  return (
    <AdminLayout title="Admin Dashboard" subtitle="Manage platform operations">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Pending Withdrawals</p><p className="text-xl font-bold text-orange-600">{stats.totalWithdrawals}</p></div>
            <FiDollarSign className="w-6 h-6 text-orange-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Pending Recharges</p><p className="text-xl font-bold text-green-600">{stats.totalRecharges}</p></div>
            <FiUpload className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Admin Requests</p><p className="text-xl font-bold text-purple-600">{stats.pendingRequests}</p></div>
            <FiUserCheck className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Total Users</p><p className="text-xl font-bold text-blue-600">{stats.totalUsers}</p></div>
            <FiUsers className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Products</p><p className="text-xl font-bold text-indigo-600">{products.length}</p></div>
            <FiPackage className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label} {tab.count > 0 && <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'}`}>{tab.count}</span>}
          </button>
        ))}
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div><p className="mt-2 text-gray-500">Loading...</p></div>
      ) : (
        <>
          {/* WITHDRAWALS TAB */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-3">
              {withdrawals.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center"><FiClock className="w-12 h-12 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">No pending withdrawals</p></div>
              ) : (
                withdrawals.map(w => (
                  <div key={w._id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-400">
                    <div className="flex justify-between items-start mb-3 pb-2 border-b">
                      <div><p className="font-bold text-gray-900 text-lg">{w.user?.name}</p><p className="text-sm text-gray-500">{w.user?.phone}</p></div>
                      <div className="text-right"><p className="text-2xl font-bold text-orange-600">ETB{w.amount?.toLocaleString()}</p><p className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleString()}</p></div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiCopy className="w-3 h-3" /> Bank Account Details</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center"><span className="text-gray-600">Bank Name:</span><div className="flex items-center gap-2"><span className="font-medium">{w.bankDetails?.bankName || 'N/A'}</span><button onClick={() => copyToClipboard(w.bankDetails?.bankName, 'Bank name')} className="text-blue-500"><FiCopy className="w-3 h-3" /></button></div></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Account Number:</span><div className="flex items-center gap-2"><span className="font-mono">{w.bankDetails?.accountNumber || 'N/A'}</span><button onClick={() => copyToClipboard(w.bankDetails?.accountNumber, 'Account number')} className="text-blue-500"><FiCopy className="w-3 h-3" /></button></div></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Account Holder:</span><span className="font-medium">{w.bankDetails?.accountHolder || w.user?.name}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveWithdrawal(w._id)} className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"><FiCheckCircle /> Approve</button>
                      <button onClick={() => handleRejectWithdrawal(w._id)} className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"><FiXCircle /> Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* RECHARGE REQUESTS TAB - WITH USER DETAILS */}
{activeTab === 'recharges' && (
  <div className="space-y-3">
    {recharges.length === 0 ? (
      <div className="bg-white rounded-xl p-8 text-center"><FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">No pending recharge requests</p></div>
    ) : (
      recharges.map(r => (
        <div key={r._id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-400">
          <div className="flex justify-between items-start mb-3 pb-2 border-b">
            <div><p className="font-bold text-gray-900 text-lg">{r.user?.name}</p><p className="text-sm text-gray-500">{r.user?.phone}</p></div>
            <div className="text-right"><p className="text-2xl font-bold text-green-600">ETB{r.amount?.toLocaleString()}</p><p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</p></div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 mb-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">📋 Transaction Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center"><span className="text-gray-600">Payment Method:</span><span className="capitalize">{r.paymentMethod || 'Bank Transfer'}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600">Status Note:</span><span className="text-yellow-600">{r.adminNotes || 'Awaiting verification'}</span></div>
              
              {/* Screenshot Display - FIXED FIELD NAME */}
              {r.screenshot && (
                <div className="mt-2">
                  <span className="text-gray-600 block mb-2">Payment Screenshot:</span>
                  <div className="flex justify-center">
                    <img
                      src={r.screenshot}
                      alt="Payment Screenshot"
                      className="max-h-48 rounded-lg shadow cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(r.screenshot, '_blank')}
                      onError={(e) => {
                        console.error('Image failed to load:', r.screenshot);
                        e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">Click image to view full size</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => handleApproveRecharge(r._id)} className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"><FiCheckCircle /> Approve & Credit ETB{r.amount?.toLocaleString()}</button>
            <button onClick={() => handleRejectRecharge(r._id)} className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"><FiXCircle /> Reject</button>
          </div>
        </div>
      ))
    )}
  </div>
)}
          
          {/* PRODUCTS TAB - FULLY INTERACTIVE (Add, Edit, Delete) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <button onClick={() => { resetProductForm(); setEditingProduct(null); setShowProductModal(true); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"><FiPlus /> Add New Product</button>
              
              {products.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center"><FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">No products yet. Click "Add New Product" to create one.</p></div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {products.map(product => (
                    <div key={product._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{product.minLevel}</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{product.description || 'No description'}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Min Investment</p><p className="font-semibold">ETB{product.minInvestment?.toLocaleString()}</p></div>
                            <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Max Investment</p><p className="font-semibold">{product.maxInvestment ? `ETB${product.maxInvestment.toLocaleString()}` : 'Unlimited'}</p></div>
                            <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Profit Rate</p><p className="font-semibold text-green-600">{product.profitRate}%</p></div>
                            <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Duration</p><p className="font-semibold">{product.duration} days</p></div>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <button onClick={() => handleEditProduct(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Product"><FiEdit2 className="w-5 h-5" /></button>
                          <button onClick={() => handleDeleteProduct(product._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Product"><FiTrash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* ADMIN REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {adminRequests.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center"><FiUserCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">No pending admin requests</p></div>
              ) : (
                adminRequests.map(req => (
                  <div key={req._id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-400">
                    <div className="flex justify-between items-start"><div><p className="font-bold text-gray-900">{req.user?.name}</p><p className="text-sm text-gray-500">{req.user?.phone}</p></div><button onClick={() => handleApproveAdminRequest(req._id)} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">Approve Admin</button></div>
                    <p className="text-sm mt-2 text-gray-600"><span className="font-medium">Reason:</span> {req.reason}</p>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              {users.map(u => (
                <div key={u._id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-400">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div><p className="font-bold text-gray-900">{u.name}</p><p className="text-sm text-gray-500">{u.phone}</p><div className="flex gap-2 mt-1"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Level: {u.level}</span><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Invested: ETB{u.totalInvestment || 0}</span></div></div>
                    <button onClick={() => handleToggleUserStatus(u._id, u.isActive)} className={`px-4 py-2 rounded-lg transition ${u.isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* PRODUCT MODAL (Add/Edit) - FULLY FUNCTIONAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowProductModal(false); setEditingProduct(null); resetProductForm(); }}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3><button onClick={() => { setShowProductModal(false); setEditingProduct(null); resetProductForm(); }} className="p-1 hover:bg-gray-100 rounded"><FiX className="w-5 h-5 text-gray-500" /></button></div>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label><input type="text" placeholder="e.g., Bronze Starter" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea placeholder="Describe the investment plan" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="input-field" rows="2" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Minimum Level *</label><select value={productForm.minLevel} onChange={(e) => setProductForm({...productForm, minLevel: e.target.value})} className="input-field">{levelOptions.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Min Investment (ETB) *</label><input type="number" placeholder="100" value={productForm.minInvestment} onChange={(e) => setProductForm({...productForm, minInvestment: e.target.value})} className="input-field" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Max Investment (ETB)</label><input type="number" placeholder="Unlimited" value={productForm.maxInvestment} onChange={(e) => setProductForm({...productForm, maxInvestment: e.target.value})} className="input-field" /></div></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Profit Rate (%) *</label><input type="number" placeholder="70" value={productForm.profitRate} onChange={(e) => setProductForm({...productForm, profitRate: e.target.value})} className="input-field" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (days) *</label><input type="number" placeholder="30" value={productForm.duration} onChange={(e) => setProductForm({...productForm, duration: e.target.value})} className="input-field" /></div></div>
              <div><label className="flex items-center gap-2"><input type="checkbox" checked={productForm.isActive} onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})} className="w-4 h-4" /><span className="text-sm text-gray-700">Active (visible to users)</span></label></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => { setShowProductModal(false); setEditingProduct(null); resetProductForm(); }} className="flex-1 btn-secondary">Cancel</button><button onClick={editingProduct ? handleUpdateProduct : handleCreateProduct} className="flex-1 btn-primary flex items-center justify-center gap-2"><FiSave /> {editingProduct ? 'Update Product' : 'Create Product'}</button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;