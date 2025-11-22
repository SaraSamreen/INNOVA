// routes/imageGen.js - Using Pollinations AI (Free, No API Key Required!)
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Generate AI background image
router.post('/generate-background', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const prompt = encodeURIComponent(
      `Professional abstract background for ${description}, minimalist, high quality, clean design, modern aesthetic, 4k`
    );

    console.log('Generating image for:', description);

    // Using Pollinations AI - FREE and no API key needed!
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&enhance=true`;

    console.log('Fetching image from Pollinations AI...');

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.buffer();
    
    // Convert to base64 to send to frontend
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    console.log('✅ Image generated successfully');

    res.json({ 
      success: true, 
      imageUrl: dataUrl 
    });

  } catch (error) {
    console.error('❌ Image generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate image', 
      error: error.message 
    });
  }
});

module.exports = router;