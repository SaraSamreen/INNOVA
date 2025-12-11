// routes/imageGen.js - Pollinations AI + Background Removal
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const multer = require('multer');
const sharp = require('sharp');
const FormData = require('form-data');

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Background removal using ClipDrop (if API key available) or simple method
async function removeBackground(imageBuffer) {
  // Try ClipDrop if API key exists
  if (process.env.CLIPDROP_API_KEY) {
    try {
      console.log('📸 Removing background with ClipDrop...');
      const formData = new FormData();
      formData.append('image_file', imageBuffer, { filename: 'image.png' });

      const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!response.ok) throw new Error('ClipDrop failed');

      const buffer = await response.buffer();
      console.log('✅ Background removed with ClipDrop');
      return buffer;
    } catch (error) {
      console.log('⚠️  ClipDrop failed, using simple method...');
    }
  }

  // Simple background removal for white/light backgrounds
  try {
    console.log('📸 Removing background (simple method)...');
    
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const output = Buffer.from(data);
    
    // Remove white/light pixels
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      
      if (brightness > 240) {
        output[i + 3] = 0; // Make transparent
      }
    }
    
    const result = await sharp(output, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    }).png().toBuffer();
    
    console.log('✅ Background removed');
    return result;
  } catch (error) {
    console.error('❌ Background removal failed:', error);
    throw error;
  }
}

// Generate AI background using Pollinations AI with retries
async function generateBackground(description, creativity = 50, retries = 3) {
  const creativityBoost = creativity > 70 ? 
    ', highly creative, artistic, unique style, bold colors, dramatic composition' : 
    creativity > 40 ? 
    ', professional photography, balanced composition, vibrant colors' : 
    ', clean, minimal, simple, subtle colors';

  const fullPrompt = `${description}${creativityBoost}, product photography background, 8k quality, high detail, studio lighting, no text, no watermark`;
  const prompt = encodeURIComponent(fullPrompt);

  console.log('🎨 Generating background with Pollinations AI...');
  console.log('📝 Prompt:', description);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const seed = Date.now() + attempt;
      const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

      console.log(`⏳ Attempt ${attempt}/${retries}...`);

      const response = await fetch(imageUrl, {
        timeout: 45000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const imageBuffer = await response.buffer();
      console.log('✅ Background generated successfully');
      return imageBuffer;
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < retries) {
        const delay = Math.min(2000 * attempt, 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error(`Pollinations AI failed after ${retries} attempts: ${error.message}`);
      }
    }
  }
}

// Composite product onto background
async function compositeImages(backgroundBuffer, productNoBgBuffer) {
  console.log('🖼️  Compositing images...');
  
  const background = await sharp(backgroundBuffer)
    .resize(1024, 1024, { fit: 'cover' })
    .toBuffer();
  
  const productMetadata = await sharp(productNoBgBuffer).metadata();
  
  // Scale product to 80% of canvas
  const maxSize = 800;
  const scale = Math.min(maxSize / productMetadata.width, maxSize / productMetadata.height);
  
  const resizedProduct = await sharp(productNoBgBuffer)
    .resize({
      width: Math.round(productMetadata.width * scale),
      height: Math.round(productMetadata.height * scale),
      fit: 'inside',
      withoutEnlargement: true
    })
    .toBuffer();
  
  const resizedMeta = await sharp(resizedProduct).metadata();
  const left = Math.round((1024 - resizedMeta.width) / 2);
  const top = Math.round((1024 - resizedMeta.height) / 2);
  
  const result = await sharp(background)
    .composite([{
      input: resizedProduct,
      left: left,
      top: top,
      blend: 'over'
    }])
    .png({ quality: 100 })
    .toBuffer();
  
  console.log('✅ Compositing complete');
  return result;
}

// Original endpoint - Generate background only
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

    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&enhance=true`;

    console.log('Fetching image from Pollinations AI...');

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.buffer();
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

// NEW endpoint - Full product showcase generation
router.post('/generate', upload.single('image'), async (req, res) => {
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
    
    console.log('\n🚀 Starting generation process...');
    console.log(`📝 Prompt: "${prompt}"`);
    console.log(`⚙️  Creativity: ${creativity}%, Quality: ${quality}%`);
    
    const imageBuffer = req.file.buffer;
    
    // Step 1: Remove background
    console.log('\n📸 Step 1: Background Removal');
    const noBgImage = await removeBackground(imageBuffer);
    
    // Step 2: Generate background with Pollinations (with retries)
    console.log('\n🎨 Step 2: Background Generation');
    const backgroundImage = await generateBackground(prompt, parseInt(creativity));
    
    // Convert to base64 - Send background and product separately
    // Frontend will handle the compositing for dragging/resizing
    const base64Background = backgroundImage.toString('base64');
    const base64ProductNoBg = noBgImage.toString('base64');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Generation completed in ${duration}s\n`);
    
    res.json({ 
      success: true,
      image: `data:image/png;base64,${base64Background}`, // Just the background
      productNoBg: `data:image/png;base64,${base64ProductNoBg}`, // Just the product
      duration: duration
    });
    
  } catch (error) {
    console.error('\n❌ Generation Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Generation failed. Please try again.'
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Image generation API is running',
    features: {
      backgroundGeneration: true,
      backgroundRemoval: true,
      provider: 'Pollinations.ai'
    }
  });
});

module.exports = router;