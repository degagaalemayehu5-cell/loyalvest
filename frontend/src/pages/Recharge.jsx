import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { FiCopy, FiInfo, FiUpload, FiClock, FiAlertCircle, FiEye, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Recharge = () => {
  const location = useLocation();
  const [rechargeInfo, setRechargeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedVip, setSelectedVip] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [projectedReturns, setProjectedReturns] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planAmount = params.get('amount');
    const planName = params.get('plan');
    const vipLevel = params.get('vip');
    const productId = params.get('productId');

    if (planAmount) {
      setAmount(planAmount);
    }
    if (planName) {
      setSelectedPlan(planName);
    }
    if (vipLevel) {
      setSelectedVip(vipLevel);
    }
    if (productId) {
      setSelectedProductId(productId);
      fetchProductDetails(productId);
    }

    fetchRechargeInfo();
    fetchRecentRequests();
  }, [location.search]);

  useEffect(() => {
    const amountNumber = parseFloat(amount);
    if (!amountNumber || amountNumber <= 0 || !productDetails) {
      setProjectedReturns(null);
      return;
    }

    const profit = amountNumber * (productDetails.profitRate / 100);
    const total = amountNumber + profit;

    setProjectedReturns({
      profit,
      total,
      profitRate: productDetails.profitRate,
      duration: productDetails.duration
    });
  }, [amount, productDetails]);

  const fetchProductDetails = async (productId) => {
    try {
      const response = await api.get('/investments/products');
      const product = response.data.products?.find((item) => item._id === productId || item.id === productId);
      if (product) {
        setProductDetails(product);
      }
    } catch (error) {
      console.error('Fetch product details error:', error);
    }
  };
  
  const fetchRechargeInfo = async () => {
    try {
      const response = await api.get('/wallet/recharge-info');
      setRechargeInfo(response.data.rechargeInfo);
    } catch (error) {
      console.error('Fetch recharge info error:', error);
      toast.error('Failed to load recharge information');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRecentRequests = async () => {
    try {
      const response = await api.get('/wallet/transactions?type=recharge&limit=5');
      setRecentRequests(response.data.transactions || []);
    } catch (error) {
      console.error('Fetch recent requests error:', error);
    }
  };
  
  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot must be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP)');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      toast.success('Image selected successfully');
    }
  };
  
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };
  
  const formatCurrency = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return 'ETB0';
    }
    return `ETB${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const rechargeAmount = parseFloat(amount);
    
    // Validation
    if (!amount || rechargeAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (rechargeAmount < 100) {
      toast.error('Minimum recharge amount is ETB100');
      return;
    }
    
    if (!screenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }
    
    setSubmitting(true);
    setUploadProgress(0);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('amount', rechargeAmount);
    formData.append('screenshot', screenshot);
    
    try {
      formData.append('productId', selectedProductId);
      formData.append('planName', selectedPlan);
      formData.append('vipLevel', selectedVip);

      const response = await api.post('/wallet/recharge', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      if (response.data.success) {
        toast.success('✅ Recharge request submitted! Admin will verify and credit your wallet.');
        // Reset form
        setAmount('');
        setScreenshot(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        fetchRecentRequests();
      } else {
        toast.error(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit request. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white pt-8 pb-12 px-4">
        <h1 className="text-2xl font-bold">Recharge Wallet</h1>
        <p className="text-green-100 mt-1">
          {selectedPlan ? `Recharge for ${selectedPlan}${selectedVip ? ` (${selectedVip.toUpperCase()})` : ''}` : 'Add funds to your account'}
        </p>
      </div>
      
      <div className="px-4 -mt-6 space-y-4">
        {projectedReturns && (
          <div className="card bg-green-50 border border-green-200 text-green-900">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm font-semibold">Projected earnings for this plan</p>
                <p className="text-xs text-green-700">
                  {selectedPlan}{selectedVip ? ` (${selectedVip.toUpperCase()})` : ''} • {projectedReturns.duration} days • {projectedReturns.profitRate}% total profit
                </p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] bg-green-100 text-green-700 px-2 py-1 rounded-full">Estimate</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <p className="text-xs text-gray-500">Expected profit</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(projectedReturns.profit)}</p>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <p className="text-xs text-gray-500">Total return</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(projectedReturns.total)}</p>
              </div>
            </div>
          </div>
        )}
        {/* Admin Bank Details */}
        {rechargeInfo && rechargeInfo.adminAccounts && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiInfo className="text-blue-600" /> Admin Bank Details
            </h3>
            {rechargeInfo.adminAccounts.map((admin, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-3 border border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-gray-900">{admin.bankName || 'Bank Account'}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Verified</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Holder:</span>
                    <span className="font-mono text-gray-900">{admin.accountHolder}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-900">{admin.accountNumber}</span>
                      <button onClick={() => copyText(admin.accountNumber)} className="text-blue-600">
                        <FiCopy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Real Name:</span>
                    <span className="font-mono text-gray-900">{admin.realname || admin.accountHolder}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {rechargeInfo && rechargeInfo.supportContacts && rechargeInfo.supportContacts.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiInfo className="text-blue-600" /> Admin Support Contacts
            </h3>
            <div className="space-y-3">
              {rechargeInfo.supportContacts.map((admin, index) => (
                <div key={index} className="border rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{admin.name || 'Admin'}</p>
                      <p className="text-xs text-gray-500">Telegram only</p>
                    </div>
                    {admin.telegramUsername ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">@{admin.telegramUsername}</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">No Telegram</span>
                    )}
                  </div>
                  {admin.telegramUsername && (
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                      <span>Contact on Telegram for support</span>
                      <button onClick={() => copyText(`@${admin.telegramUsername}`)} className="text-blue-600 font-medium">
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recharge Form */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Submit Payment Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Recharge (ETB) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                placeholder="Enter amount (Min: 100)"
                required
                min="100"
                step="100"
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Screenshot *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <div className="mb-3">
                      <img src={previewUrl} alt="Screenshot preview" className="max-h-32 mx-auto rounded shadow" />
                      <div className="flex gap-2 justify-center mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshot(null);
                            setPreviewUrl(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                          disabled={submitting}
                        >
                          Remove
                        </button>
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <FiCheck className="w-3 h-3" /> Image selected
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
                            disabled={submitting}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG, WEBP up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Upload Progress Bar */}
            {submitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                'Submit Recharge Request'
              )}
            </button>
          </form>
        </div>
        
        {/* Instructions */}
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex gap-2">
            <FiAlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How to Recharge:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Transfer the amount to any of the admin bank accounts above</li>
                <li>Use your registered phone as reference</li>
                <li>Take a screenshot of the payment confirmation</li>
                <li>Upload the screenshot and submit</li>
                <li>Admin will verify and credit your wallet within 24 hours</li>
              </ol>
            </div>
          </div>
        </div>
        
        {/* Recent Requests */}
        {recentRequests.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiClock className="text-orange-500" /> Recent Recharge Requests
            </h3>
            <div className="space-y-2">
              {recentRequests.map((req) => (
                <div key={req._id} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">ETB{req.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status === 'approved' ? '✅ Approved' : 
                         req.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                      </span>
                      {req.screenshot && (
                        <div className="mt-1">
                          <FiEye className="w-3 h-3 text-gray-400 inline mr-1" />
                          <span className="text-xs text-gray-400">Screenshot uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recharge;