/* const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: String,
  chain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelChain'
  },
  city: String,
  country: String,
  photos: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  ratings: [{ type: Number, min: 1, max: 5 }],
  reviews: [{ type: String }]
});

module.exports = mongoose.model('Hotel', hotelSchema);
 */
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: String,
  chain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelChain'
  },
  city: String,
  country: String,
  photos: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }]
});

// Calculate the average rating for the hotel
hotelSchema.methods.calculateAverageRating = function() {
  let totalRating = 0;
  let totalReviews = 0;

  this.rooms.forEach(room => {
    totalRating += room.calculateTotalRating();
    totalReviews += room.ratingsCount;
  });

  if (totalReviews === 0) {
    return 0;
  }

  return totalRating / totalReviews;
};

module.exports = mongoose.model('Hotel', hotelSchema);
