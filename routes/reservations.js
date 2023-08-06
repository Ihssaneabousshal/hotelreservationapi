const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');
const Hotel = require('../models/hotel');
const HotelChain = require('../models/hotelChainSchema'); // Add the HotelChain model
const Room = require('../models/room');
const Reservation = require("../models/reservation")
const mongoose = require('mongoose');


// Rate and review a hotel and room after a reservation
// Get all hotels with ratings, reviews, and rating counts
/* router.get('/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.aggregate([
      {
        $lookup: {
          from: 'rooms',
          localField: 'rooms',
          foreignField: '_id',
          as: 'roomDetails'
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          chain: 1,
          city: 1,
          country: 1,
          roomCount: { $size: '$rooms' },
          rating: { $avg: '$roomDetails.rating' },
          reviews: '$roomDetails.reviews',
          ratingCounts: {
            5: { $sum: { $cond: [{ $eq: ['$roomDetails.rating', 5] }, 1, 0] } },
            4: { $sum: { $cond: [{ $eq: ['$roomDetails.rating', 4] }, 1, 0] } },
            3: { $sum: { $cond: [{ $eq: ['$roomDetails.rating', 3] }, 1, 0] } },
            2: { $sum: { $cond: [{ $eq: ['$roomDetails.rating', 2] }, 1, 0] } },
            1: { $sum: { $cond: [{ $eq: ['$roomDetails.rating', 1] }, 1, 0] } }
          }
        }
      }
    ]);

    res.json({ hotels });
  } catch (error) {
    console.error('Error getting hotels with ratings and reviews:', error);
    res.status(500).json({ message: 'An error occurred while getting hotels with ratings and reviews' });
  }
});
 */
router.get('/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.aggregate([
      {
        $lookup: {
          from: 'rooms',
          localField: 'rooms',
          foreignField: '_id',
          as: 'roomDetails'
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          chain: 1,
          city: 1,
          country: 1,
          roomCount: { $size: '$rooms' },
          reviews: '$roomDetails.reviews',
          averageRating: {
            $avg: {
              $toDouble: {
                $reduce: {
                  input: '$roomDetails.ratings',
                  initialValue: 0,
                  in: {
                    $add: ['$$value', { $convert: { input: '$$this', to: 'double', onError: 0 } }]
                  }
                }
              }
            }
          }
        }
      }
    ]);

    res.json({ hotels });
  } catch (error) {
    console.error('Error getting hotels with ratings and reviews:', error);
    res.status(500).json({ message: 'An error occurred while getting hotels with ratings and reviews' });
  }
});

// Get rooms within a specific hotel with ratings, reviews, and rating counts
router.get('/hotel/:hotelId/rooms', async (req, res) => {
 try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findOne({ _id: hotelId });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const rooms = await Room.aggregate([
      {
        $lookup: {
          from: 'hotels',
          localField: 'hotel',
          foreignField: '_id',
          as: 'hotelInfo'
        }
      },
      {
        $unwind: '$hotelInfo'
      },
      {
        $match: { 'hotelInfo._id': hotel._id }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          available: 1,
          hotel: '$hotelInfo.name',
          city: '$hotelInfo.city',
          country: '$hotelInfo.country',
          ratings: 1,
          reviews: 1
        }
      }
    ]);

    res.json({ hotel, rooms });
  } catch (error) {
    console.error('Error getting rooms within hotel with ratings and reviews:', error);
    res.status(500).json({ message: 'An error occurred while getting rooms within hotel with ratings and reviews' });
  }
}); 

// Get specific room information with ratings, reviews, and rating counts
/* router.get('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ _id: roomId }).populate('hotel', 'name city country');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const roomWithRatings = await Room.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(roomId) } },
      {
        $lookup: {
          from: 'hotels',
          localField: 'hotel',
          foreignField: '_id',
          as: 'hotelInfo'
        }
      },
      {
        $unwind: '$hotelInfo'
      },
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          available: 1,
          hotel: '$hotelInfo.name',
          city: '$hotelInfo.city',
          country: '$hotelInfo.country',
          rating: 1,
          reviews: 1,
          ratingCounts: {
            5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
          }
        }
      }
    ]);

    res.json({ room: roomWithRatings[0] });
  } catch (error) {
    console.error('Error getting room with ratings and reviews:', error);
    res.status(500).json({ message: 'An error occurred while getting room with ratings and reviews' });
  }
});
 */

router.get('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ _id: roomId }).populate('hotel', 'name city country');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const roomWithRatings = await Room.aggregate([
      { $match: { _id: room._id } },
      {
        $lookup: {
          from: 'hotels',
          localField: 'hotel',
          foreignField: '_id',
          as: 'hotelInfo'
        }
      },
      {
        $unwind: '$hotelInfo'
      },
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          available: 1,
          hotel: '$hotelInfo.name',
          city: '$hotelInfo.city',
          country: '$hotelInfo.country',
          ratings: 1,
          reviews: 1,
          ratingCounts: 1
        }
      }
    ]);

    res.json({ room: roomWithRatings[0] });
  } catch (error) {
    console.error('Error getting room with ratings and reviews:', error);
    res.status(500).json({ message: 'An error occurred while getting room with ratings and reviews' });
  }
});

// Reserve a specific room
router.post('/reserve/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = req.user;

    const room = await Room.findOne({ _id: roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.available) {
      return res.status(400).json({ message: 'Room is not available for reservation' });
    }

    const hotel = await Hotel.findOne({ _id: room.hotel });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found for the room' });
    }

    const reservation = new Reservation({
      user: user._id,
      room: room._id,
      hotelName: hotel.name,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });
    await reservation.save();

    // Mark the room as unavailable after reservation
    room.available = false;
    await room.save();

    res.json({ message: 'Room reserved successfully', reservation });
  } catch (error) {
    console.error('Error reserving room:', error);
    res.status(500).json({ message: 'An error occurred while reserving room' });
  }
});

// Search for hotels based on criteria
router.get('/search', async (req, res) => {
  try {
    const { chain, city, country, roomType, hotelName } = req.query;

    let query = {};

    if (chain) {
      query.chain = chain;
    }

    if (city) {
      query.city = city;
    }

    if (country) {
      query.country = country;
    }

    if (roomType) {
      query['rooms.type'] = roomType;
    }

    if (hotelName) {
      query.name = hotelName;
    }

    const hotels = await Hotel.find(query, '-_id name chain city country photos').populate('rooms', 'name type available');

    res.json({ hotels });
  } catch (error) {
    console.error('Error searching for hotels:', error);
    res.status(500).json({ message: 'An error occurred while searching for hotels' });
  }
});


module.exports = router;
