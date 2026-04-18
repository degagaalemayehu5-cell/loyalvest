import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiCalendar, FiDollarSign } from 'react-icons/fi';

const ProductCard = ({ product, onInvest }) => {
  const [investing, setInvesting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState(product?.minInvestment || 0);
  
  const handleInvest = async () => {
    // Safe check for product
    if (!product) {
      toast.error('Product information not available');
      return;
    }
    
    if (amount < product.minInvestment) {
      toast.error(`Minimum investment is ETB${product.minInvestment}`);
      return;
    }
    
    if (product.maxInvestment && amount > product.maxInvestment) {
      toast.error(`Maximum investment is ETB${product.maxInvestment}`);
      return;
    }
    
    setInvesting(true);
    try {
      await api.post('/investments/invest', {
        productId: product._id,
        amount: parseFloat(amount)
      });
      toast.success('Investment successful!');
      setShowModal(false);
      setAmount(product.minInvestment);
      
      // Refresh parent component data
      if (onInvest) {
        onInvest();
      }
    } catch (error) {
      console.error('Investment error:', error);
      toast.error(error.response?.data?.message || 'Investment failed');
    } finally {
      setInvesting(false);
    }
  };
  
  // Safe calculation with fallback
  const expectedProfit = (amount * (product?.profitRate || 0)) / 100;
  
  // Don't render if product is missing
  if (!product) {
    return null;
  }
  
  return (
    <>
      <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowModal(true)}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-gray-900">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{product.description}</p>
          </div>
          <span className="text-green-600 font-bold">{product.profitRate}%</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <FiDollarSign className="text-xs" />
            <span>Min: ETB{product.minInvestment?.toLocaleString()}</span>
          </div>
          {product.maxInvestment && (
            <div className="flex items-center gap-1 text-gray-600">
              <FiDollarSign className="text-xs" />
              <span>Max: ETB{product.maxInvestment.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-gray-600">
            <FiCalendar className="text-xs" />
            <span>{product.duration} days</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <FiTrendingUp className="text-xs" />
            <span>Level: {product.minLevel}</span>
          </div>
        </div>
      </div>
      
      {/* Investment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Amount (ETB)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  min={product.minInvestment}
                  max={product.maxInvestment || ''}
                  step="100"
                  disabled={investing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min: ETB{product.minInvestment.toLocaleString()} | Max: {product.maxInvestment ? `ETB${product.maxInvestment.toLocaleString()}` : 'Unlimited'}
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Expected Returns</p>
                <p className="text-xl font-bold text-green-600">ETB{expectedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-500">+ ETB{amount.toLocaleString()} principal</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary"
                disabled={investing}
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                disabled={investing || amount < product.minInvestment}
                className="flex-1 btn-primary"
              >
                {investing ? 'Processing...' : 'Invest Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;