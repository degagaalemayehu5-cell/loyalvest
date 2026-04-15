const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  minLevel: {
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'],
    default: 'BRONZE'
  },
  minInvestment: {
    type: Number,
    required: true
  },
  maxInvestment: Number,
  profitRate: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);