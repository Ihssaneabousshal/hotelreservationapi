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

/* mongoose.connect('mongodb://localhost:27017/hotel_reservation', {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
}); */
setTimeout(async function() {
  try {
    await mongoose.connect("mongodb://db:27017/hotel_reservation", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected ;)');

  } catch (error) {
    console.log('Error connecting - retrying in 30 seconds');
  }
}, 30000);

app.use('/api/auth', authRoutes);
app.use('/api/auth', userRoutes);
app.use('/api', reservationRoutes);
app.use('/api/myspace', hotelRoutes);
app.use('/api/myspace', ExperienceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
