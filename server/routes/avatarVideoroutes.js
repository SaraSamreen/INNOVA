// avatarVideoRoutes.js - IMPROVED with better timeout handling
const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com';

// ============================================
// ROUTE 1: Generate Marketing Script
// ============================================
router.post('/generate-marketing-script', async (req, res) => {
  try {
    const { productName, features, benefits, targetAudience } = req.body;

    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const prompt = `Create a short marketing script (30-45 seconds when spoken) for:

Product: ${productName}
Features: ${features || 'Not specified'}
Benefits: ${benefits || 'Not specified'}
Target Audience: ${targetAudience || 'General audience'}

Requirements:
- Conversational and engaging
- Start with attention-grabbing hook
- Highlight 2-3 key benefits
- End with call-to-action
- Keep under 100 words
- Direct speech to viewer
- No labels or directions

Script:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const script = completion.choices[0].message.content.trim();
    res.json({ success: true, script, wordCount: script.split(' ').length });
  } catch (error) {
    console.error('Script error:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

// ============================================
// ROUTE 2: Get HeyGen Avatars
// ============================================
router.get('/heygen-avatars', async (req, res) => {
  try {
    console.log('📥 Fetching HeyGen avatars...');
    
    const response = await axios.get(`${HEYGEN_API_URL}/v2/avatars`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Accept': 'application/json',
      },
    });

    console.log('✅ Avatars fetched successfully');
    
    const avatars = response.data?.data?.avatars || [];
    
    const formattedAvatars = avatars
      .filter(a => a.avatar_id && a.preview_image_url)
      .slice(0, 20)
      .map(a => ({
        avatar_id: a.avatar_id,
        avatar_name: a.avatar_name || a.avatar_id,
        preview_image_url: a.preview_image_url,
        gender: a.gender || 'unknown',
      }));

    res.json({ success: true, avatars: formattedAvatars });
  } catch (error) {
    console.error('Avatars error:', error.response?.data || error.message);
    res.json({
      success: true,
      avatars: [
        { avatar_id: 'Angela-inTshirt-20220820', avatar_name: 'Angela', preview_image_url: 'https://files2.heygen.ai/avatar/v3/Angela-inTshirt-20220820/preview.webp', gender: 'female' },
        { avatar_id: 'josh-lite3-20230714', avatar_name: 'Josh', preview_image_url: 'https://files2.heygen.ai/avatar/v3/josh-lite3-20230714/preview.webp', gender: 'male' },
      ],
      fromFallback: true,
    });
  }
});

// ============================================
// ROUTE 3: Get HeyGen Voices
// ============================================
router.get('/heygen-voices', async (req, res) => {
  try {
    console.log('📥 Fetching HeyGen voices...');
    
    const response = await axios.get(`${HEYGEN_API_URL}/v2/voices`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Accept': 'application/json',
      },
    });

    console.log('✅ Voices fetched successfully');
    
    const voices = response.data?.data?.voices || [];
    
    const englishVoices = voices
      .filter(v => v.language === 'English' && v.voice_id)
      .slice(0, 12)
      .map(v => ({
        voice_id: v.voice_id,
        name: v.name || 'Unknown',
        language: v.language,
        gender: v.gender || 'unknown',
      }));

    res.json({ success: true, voices: englishVoices });
  } catch (error) {
    console.error('Voices error:', error.response?.data || error.message);
    res.json({
      success: true,
      voices: [
        { voice_id: '1bd001e7e50f421d891986aad5158bc8', name: 'Sara', language: 'English', gender: 'female' },
        { voice_id: 'eb4badba85fe4eb290bc37aa3ccf6e13', name: 'Paul', language: 'English', gender: 'male' },
      ],
      fromFallback: true,
    });
  }
});

// ============================================
// ROUTE 4: Generate Avatar Video - ASYNC VERSION
// ============================================
router.post('/generate-avatar-video', async (req, res) => {
  try {
    const { script, avatarId, voiceId } = req.body;

    if (!script) {
      return res.status(400).json({ error: 'Script is required' });
    }

    const finalAvatarId = avatarId || 'Angela-inTshirt-20220820';
    const finalVoiceId = voiceId || '1bd001e7e50f421d891986aad5158bc8';

    console.log('📹 Starting HeyGen video generation...');
    console.log('Script:', script.substring(0, 50) + '...');
    console.log('Avatar:', finalAvatarId);
    console.log('Voice:', finalVoiceId);

    // Create video
    const createResponse = await axios.post(
      `${HEYGEN_API_URL}/v2/video/generate`,
      {
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: finalAvatarId,
              avatar_style: 'normal',
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: finalVoiceId,
              speed: 1.0,
            },
            background: {
              type: 'color',
              value: '#FFFFFF',
            },
          },
        ],
        dimension: {
          width: 1280,
          height: 720,
        },
        aspect_ratio: '16:9',
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout for creation
      }
    );

    const videoId = createResponse.data?.data?.video_id;
    
    if (!videoId) {
      console.error('No video_id in response:', createResponse.data);
      throw new Error('No video_id returned from HeyGen');
    }

    console.log('✅ Video creation started. ID:', videoId);

    // Return video ID immediately and let frontend poll
    res.json({ 
      success: true, 
      videoId,
      message: 'Video generation started. Poll /video-status to check progress.'
    });

  } catch (error) {
    console.error('HeyGen error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to generate video';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. HeyGen API may be slow.';
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error.message || error.response.data.error.detail;
    }
    
    res.status(500).json({
      error: errorMessage,
      details: error.response?.data || error.message,
    });
  }
});

// ============================================
// ROUTE 5: Check Video Status - IMPROVED
// ============================================
router.get('/video-status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    console.log(`🔍 Checking status for video: ${videoId}`);

    const response = await axios.get(
      `${HEYGEN_API_URL}/v1/video_status.get`,
      {
        params: { video_id: videoId },
        headers: { 
          'X-Api-Key': HEYGEN_API_KEY,
          'Accept': 'application/json',
        },
        timeout: 10000,
      }
    );

    const data = response.data?.data;
    const status = data?.status;
    
    console.log(`📊 Video ${videoId} status: ${status}`);

    // Handle different statuses
    if (status === 'completed') {
      res.json({
        status: 'completed',
        videoUrl: data.video_url,
        thumbnail: data.thumbnail_url || null,
        duration: data.duration || null,
      });
    } else if (status === 'failed') {
      const errorDetail = data?.error?.detail || data?.error?.message || 'Unknown error';
      res.json({
        status: 'failed',
        error: errorDetail,
      });
    } else {
      // pending, processing, waiting
      res.json({
        status: status || 'processing',
        progress: data?.progress || null,
        message: getStatusMessage(status),
      });
    }

  } catch (error) {
    console.error('Status check error:', error.message);
    
    // If video not found or timeout, return appropriate error
    if (error.response?.status === 404) {
      res.status(404).json({ 
        status: 'not_found',
        error: 'Video not found' 
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(504).json({ 
        status: 'timeout',
        error: 'Status check timed out' 
      });
    } else {
      res.status(500).json({ 
        status: 'error',
        error: 'Failed to check status' 
      });
    }
  }
});

// Helper function for user-friendly status messages
function getStatusMessage(status) {
  const messages = {
    'waiting': 'Video queued, waiting to start...',
    'pending': 'Preparing video generation...',
    'processing': 'Generating your avatar video...',
    'completed': 'Video ready!',
    'failed': 'Video generation failed',
  };
  return messages[status] || 'Processing...';
}

module.exports = router;