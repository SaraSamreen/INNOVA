const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase, uploadFile, getPublicUrl } = require('../../src/supabaseClient');
const User = require('../models/User'); // Adjust path if needed
const Media = require('../models/Media'); // We'll create a Media model

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Keep files in memory to send to Supabase
const upload = multer({ storage });

// Upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId, type } = req.body; // MongoDB user ID and media type
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // 1. Upload file to Supabase
    const path = await uploadFile(req.file, userId);

    // 2. Save metadata to MongoDB
    const media = await Media.create({
      user_id: userId,
      type,
      filename: req.file.originalname,
      supabase_path: path,
      uploaded_at: new Date(),
    });

    // 3. Return file info + public URL
    const publicUrl = getPublicUrl(path);
    res.json({ media, publicUrl });
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
      publicUrl: getPublicUrl(m.supabase_path),
    }));
    res.json(mediaWithUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch media', error: err.message });
  }
});

module.exports = router;
