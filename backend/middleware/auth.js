const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ message: 'User no longer exists' });
      if (user.isSuspended) return res.status(403).json({ message: 'Account suspended' });
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access only' });
};

const tutorOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'tutor' || req.user.role === 'admin')) return next();
  return res.status(403).json({ message: 'Tutor access only' });
};

module.exports = { protect, adminOnly, tutorOnly };