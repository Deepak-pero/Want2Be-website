
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import dreamRoutes from './routes/dreamRoutes.js';
import dreamAnalysisRoutes from './routes/dreamAnalysisRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import storyRoutes from './routes/storyRoutes.js';

dotenv.config();

const app = express();
const server = createServer(app);

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  'https://want2be.in',
  'https://www.want2be.in',
  'https://want2be-website.dt.r.appspot.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without Origin
    // (curl, Postman, server-to-server requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user personal room
  socket.on('join-user', (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined room user-${userId}`);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Socket error
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Make Socket.io available to routes
app.set('io', io);

// =====================================================
// BODY PARSERS
// =====================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================================================
// ROUTES
// =====================================================

app.use('/api/auth', authRoutes);
app.use('/api/dreams', dreamRoutes);
app.use('/api/analyze', dreamAnalysisRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stories', storyRoutes);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// DATABASE CONNECTION
// =====================================================

mongoose
  .connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/dream-app'
  )
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.io server ready for real-time notifications');
  console.log('Allowed CORS origins:');
  allowedOrigins.forEach((origin) => {
    console.log(`- ${origin}`);
  });
});

console.log("🔗 MongoDB URI:", process.env.MONGODB_URI);

export default app;

