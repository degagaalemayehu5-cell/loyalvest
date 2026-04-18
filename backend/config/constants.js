module.exports = {
  USER_LEVELS: {
    BRONZE: { name: 'Bronze', minBalance: 0, maxBalance: 999, profitRate: 5, color: '#CD7F32', benefits: ['Basic support', '5% profit rate'] },
    SILVER: { name: 'Silver', minBalance: 1000, maxBalance: 4999, profitRate: 8, color: '#C0C0C0', benefits: ['Priority support', '8% profit rate', 'Monthly bonus'] },
    GOLD: { name: 'Gold', minBalance: 5000, maxBalance: 19999, profitRate: 12, color: '#FFD700', benefits: ['VIP support', '12% profit rate', 'Weekly bonus', 'Lower fees'] },
    PLATINUM: { name: 'Platinum', minBalance: 20000, maxBalance: 49999, profitRate: 15, color: '#E5E4E2', benefits: ['Dedicated manager', '15% profit rate', 'Daily bonus', 'No fees'] },
    DIAMOND: { name: 'Diamond', minBalance: 50000, maxBalance: Infinity, profitRate: 20, color: '#B9F2FF', benefits: ['Personal advisor', '20% profit rate', 'Hourly bonus', 'Exclusive products', 'Profit sharing'] }
  },
  
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed'
  },
  
  TRANSACTION_TYPES: {
    RECHARGE: 'recharge',
    WITHDRAW: 'withdraw',
    PROFIT: 'profit',
    REFERRAL_BONUS: 'referral_bonus'
  },
  
  ADMIN_REQUEST_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },
  
  REFERRAL_BONUS_AMOUNT: 50,
  MIN_WITHDRAWAL: 100,
  MAX_WITHDRAWAL: 100000
};