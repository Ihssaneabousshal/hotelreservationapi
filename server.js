const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels');
const ExperienceRoutes = require('./routes/experience');
const userRoutes = require('./routes/users'); // Fix this line
const reservationRoutes = require('./routes/reservations');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27018/hotel_reservation', {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', userRoutes);
app.use('/api', reservationRoutes);
app.use('/api/myspace', hotelRoutes);
app.use('/api/myspace', ExperienceRoutes);

// Create a default admin user if not exists
User.findOne({ isAdmin: true }).then(user => {
  if (!user) {
    const adminUser = new User({
      username: 'admin',
      password: 'adminpassword', // You should hash this password
      isAdmin: true
    });
    adminUser.save();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
