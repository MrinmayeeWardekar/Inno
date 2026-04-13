require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const passport = require('passport');

// Routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const progressRoutes = require('./routes/progress');
const quizRoutes = require('./routes/quiz');
const liveRoutes = require('./routes/live');
const chatRoutes = require('./routes/chat');
const recommendRoutes = require('./routes/recommendations');
const reviewRoutes = require('./routes/reviews');
const paymentRoutes = require('./routes/payment');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/recommendations', recommendRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

// Socket events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, userId, userName }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { userId, userName, socketId: socket.id });
  });

  socket.on('offer', ({ offer, to }) => {
    socket.to(to).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ answer, to }) => {
    socket.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    socket.to(to).emit('ice-candidate', { candidate, from: socket.id });
  });

  socket.on('chat-message', ({ roomId, message, userName }) => {
    io.to(roomId).emit('chat-message', {
      message,
      userName,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('tutor-mute-all', ({ roomId }) => {
    socket.to(roomId).emit('force-mute');
  });

  socket.on('leave-room', ({ roomId, userName }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', { userName, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available in routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5001;

const LiveSession = require('./models/LiveSession');
mongoose.connection.once('open', async () => {
  await LiveSession.updateMany({ status: 'live' }, { status: 'ended' });
  console.log('✅ Cleared stuck live sessions');
});
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});