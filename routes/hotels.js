const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');
const Hotel = require('../models/hotel');
const HotelChain = require('../models/hotelChainSchema'); // Add the HotelChain model
const Room = require('../models/room');

const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Permission denied. Admin access required.' });
  }
  next();
};

// Create a new hotel chain and hotels with rooms
router.post('/create-hotel-chain', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { chainName, hotels } = req.body;
    const user = req.user;

    // Check if the admin already has a chain
    const existingChain = await HotelChain.findOne({ admin: user._id });
    if (existingChain) {
      return res.status(400).json({ message: 'Admin already has a hotel chain' });
    }

    // Create a new hotel chain associated with the admin
    const hotelChain = new HotelChain({
      name: chainName,
      admin: user._id,
      hotels: []
    });
    await hotelChain.save();

    const createdHotels = [];

    // Create hotels associated with the hotel chain
    for (const hotelData of hotels) {
      const hotel = new Hotel({
        name: hotelData.name,
        chain: hotelChain._id,
        city: hotelData.city,
        country: hotelData.country,
        photos: hotelData.photos,
        createdBy: user._id,
        rooms: []
      });
      await hotel.save();

      // Associate the hotel with the hotel chain
      hotelChain.hotels.push(hotel._id);
      createdHotels.push(hotel);

      // Create rooms for the hotel and associate them
      for (const roomData of hotelData.rooms) {
        const room = new Room({
          name: roomData.name,
          type: roomData.type,
          available: roomData.available,
          hotel: hotel._id
        });
        await room.save();
        hotel.rooms.push(room._id);
      }

      await hotel.save();
    }

    await hotelChain.save();

    res.json({ message: 'Hotel chain and hotels created successfully', hotels: createdHotels });
  } catch (error) {
    console.error('Error creating hotel chain and hotels:', error);
    res.status(500).json({ message: 'An error occurred while creating hotel chain and hotels' });
  }
});

// Add new hotels and rooms to the admin's hotel chain
router.post('/add-hotels-to-chain', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Check if the admin already has a chain
    const chain = await HotelChain.findOne({ admin: user._id });
    if (!chain) {
      return res.status(404).json({ message: 'Admin does not have a hotel chain' });
    }

    const { hotels } = req.body;

    const addedHotels = [];
    const skippedHotels = [];

    // Add hotels to the chain
    for (const hotelData of hotels) {
      // Check if a hotel with the same name already exists
      const existingHotel = await Hotel.findOne({ name: hotelData.name, chain: chain._id });
      if (existingHotel) {
        skippedHotels.push(hotelData.name);
        continue;
      }

      const hotel = new Hotel({
        name: hotelData.name,
        chain: chain._id,
        city: hotelData.city,
        country: hotelData.country,
        photos: hotelData.photos,
        createdBy: user._id,
        rooms: []
      });
      await hotel.save();

      // Associate the hotel with the chain
      chain.hotels.push(hotel._id);

      // Create rooms for the hotel and associate them
      for (const roomData of hotelData.rooms) {
        const room = new Room({
          name: roomData.name,
          type: roomData.type,
          available: roomData.available,
          hotel: hotel._id
        });
        await room.save();
        hotel.rooms.push(room._id);
      }

      await hotel.save();
      addedHotels.push(hotel);
    }

    await chain.save();

    const response = {
      message: 'Hotels added to chain successfully',
      addedHotels,
      skippedHotels
    };

    res.json(response);
  } catch (error) {
    console.error('Error adding hotels to chain:', error);
    res.status(500).json({ message: 'An error occurred while adding hotels to chain' });
  }
});

// Update hotel information
router.put('/my-hotels/:hotelId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { name, city, country, photos } = req.body;
    const user = req.user;

    const hotel = await Hotel.findOne({ _id: hotelId, createdBy: user._id });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found or permission denied' });
    }

    hotel.name = name || hotel.name;
    hotel.city = city || hotel.city;
    hotel.country = country || hotel.country;
    hotel.photos = photos || hotel.photos;

    await hotel.save();

    res.json({ message: 'Hotel updated successfully', hotel });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ message: 'An error occurred while updating hotel' });
  }
});

