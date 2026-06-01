import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiCalendar, FiDollarSign, FiChevronRight } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  if (!product) {
    return null;
  }

  const imageSrc = product.imageUrl || 'https://via.placeholder.com/800x400?text=Investment+Plan';

  const handleNavigateToRecharge = () => {
    const params = new URLSearchParams({
      amount: product.minInvestment?.toString() || '',
      plan: product.name || '',
      vip: product.vipLevel || '',
      productId: product._id.toString()
    });
    navigate(`/recharge?${params.toString()}`);
  };

  return (
    <div
      className="card hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={handleNavigateToRecharge}
    >
      <div className="h-40 overflow-hidden mb-3 rounded-t-xl bg-gray-100">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/800x400?text=Investment+Plan';
          }}
        />
      </div>
      <div className="flex justify-between items-start mb-3 px-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {product.vipLevel && (
              <span className="text-xs uppercase tracking-[0.25em] bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full font-extrabold shadow-sm">
                {product.vipLevel.toUpperCase()}
              </span>
            )}
            <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
          </div>
          <p className="text-sm text-gray-500">{product.description}</p>
        </div>
        <span className="text-green-600 font-bold text-lg">{product.profitRate}%</span>
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
      <div className="mt-4 px-3 pb-3">
        <button
          type="button"
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
        >
          Invest & Recharge
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
