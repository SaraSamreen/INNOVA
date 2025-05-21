const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: './config.env' });

// Create Express app
const app = express();

// Enhanced CORS options for frontend communication
const corsOptions = {
  origin: 'http://localhost:3000', // Your React app URL
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Debugging middleware for requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Configure MongoDB connection
const mongoURI = process.env.ATLAS_URI;
console.log('Connecting to MongoDB...', mongoURI ? 'Connection string found' : 'No connection string!');

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    
    // List all collections in the database for debugging
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});