import React from 'react';
import { FiAward, FiStar, FiTrendingUp } from 'react-icons/fi';

const levelColors = {
  BRONZE: { bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-100', icon: FiAward },
  SILVER: { bg: 'bg-gray-400', text: 'text-gray-500', light: 'bg-gray-100', icon: FiAward },
  GOLD: { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100', icon: FiStar },
  PLATINUM: { bg: 'bg-gray-300', text: 'text-gray-600', light: 'bg-gray-100', icon: FiStar },
  DIAMOND: { bg: 'bg-blue-300', text: 'text-blue-600', light: 'bg-blue-100', icon: FiTrendingUp }
};

const LevelBadge = ({ level, size = 'md', showIcon = true }) => {
  const levelInfo = levelColors[level] || levelColors.BRONZE;
  const Icon = levelInfo.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };
  
  const levelNames = {
    BRONZE: 'Bronze',
    SILVER: 'Silver',
    GOLD: 'Gold',
    PLATINUM: 'Platinum',
    DIAMOND: 'Diamond'
  };
  
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${levelInfo.light} ${levelInfo.text} ${sizeClasses[size]}`}>
      {showIcon && <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />}
      <span>{levelNames[level] || 'Bronze'}</span>
    </div>
  );
};

export default LevelBadge;