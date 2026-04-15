module.exports = {
  USER_LEVELS: {
    BRONZE: { name: 'Bronze', minInvestment: 0, maxInvestment: 999, profitRate: 0.05, color: '#CD7F32' },
    SILVER: { name: 'Silver', minInvestment: 1000, maxInvestment: 4999, profitRate: 0.08, color: '#C0C0C0' },
    GOLD: { name: 'Gold', minInvestment: 5000, maxInvestment: 19999, profitRate: 0.12, color: '#FFD700' },
    PLATINUM: { name: 'Platinum', minInvestment: 20000, maxInvestment: 49999, profitRate: 0.15, color: '#E5E4E2' },
    DIAMOND: { name: 'Diamond', minInvestment: 50000, maxInvestment: Infinity, profitRate: 0.20, color: '#B9F2FF' }
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