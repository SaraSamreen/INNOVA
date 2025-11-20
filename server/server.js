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

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Store io instance in app for use in routes
app.set('io', io);

// CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const dirs = ['uploads', 'processed', 'temp'];
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
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));

// If you have other routes
if (fs.existsSync('./routes/media.js')) {
  app.use('/api/media', require('./routes/media'));
}
if (fs.existsSync('./routes/aiRoutes.js')) {
  app.use('/api/ai', require('./routes/aiRoutes'));
}
if (fs.existsSync('./routes/video.js')) {
  app.use('/api/video', require('./routes/video'));
}

// Test Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TeamCollab API running',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO Authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    
    next();
  } catch (err) {
    console.error('Socket auth error:', err);
    next(new Error('Authentication error'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log("🔌 New client connected:", socket.id, "User:", socket.userId);

  // Join team room
  socket.on('join-team', (teamId) => {
    socket.join(teamId);
    console.log(`👥 User ${socket.userId} joined team room: ${teamId}`);
    
    // Notify others in the team
    socket.to(teamId).emit('user-joined', {
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  // Leave team room
  socket.on('leave-team', (teamId) => {
    socket.leave(teamId);
    console.log(`👋 User ${socket.userId} left team room: ${teamId}`);
  });

  // Typing indicators
  socket.on('typing-start', ({ teamId, userName }) => {
    socket.to(teamId).emit('user-typing', { 
      userId: socket.userId,
      userName,
      teamId 
    });
  });

  socket.on('typing-stop', ({ teamId }) => {
    socket.to(teamId).emit('user-stopped-typing', { 
      userId: socket.userId,
      teamId 
    });
  });

  // Handle direct message sending (optional - if not using REST API)
  socket.on('send-message', async (data) => {
    try {
      const { teamId, content, type = 'text' } = data;
      
      // Broadcast to team room
      io.to(teamId).emit('receive-message', {
        teamId,
        content,
        type,
        sender: socket.userId,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Socket message error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log("❌ Client disconnected:", socket.id);
  });

  // Error handler
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    message: "Server error", 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);


// ---------------------- SERVER ---------------------- //

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