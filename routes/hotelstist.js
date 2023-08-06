// routes/hotels.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');
const Hotel = require('../models/hotel');
const Room = require('../models/room');

// Create Hotel and Rooms (Admin)
router.post('/register', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { hotelName, rooms , country , photos , city } = req.body;

    const existingHotel = await Hotel.findOne({ createdBy: req.user._id });

    if (existingHotel) {
      return res.status(400).json({ message: 'You can create only one hotel' });
    }

    const hotel = new Hotel({ name: hotelName, createdBy: req.user._id , country: country, city: city});
    await hotel.save();

    const createdRooms = await Room.insertMany(rooms.map(room => ({
      name: room.name,
      type: room.type,
      available: true,
      hotel: hotel._id
    })));

    for (const room of createdRooms) {
      hotel.rooms.push(room._id);
    }

    await hotel.save();

    res.json({ message: 'Hotel and rooms created successfully', hotel });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update Hotel Name (Admin)
router.put('/my-hotel/settings', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { name } = req.body;

    const hotel = await Hotel.findOne({ createdBy: req.user._id });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found or not authorized' });
    }

    hotel.name = name;
    await hotel.save();

    res.json({ message: 'Hotel updated successfully', hotel });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add Rooms to Hotel (Admin)
router.put('/my-hotel/addroom', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { rooms } = req.body;

    const hotel = await Hotel.findOne({ createdBy: req.user._id });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found or not authorized' });
    }

    const createdRooms = await Room.insertMany(rooms.map(room => ({
      name: room.name,
      type: room.type,
      available: true,
      hotel: hotel._id
    })));

    for (const room of createdRooms) {
      hotel.rooms.push(room._id);
    }

    await hotel.save();

    res.json({ message: 'Rooms added to the hotel successfully', hotel });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// View Specific Room Information
router.get('/my-hotel/room/:roomId', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { roomId } = req.params;

    const room = await Room.findOne({ _id: roomId })
      .populate('hotel', 'name createdBy'); // Populate hotel with selected fields

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Update Room Info
router.put('/my-hotel/room/:roomId', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { roomId } = req.params;
    const { name, type } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const hotel = await Hotel.findOne({ rooms: roomId });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel for this room not found' });
    }

    // Check if the new room name is already taken within the same hotel
    const existingRoomWithSameName = await Room.findOne({
      _id: { $ne: roomId }, // Exclude the current room
      hotel: hotel._id,     // Same hotel
      name: name            // Same room name
    });
    
    if (existingRoomWithSameName) {
      return res.status(409).json({ message: 'A room with the same name already exists in this hotel' });
    }

    // Update room information
    room.name = name;
    room.type = type;
    await room.save();

    res.json({ message: 'Room information updated successfully' });
  } catch (error) {
    console.error('Error updating room information:', error);
    res.status(500).json({ message: 'An error occurred while updating room information' });
  }
});


// Delete Specific Room
router.delete('/my-hotel/room/:roomId', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const hotel = await Hotel.findOne({ rooms: roomId });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel for this room not found' });
    }
    //Update room info
    
    // Remove room from hotel's rooms array
    hotel.rooms.pull(roomId);
    await hotel.save();
    
    // Remove the room
    //await room.remove();

    //res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'An error occurred while deleting the room' });
  }
});


// View Own Hotel and Rooms (Admin)
router.get('/my-hotel', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const hotel = await Hotel.findOne({ createdBy: req.user._id })
      .populate('rooms', 'name type');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({ hotel });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete Hotel (Admin)
router.delete('/my-hotel/settings', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const hotel = await Hotel.findOne({ createdBy: req.user._id });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found or not authorized' });
    }

    await hotel.remove();

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
