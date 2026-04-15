import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const PendingOrderList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    try {
      const response = await api.get('/wallet/transactions?status=pending');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'pending');
  
  if (pendingWithdrawals.length === 0) return null;
  
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <FiClock className="text-orange-500" /> Pending Orders
      </h3>
      <div className="space-y-3">
        {pendingWithdrawals.map(t => (
          <div key={t._id} className="border-b pb-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-gray-900">Withdrawal Request</p>
                <p className="text-sm text-gray-500">Amount: ₹{t.amount.toLocaleString()}</p>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Requested on: {new Date(t.createdAt).toLocaleString()}
            </p>
            {t.bankDetails && (
              <p className="text-xs text-gray-500 mt-1">
                Bank: {t.bankDetails.bankName} | Account: {t.bankDetails.accountNumber}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingOrderList;