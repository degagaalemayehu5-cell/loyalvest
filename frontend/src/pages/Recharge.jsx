import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiCopy, FiInfo, FiUpload, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Recharge = () => {
  const [rechargeInfo, setRechargeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  
  useEffect(() => {
    fetchRechargeInfo();
    fetchRecentRequests();
  }, []);
  
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot must be less than 5MB');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const rechargeAmount = parseFloat(amount);
    
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
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('amount', rechargeAmount);
    formData.append('transactionId', transactionId);
    formData.append('screenshot', screenshot);
    
    try {
      await api.post('/wallet/recharge', {
        amount: rechargeAmount,
        transactionId: transactionId
      });
      toast.success('Recharge request submitted! Admin will verify and credit your wallet.');
      setAmount('');
      setTransactionId('');
      setScreenshot(null);
      setPreviewUrl(null);
      fetchRecentRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
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
        <p className="text-green-100 mt-1">Add funds to your account</p>
      </div>
      
      <div className="px-4 -mt-6 space-y-4">
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
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-900">{admin.realname}</span>
                      <button onClick={() => copyText(admin.realname)} className="text-blue-600">
                        <FiCopy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                </div>
              </div>
            ))}
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
                placeholder="Enter amount (Min: ETB100)"
                required
                min="100"
                step="100"
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
                      <img src={previewUrl} alt="Screenshot preview" className="max-h-32 mx-auto rounded" />
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshot(null);
                          setPreviewUrl(null);
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
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
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3"
            >
              {submitting ? 'Submitting...' : 'Submit Recharge Request'}
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
                <li>Use your registered phone as reference (optional)</li>
                <li>Take a screenshot of the payment confirmation</li>
                <li>Fill the form above with transaction details</li>
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
                <div key={req._id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">ETB{req.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      req.status === 'approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {req.status === 'approved' ? '✅ Approved' : 
                       req.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                    </span>
                  </div>
                  {req.reference && (
                    <p className="text-xs text-gray-400 mt-1">TXID: {req.reference}</p>
                  )}
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