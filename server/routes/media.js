const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storageBucket } = require('../firebaseAdmin');
const User = require('../models/User'); 
const Media = require('../models/Media'); 

// Configure multer for file uploads
const multerStorage = multer.memoryStorage(); // Keep files in memory to send to Firebase
const upload = multer({ storage: multerStorage });

// Upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId, type } = req.body; // MongoDB user ID and media type
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // 1. Upload file to Firebase Storage
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const blob = storageBucket.file(`uploads/${userId}/${fileName}`);
    
    const stream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
    });

    // Handle stream events
    stream.on('error', (err) => {
      console.error('Firebase upload error:', err);
      res.status(500).json({ message: 'Upload failed', error: err.message });
    });

    stream.on('finish', async () => {
      try {
        // Make the file public
        await blob.makePublic();
        
        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${storageBucket.name}/${blob.name}`;

        // 2. Save metadata to MongoDB
        const media = await Media.create({
          user_id: userId,
          type,
          filename: req.file.originalname,
          firebase_url: publicUrl,
          uploaded_at: new Date(),
        });

        // 3. Return file info + public URL
        res.json({ media, publicUrl });
      } catch (err) {
        console.error('Database save error:', err);
        res.status(500).json({ message: 'Failed to save media metadata', error: err.message });
      }
    });

    // Write the file buffer to the stream
    stream.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Get all media for a user
router.get('/:userId', async (req, res) => {
  try {
    const mediaList = await Media.find({ user_id: req.params.userId });
    const mediaWithUrls = mediaList.map(m => ({
      ...m.toObject(),
      publicUrl: m.firebase_url, // Firebase URL is already public
    }));
    res.json(mediaWithUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch media', error: err.message });
  }
});

module.exports = router;
