const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAdminNewTutorApplicationEmail
} = require('../services/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Setup Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const role = req.query.state || 'learner';
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        role: role,
        tutorStatus: role === 'tutor' ? 'pending' : undefined,
        isEmailVerified: true,
        googleId: profile.id,
        avatar: profile.photos[0]?.value
      });
      // Welcome email
      try { await sendWelcomeEmail(user.email, user.name, role); } catch(e) { console.log('Email error:', e.message); }
      // Notify admin if new tutor applied
      if (role === 'tutor') {
        try { await sendAdminNewTutorApplicationEmail(process.env.GMAIL_USER, user.name, user.email); } catch(e) { console.log('Email error:', e.message); }
      }
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed,
      role: role || 'learner',
      tutorStatus: role === 'tutor' ? 'pending' : undefined,
      isEmailVerified: true
    });
    // Welcome email
    try { await sendWelcomeEmail(email, name, role); } catch(e) { console.log('Email error:', e.message); }
    // Notify admin if new tutor applied
    if (role === 'tutor') {
      try { await sendAdminNewTutorApplicationEmail(process.env.GMAIL_USER, name, email); } catch(e) { console.log('Email error:', e.message); }
    }
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, xp: user.xp, level: user.level,
      badges: user.badges, tutorStatus: user.tutorStatus,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, xp: user.xp, level: user.level,
      badges: user.badges, tutorStatus: user.tutorStatus,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Google OAuth - pass role as state param
router.get('/google', (req, res, next) => {
  const role = req.query.role || 'learner';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const userData = encodeURIComponent(JSON.stringify({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      xp: req.user.xp,
      level: req.user.level,
      badges: req.user.badges,
      tutorStatus: req.user.tutorStatus
    }));
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${userData}`);
  }
);

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account with that email' });
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET + user.password, { expiresIn: '1h' });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${resetToken}`;
    await sendPasswordResetEmail(email, user.name, resetUrl);
    res.json({ message: 'Password reset email sent!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset Password
router.post('/reset-password/:id/:token', async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    jwt.verify(token, process.env.JWT_SECRET + user.password);
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: 'Password reset successful!' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired reset link' });
  }
});

// Get profile
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;