// Get a list of hotels with the number of rooms they contain
router.get('/hotels-with-room-count', async (req, res) => {
  try {
    const hotels = await Hotel.aggregate([
      {
        $project: {
          name: 1,
          city: 1,
          country: 1,
          roomCount: { $size: '$rooms' }
        }
      }
    ]);

    res.json({ hotels });
  } catch (error) {
    console.error('Error getting hotels with room count:', error);
    res.status(500).json({ message: 'An error occurred while getting hotels with room count' });
  }
});

// Delete a hotel
router.delete('/my-hotels/:hotelId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const user = req.user;

    const hotel = await Hotel.findOne({ _id: hotelId, createdBy: user._id });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found or permission denied' });
    }

    // Delete all rooms associated with the hotel
    await Room.deleteMany({ hotel: hotel._id });

    // Delete the hotel
    await Hotel.deleteOne({ _id: hotelId });

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ message: 'An error occurred while deleting hotel' });
  }
});

// View list of admin's hotels and rooms
router.get('/my-hotels', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = req.user;

    const hotels = await Hotel.find({ createdBy: user._id }).populate('rooms');
    res.json({ hotels });
  } catch (error) {
    console.error('Error fetching admin hotels:', error);
    res.status(500).json({ message: 'An error occurred while fetching admin hotels' });
  }
});

// Add new room to an existing hotel
router.post('/add-room/:hotelId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { name, type, available } = req.body;
    const user = req.user;

    const hotel = await Hotel.findOne({ _id: hotelId, createdBy: user._id });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found or permission denied' });
    }

    const room = new Room({
      name,
      type,
      available,
      hotel: hotel._id
    });
    await room.save();

    hotel.rooms.push(room._id);
    await hotel.save();

    res.json({ message: 'Room added to hotel successfully', room });
  } catch (error) {
    console.error('Error adding room to hotel:', error);
    res.status(500).json({ message: 'An error occurred while adding room to hotel' });
  }
});

// Update room information
router.put('/my-hotels/:hotelId/rooms/:roomId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { hotelId, roomId } = req.params;
    const { name, type, available, photos } = req.body;
    const user = req.user;

    const hotel = await Hotel.findOne({ _id: hotelId, createdBy: user._id });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found or permission denied' });
    }

    const room = await Room.findOne({ _id: roomId, hotel: hotel._id });
    if (!room) {
      return res.status(404).json({ message: 'Room not found in this hotel' });
    }

    room.name = name || room.name;
    room.type = type || room.type;
    room.available = available;
    room.photos = photos || room.photos;

    await room.save();

    res.json({ message: 'Room updated successfully', room });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'An error occurred while updating room' });
  }
});

// Get the list of rooms within a specific hotel
router.get('/hotel/:hotelId/rooms', async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findOne({ _id: hotelId });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotel: hotel._id });

    res.json({ hotel, rooms });
  } catch (error) {
    console.error('Error getting rooms within hotel:', error);
    res.status(500).json({ message: 'An error occurred while getting rooms within hotel' });
  }
});

// Delete a room
router.delete('/my-hotels/:hotelId/rooms/:roomId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { hotelId, roomId } = req.params;
    const user = req.user;

    const hotel = await Hotel.findOne({ _id: hotelId, createdBy: user._id });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found or permission denied' });
    }

    const room = await Room.findOne({ _id: roomId, hotel: hotel._id });
    if (!room) {
      return res.status(404).json({ message: 'Room not found in this hotel' });
    }

    await Room.deleteOne({ _id: roomId }); // Use deleteOne to delete the room

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'An error occurred while deleting room' });
  }
});


module.exports = router;
