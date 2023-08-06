/* const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ['Suite', 'Simple', 'Double', 'Deluxe'],
    required: true
  },
  available: Boolean,
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  photos: [String], // Array of room photo URLs
  ratings: [{ type: Number, min: 1, max: 5 }],
  reviews: [{ type: String }]
});

module.exports = mongoose.model('Room', roomSchema);
 */
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ['Suite', 'Simple', 'Double', 'Deluxe'],
    required: true
  },
  available: Boolean,
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  photos: [String], // Array of room photo URLs
  ratings: {
    type: Map,
    of: Number,
    enum: [1, 2, 3, 4, 5],
    default: {},
  },
  reviews: [String],
});

module.exports = mongoose.model('Room', roomSchema);