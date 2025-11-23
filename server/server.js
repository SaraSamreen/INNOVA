//server.js 
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: './config.env' });

// Create Express + Socket Server
const app = express();
const server = http.createServer(app);
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ===============================
// CREATE SOCKET.IO INSTANCE
// ===============================
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Make io accessible in routes
app.set('io', io);

// CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Debugger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
const mongoURI = process.env.ATLAS_URI || process.env.MONGODB_URI;

console.log("Connecting to MongoDB...", mongoURI ? "OK" : "NO CONNECTION STRING!");

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

  } catch (err) {
    console.error("❌ Mongo error:", err);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Directory Setup
const dirs = ['uploads', 'processed', 'temp',];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

app.use('/uploads', express.static('uploads'));
app.use('/processed', express.static('processed'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/payment', require('./routes/payment'));

// AI Routes
const avatarVideoRoutes = require('./routes/avatarVideoRoutes');
app.use('/api/ai', avatarVideoRoutes);


// Optional routes
if (fs.existsSync('./routes/media.js')) {
  app.use('/api/media', require('./routes/media'));
}
if (fs.existsSync('./routes/aiRoutes.js')) {
  app.use('/api/ai', require('./routes/aiRoutes'));
}
if (fs.existsSync('./routes/video.js')) {
  app.use('/api/video', require('./routes/video'));
}
if (fs.existsSync('./routes/admin')){
  app.use('/api/admin',require('./routes/admin'));
}
if (fs.existsSync('./routes/imageGen.js')) {
  app.use('/api/imageGen', require('./routes/imageGen'));
}
// Test Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TeamCollab API running',
    timestamp: new Date().toISOString(),
    features: {
      chat: true,
      payment: true,
      avatarVideo: true,
  
    }
  });
});

// ===============================
// SOCKET.IO AUTH + HANDLERS
// ===============================
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    console.log('🔐 Socket auth - Token received:', token ? 'Yes' : 'No');

    if (!token || token === 'null' || token === 'undefined') {
      console.warn('⚠️ No valid token provided');
      socket.userId = 'anonymous';
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      socket.userId = decoded.userId || decoded.id || decoded._id;
      socket.userEmail = decoded.email;

      console.log('✅ Socket authenticated - User ID:', socket.userId);
      next();
    } catch (tokenErr) {
      if (tokenErr.name === 'TokenExpiredError') {
        console.warn('⚠️ Token expired');
        const decoded = jwt.decode(token);

        if (decoded && (decoded.userId || decoded.id || decoded._id)) {
          socket.userId = decoded.userId || decoded.id || decoded._id;
          console.log('⚠️ Using expired token - User ID:', socket.userId);
          return next();
        }
      }
      throw tokenErr;
    }
  } catch (err) {
    console.error('❌ Socket auth error:', err.message);
    next(new Error('Authentication error'));
  }
});

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log("🔌 Client connected:", socket.id, "User:", socket.userId);

  socket.on('join', (userId) => {
    socket.join(userId.toString());
    console.log(`👤 User ${userId} joined personal room`);
  });

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`💬 User ${socket.userId} joined conversation: ${conversationId}`);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`👋 User ${socket.userId} left conversation: ${conversationId}`);
  });

  socket.on('typing', ({ conversationId, userName }) => {
    socket.to(conversationId).emit('user-typing', {
      userId: socket.userId,
      userName,
      conversationId
    });
  });

  socket.on('stop-typing', ({ conversationId }) => {
    socket.to(conversationId).emit('user-stopped-typing', {
      userId: socket.userId,
      conversationId
    });
  });

  socket.on('send-message', (data) => {
    const { conversationId, content } = data;
    io.to(conversationId).emit('receive-message', {
      conversationId,
      content,
      sender: socket.userId,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log("❌ Client disconnected:", socket.id);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// Admin Routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Server error",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Server Listen
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("💬 Socket.IO real-time chat ready");
  console.log("📹 TeamCollab API ready");
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log("\n📡 Available AI Services:");
  console.log("   - Avatar Video (HeyGen)");
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = { app, server, io };