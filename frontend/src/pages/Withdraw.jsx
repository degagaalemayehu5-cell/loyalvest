import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Withdraw = () => {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [minWithdrawal, setMinWithdrawal] = useState(100);
  const [maxWithdrawal, setMaxWithdrawal] = useState(100000);
  
  useEffect(() => {
    fetchBalance();
  }, []);
  
  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wallet/balance');
      console.log('Balance response:', response.data);
      setBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Fetch balance error:', error);
      toast.error('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const withdrawAmount = parseFloat(amount);
    
    // Validation checks
    if (!amount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (withdrawAmount < minWithdrawal) {
      toast.error(`Minimum withdrawal amount is ETB${minWithdrawal}`);
      return;
    }
    
    if (withdrawAmount > maxWithdrawal) {
      toast.error(`Maximum withdrawal amount is ETB${maxWithdrawal}`);
      return;
    }
    
    if (withdrawAmount > balance) {
      toast.error(`Insufficient balance. Your balance is ETB${balance.toLocaleString()}`);
      return;
    }
    
    if (!bankName.trim()) {
      toast.error('Please enter bank name');
      return;
    }
    
    if (!accountNumber.trim()) {
      toast.error('Please enter account number');
      return;
    }
    
    if (!accountHolder.trim()) {
      toast.error('Please enter account holder name');
      return;
    }
    
    
    setSubmitting(true);
    try {
      const response = await api.post('/wallet/withdraw', {
        amount: withdrawAmount,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),

      });
      
      toast.success('Withdrawal request submitted successfully!');
      console.log('Withdrawal response:', response.data);
      
      // Reset form
      setAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountHolder('');
      setIfscCode('');
      
      // Refresh balance
      await fetchBalance();
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error(error.response?.data?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
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
  
  const isButtonDisabled = submitting || balance < minWithdrawal;
  const buttonText = submitting ? 'Submitting...' : (balance < minWithdrawal ? `Minimum ETB${minWithdrawal} required` : 'Request Withdrawal');
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white pt-8 pb-12 px-4">
        <h1 className="text-2xl font-bold">Withdraw Funds</h1>
        <p className="text-orange-100 mt-1">Request a withdrawal to your bank account</p>
      </div>
      
      <div className="px-4 -mt-6 space-y-4">
        {/* Balance Card */}
        <div className="card">
          <p className="text-gray-500 text-sm">Available Balance</p>
          <p className="text-3xl font-bold text-gray-900">ETB{balance.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            Minimum withdrawal: ETB{minWithdrawal} | Maximum: ETB{maxWithdrawal.toLocaleString()}
          </p>
          {balance < minWithdrawal && (
            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <p className="text-xs text-yellow-800">
                ⚠️ You need at least ETB{minWithdrawal} to make a withdrawal
              </p>
            </div>
          )}
        </div>
        
        {/* Withdrawal Form */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Withdrawal Request</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (ETB) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                placeholder="Enter amount"
                required
                min={minWithdrawal}
                max={balance}
                step="100"
                disabled={submitting}
              />
              {amount && parseFloat(amount) > balance && (
                <p className="text-xs text-red-500 mt-1">Amount exceeds available balance</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="input-field"
                placeholder="e.g.CBE"
                required
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="input-field"
                placeholder="Your bank account number"
                required
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name *
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="input-field"
                placeholder="Name as in bank account"
                required
                disabled={submitting}
              />
            </div>
            
          
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isButtonDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {buttonText}
            </button>
          </form>
        </div>
        
        {/* Info Note */}
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex gap-2">
            <FiAlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Withdrawals are processed within 24-48 hours</li>
                <li>Minimum withdrawal amount is ETB{minWithdrawal}</li>
                <li>Maximum withdrawal amount is ETB{maxWithdrawal.toLocaleString()}</li>
                <li>Bank details must match your account</li>
                <li>Processing fee: Free</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Success Tips */}
        <div className="card bg-green-50 border border-green-200">
          <div className="flex gap-2">
            <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Tips for faster processing:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ensure bank details are correct</li>
                <li>Account holder name should match your Bank name</li>
               
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;