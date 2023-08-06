// routes/experience.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');
const Hotel = require('../models/hotel');
const HotelChain = require('../models/hotelChainSchema'); // Add the HotelChain model
const Room = require('../models/room');
const Reservation = require("../models/reservation")
router.post('/rate-review/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { rating, review } = req.body;
    const user = req.user;
    const reservation = await Reservation.findOne({ user: user._id, room: roomId });
    if (!reservation) {
      return res.status(400).json({ message: 'User has not reserved this room' });
    }
    const room = await Room.findOne({ _id: roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Update room's ratings and reviews
    if (room.ratings.has(rating.toString())) {
      room.ratings.set(rating.toString(), room.ratings.get(rating.toString()) + 1);
    } else {
      room.ratings.set(rating.toString(), 1);
    }
    room.reviews.push(review);
    await room.save();

    res.json({ message: 'Room rating and review added successfully' });
  } catch (error) {
    console.error('Error rating and reviewing room:', error);
    res.status(500).json({ message: 'An error occurred while rating and reviewing room' });
  }
}); 
/* router.post('/rate-review/:reservationId', authMiddleware, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { rating, review } = req.body;
    const user = req.user;

    const reservation = await Reservation.findOne({ _id: reservationId });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const room = await Room.findOne({ _id: reservation.room });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Initialize ratings map if not present
    if (!room.ratings) {
      room.ratings = new Map();
    }

    // Update room's ratings and reviews
    if (room.ratings.has(rating.toString())) {
      room.ratings.set(rating.toString(), room.ratings.get(rating.toString()) + 1);
    } else {
      room.ratings.set(rating.toString(), 1);
    }
    room.reviews.push(review);
    await room.save();

    const hotel = await Hotel.findOne({ _id: room.hotel });
    if (hotel) {
      // Initialize ratings map if not present
      if (!hotel.ratings) {
        hotel.ratings = new Map();
      }

      // Update hotel's ratings and reviews
      if (hotel.ratings.has(rating.toString())) {
        hotel.ratings.set(rating.toString(), hotel.ratings.get(rating.toString()) + 1);
      } else {
        hotel.ratings.set(rating.toString(), 1);
      }
      hotel.reviews.push(review);
      await hotel.save();
    }

    res.json({ message: 'Room rating and review added successfully' });
  } catch (error) {
    console.error('Error rating and reviewing room:', error);
    res.status(500).json({ message: 'An error occurred while rating and reviewing room' });
  }
});
 */ 
router.post('/ratereview/:reservationId', authMiddleware, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { rating, review } = req.body;
    const user = req.user;

    const reservation = await Reservation.findOne({ _id: reservationId, user: user._id });
    if (!reservation) {
      return res.status(400).json({ message: 'Reservation not found or does not belong to the user' });
    }

    const room = await Room.findOne({ _id: reservation.room });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Update room's ratings and reviews
    if (room.ratings.has(rating.toString())) {
      room.ratings.set(rating.toString(), room.ratings.get(rating.toString()) - 1);
    } else {
      room.ratings.set(rating.toString(), 1);
    }
    room.reviews.push(review);
    await room.save();

    res.json({ message: 'Room rating and review added successfully' });
  } catch (error) {
    console.error('Error rating and reviewing room:', error);
    res.status(500).json({ message: 'An error occurred while rating and reviewing room' });
  }
});


  
module.exports = router;
