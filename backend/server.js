// server.js - UPDATED WITH WORKING BACKGROUND REMOVAL
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');

const app = express();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// FREE Background Removal - Using ClipDrop API (Free tier: 100 calls/month)
// Sign up at https://clipdrop.co/apis/pricing (free tier available)
async function removeBackgroundClipDrop(imageBuffer) {
  if (!process.env.CLIPDROP_API_KEY) {
    throw new Error('ClipDrop API key not found');
  }

  try {
    console.log('📸 Removing background with ClipDrop...');
    const formData = new FormData();
    formData.append('image_file', imageBuffer, { filename: 'image.png' });

    const response = await axios.post(
      'https://clipdrop-api.co/remove-background/v1',
      formData,
      {
        headers: {
          'x-api-key': process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );

    console.log('✅ Background removed successfully');
    return Buffer.from(response.data);
  } catch (error) {
    console.error('❌ ClipDrop failed:', error.message);
    throw error;
  }
}

// Alternative: Simple background removal using Sharp (works for white/solid backgrounds)
async function removeBackgroundSimple(imageBuffer) {
  try {
    console.log('📸 Removing background (simple method for solid backgrounds)...');
    
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Convert to raw pixels
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Create new buffer for output
    const output = Buffer.from(data);
    
    // Simple algorithm: make white/light pixels transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is close to white, make it transparent
      const brightness = (r + g + b) / 3;
      if (brightness > 240) {
        output[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }
    
    // Convert back to PNG
    const result = await sharp(output, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toBuffer();
    
    console.log('✅ Background removed (simple method)');
    return result;
  } catch (error) {
    console.error('❌ Simple background removal failed:', error.message);
    throw error;
  }
}

// Main background removal with fallback
async function removeBackground(imageBuffer) {
  // Try ClipDrop if API key is available
  if (process.env.CLIPDROP_API_KEY) {
    try {
      return await removeBackgroundClipDrop(imageBuffer);
    } catch (error) {
      console.log('⚠️  ClipDrop failed, using simple method...');
    }
  }
  
  // Fallback to simple method (works for products on white/solid backgrounds)
  return await removeBackgroundSimple(imageBuffer);
}

// FREE Background Generation using Pollinations.ai
async function generateBackground(prompt, creativity, quality) {
  try {
    console.log('🎨 Generating creative background...');
    
    const enhancedPrompt = `${prompt}, vibrant colors, colorful abstract background, professional product photography, 8k quality, high detail, studio lighting, creative composition`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seed = Date.now();
    
    // Using Pollinations.ai - completely free, no API key
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;
    
    console.log('🌐 Fetching from Pollinations.ai...');
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000
    });
    
    console.log('✅ Background generated successfully');
    return Buffer.from(response.data);
  } catch (error) {
    console.error('❌ Background generation failed:', error.message);
    throw new Error('Background generation failed. Please try again.');
  }
}

// Composite product onto new background
async function compositeImages(backgroundBuffer, productNoBgBuffer) {
  try {
    console.log('🖼️  Compositing images...');
    
    // Get metadata to preserve aspect ratio
    const bgMetadata = await sharp(backgroundBuffer).metadata();
    const productMetadata = await sharp(productNoBgBuffer).metadata();
    
    // Resize background to 1024x1024
    const background = await sharp(backgroundBuffer)
      .resize(1024, 1024, { fit: 'cover' })
      .toBuffer();
    
    // Resize product proportionally to fit within 1024x1024
    // Keep product centered and maintain transparency
    const maxSize = 900; // Leave some padding
    const productWidth = productMetadata.width;
    const productHeight = productMetadata.height;
    const scale = Math.min(maxSize / productWidth, maxSize / productHeight);
    
    const resizedProduct = await sharp(productNoBgBuffer)
      .resize({
        width: Math.round(productWidth * scale),
        height: Math.round(productHeight * scale),
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();
    
    // Get dimensions of resized product for centering
    const resizedMeta = await sharp(resizedProduct).metadata();
    const left = Math.round((1024 - resizedMeta.width) / 2);
    const top = Math.round((1024 - resizedMeta.height) / 2);
    
    // Composite product onto background
    const result = await sharp(background)
      .composite([{
        input: resizedProduct,
        left: left,
        top: top,
        blend: 'over'
      }])
      .png({ quality: 100 })
      .toBuffer();
    
    console.log('✅ Images composited successfully');
    return result;
  } catch (error) {
    console.error('❌ Composite failed:', error.message);
    throw new Error('Image composition failed. Please try again.');
  }
}

// Main generation endpoint
app.post('/api/generate', upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { prompt, creativity = 50, quality = 80 } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image uploaded' 
      });
    }
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'No prompt provided' 
      });
    }
    
    const imageBuffer = req.file.buffer;
    console.log('\n🚀 Starting generation process...');
    console.log(`📝 Prompt: "${prompt}"`);
    console.log(`🎨 Creativity: ${creativity}%, Quality: ${quality}%`);
    
    // Step 1: Remove background from product
    const noBgImage = await removeBackground(imageBuffer);
    
    // Step 2: Generate creative background
    const backgroundImage = await generateBackground(prompt, creativity, quality);
    
    // Step 3: Composite product onto new background
    const finalImage = await compositeImages(backgroundImage, noBgImage);
    
    // Convert to base64
    const base64Image = finalImage.toString('base64');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✨ Generation completed in ${duration}s\n`);
    
    res.json({ 
      success: true,
      image: `data:image/png;base64,${base64Image}`,
      duration: duration
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Generation failed. Please try again.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   ProductAI Studio Backend Server     ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
});