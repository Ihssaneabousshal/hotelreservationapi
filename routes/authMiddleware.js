// routes/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const extractedToken = token.split(' ')[1];
    console.log('Extracted token:', extractedToken);

    const decodedToken = jwt.verify(extractedToken, 'secret_key');
    console.log('Decoded token:', decodedToken);

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};


module.exports = authMiddleware;

