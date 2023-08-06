const mongoose = require('mongoose');

const hotelChainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  },
  hotels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  }]
});

module.exports = mongoose.model('HotelChain', hotelChainSchema);
