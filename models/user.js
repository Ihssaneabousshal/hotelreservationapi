// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: Boolean,
  reservations: [{
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel'
    },
    rating: { type: Number, min: 1, max: 5 },
    review: String
  }],
});

module.exports = mongoose.model('User', userSchema);
