const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== MULTER SETUP ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/instagram');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// ==================== MIDDLEWARE ====================
const auth = require('../middleware/auth');
const authMiddleware = require('../authMiddleware');
const activeAuth = auth;

// ==================== MODELS ====================
const InstagramPost = require('../models/InstagramPost');

// ==================== ROUTES ====================

// Generate SEO hashtags endpoint
router.post('/generate-hashtags', activeAuth, async (req, res) => {
  try {
    console.log('✅ Auth passed - User:', req.user?.id);
    console.log('📝 Generating hashtags for caption:', req.body.caption?.substring(0, 50));
    
    const { caption, imageDescription, count } = req.body;

    if (!caption || caption.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Caption is required'
      });
    }

    const { generateSEOHashtags } = require('../services/seoHashtagService');
    const result = await generateSEOHashtags(caption, imageDescription, count || 30);

    return res.json({
      success: true,
      enhancedCaption: result.enhancedCaption,
      hashtags: result.hashtags,
      allHashtags: result.allHashtags,
      usingFallback: result.usingFallback,
      fallbackReason: result.fallbackReason
    });

  } catch (error) {
    console.error('❌ Hashtag generation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hashtags',
      error: error.message
    });
  }
});

// Get hashtag suggestions by keywords
router.post('/hashtag-suggestions', activeAuth, async (req, res) => {
  try {
    const { keywords } = req.body;
    
    if (!keywords) {
      return res.status(400).json({
        success: false,
        message: 'Keywords are required'
      });
    }

    const { getHashtagSuggestions } = require('../services/seoHashtagService');
    const result = await getHashtagSuggestions(keywords);

    return res.json({
      success: true,
      hashtags: result.hashtags,
      usingFallback: result.usingFallback
    });

  } catch (error) {
    console.error('❌ Hashtag suggestion error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get hashtag suggestions',
      error: error.message
    });
  }
});

// Upload and post immediately
router.post('/upload', activeAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('✅ Auth passed - User:', req.user?.id);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }

    const userId = req.user?.id || req.userId;
    const { caption } = req.body;

    console.log('📤 Posting immediately for user:', userId);

    // Create post in database with immediate schedule time
    const newPost = new InstagramPost({
      userId,
      imagePath: req.file.path,
      imageUrl: `/uploads/instagram/${req.file.filename}`,
      caption: caption || '',
      scheduleTime: new Date(), // Post immediately
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
      status: 'scheduled'
    });

    await newPost.save();
    console.log('✅ Post saved to database, scheduler will post it');

    res.json({
      success: true,
      message: 'Post queued for immediate publishing',
      post: newPost
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Schedule post for later
router.post('/schedule', activeAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('✅ Auth passed - User:', req.user?.id);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }

    const userId = req.user?.id || req.userId;
    const { caption, scheduleTime } = req.body;

    if (!scheduleTime) {
      return res.status(400).json({
        success: false,
        message: 'Schedule time is required'
      });
    }

    console.log('📅 Scheduling post for user:', userId);
    console.log('⏰ Schedule time:', scheduleTime);

    // Create post in database
    const newPost = new InstagramPost({
      userId,
      imagePath: req.file.path,
      imageUrl: `/uploads/instagram/${req.file.filename}`,
      caption: caption || '',
      scheduleTime: new Date(scheduleTime),
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
      status: 'scheduled'
    });

    await newPost.save();
    console.log('✅ Post scheduled successfully');

    res.json({
      success: true,
      message: 'Post scheduled successfully',
      post: newPost,
      scheduleTime: newPost.scheduleTime
    });

  } catch (error) {
    console.error('❌ Schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Schedule failed',
      error: error.message
    });
  }
});

// Check token validity
router.get('/check-token', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

// Get scheduled posts
router.get('/scheduled', activeAuth, async (req, res) => {
  try {
    console.log('✅ Auth passed - User:', req.user?.id);
    
    const userId = req.user?.id || req.userId;
    const posts = await InstagramPost.find({ userId }).sort({ scheduleTime: -1 });

    res.json({
      success: true,
      posts
    });

  } catch (error) {
    console.error('❌ Get scheduled error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled posts',
      error: error.message
    });
  }
});

// Delete scheduled post
router.delete('/scheduled/:postId', activeAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await InstagramPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Delete image file if it exists
    if (post.imagePath && fs.existsSync(post.imagePath)) {
      fs.unlinkSync(post.imagePath);
    }

    await InstagramPost.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

module.exports = router;