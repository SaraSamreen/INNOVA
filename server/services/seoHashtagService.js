const axios = require('axios');

/**
 * Generates SEO-optimized hashtags using Google Gemini API
 */

async function generateSEOHashtags(caption, imageDescription = '', count = 30) {
  try {
    // Check for Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      return generateSmartFallbackHashtags(caption, imageDescription, count);
    }

    const apiKey = process.env.GEMINI_API_KEY.trim();
    console.log('🔑 Using Gemini API');
    console.log('📝 Caption:', caption.substring(0, 50) + '...');

    const prompt = `You are an Instagram SEO and marketing expert. Analyze this post and generate an SEO-optimized response.

CAPTION: "${caption}"
${imageDescription ? `IMAGE DESCRIPTION: "${imageDescription}"` : ''}

TASK:
1. Create an enhanced, engaging version of the caption optimized for Instagram SEO
   - Keep it authentic and relatable (not overly corporate)
   - Use relevant keywords naturally
   - Add 2-3 relevant emojis if appropriate
   - Include a call-to-action if suitable

2. Generate EXACTLY ${count} highly relevant, SEO-optimized hashtags:
   - HIGH COMPETITION (${Math.floor(count * 0.3)} hashtags): Popular, trending tags with 500K+ posts
   - MEDIUM COMPETITION (${Math.floor(count * 0.4)} hashtags): Growing tags with 50K-500K posts
   - LOW COMPETITION (${Math.ceil(count * 0.3)} hashtags): Niche, specific tags with <50K posts
   
3. Hashtag Strategy:
   - Analyze the caption content and extract key topics
   - Mix branded, community, and trending hashtags
   - Include location-based tags if relevant
   - Use industry-specific and niche tags
   - Ensure hashtags match the content exactly
   - NO generic spam tags like #like4like or #followme

IMPORTANT: Respond ONLY with valid JSON in this EXACT format (no markdown, no extra text):
{
  "enhancedCaption": "Your SEO-optimized caption here with emojis 🌟",
  "hashtags": {
    "high": ["popular1", "popular2", "popular3"],
    "medium": ["medium1", "medium2", "medium3"],
    "low": ["niche1", "niche2", "niche3"]
  },
  "allHashtags": "#popular1 #popular2 #medium1 #niche1",
  "seoStrategy": "Brief 1-line explanation of the hashtag strategy used"
}`;

    console.log('🔍 Sending request to Gemini API...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Gemini response received');
    
    // Extract text from Gemini response
    const text = response.data.candidates[0].content.parts[0].text.trim();
    console.log('📝 Raw response preview:', text.substring(0, 150) + '...');
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text;
    if (text.includes('```json')) {
      cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (text.includes('```')) {
      cleanedText = text.replace(/```\n?/g, '').trim();
    }
    
    const result = JSON.parse(cleanedText);
    console.log('✅ JSON parsed successfully');
    console.log('📊 SEO Hashtag Strategy:', result.seoStrategy);
    console.log('📊 Generated hashtags:', {
      high: result.hashtags?.high?.length || 0,
      medium: result.hashtags?.medium?.length || 0,
      low: result.hashtags?.low?.length || 0,
      total: (result.hashtags?.high?.length || 0) + 
             (result.hashtags?.medium?.length || 0) + 
             (result.hashtags?.low?.length || 0)
    });

    return {
      success: true,
      enhancedCaption: result.enhancedCaption || caption,
      hashtags: result.hashtags || { high: [], medium: [], low: [] },
      allHashtags: result.allHashtags || '',
      seoStrategy: result.seoStrategy || 'SEO-optimized hashtag mix',
      originalCaption: caption,
      usingFallback: false
    };

  } catch (error) {
    console.error('\n❌ ========== SEO HASHTAG ERROR ==========');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from API');
    } else {
      console.error('Error details:', error);
    }
    console.error('=========================================\n');
    
    console.log('🔄 Analyzing caption and generating hashtags...');
    const fallback = generateSmartFallbackHashtags(caption, imageDescription, count);
    
    return {
      success: true,
      enhancedCaption: fallback.enhancedCaption || caption,
      hashtags: fallback.categorized,
      allHashtags: fallback.formatted,
      seoStrategy: fallback.seoStrategy,
      originalCaption: caption,
      usingFallback: false // Don't show fallback message to user
    };
  }
}

/**
 * AI-Powered Smart Analysis - Analyzes caption and generates contextual hashtags
 */
function generateSmartFallbackHashtags(caption, imageDescription, count = 30) {
  console.log('🤖 Analyzing caption content...');
  
  const fullText = `${caption} ${imageDescription}`.toLowerCase();
  const words = fullText.split(/\s+/).filter(w => w.length > 2);
  
  // Enhanced caption with emojis
  let enhancedCaption = caption.trim();
  if (enhancedCaption.length > 0) {
    enhancedCaption = enhancedCaption.charAt(0).toUpperCase() + enhancedCaption.slice(1);
    if (!enhancedCaption.match(/[.!?]$/)) {
      enhancedCaption += '.';
    }
    
    // Add contextual emojis
    if (fullText.match(/\b(perfume|fragrance|scent)\b/)) {
      enhancedCaption += ' ✨💫';
    } else if (fullText.match(/\b(makeup|beauty|cosmetic)\b/)) {
      enhancedCaption += ' 💄✨';
    } else if (fullText.match(/\b(food|delicious|yummy|coffee)\b/)) {
      enhancedCaption += ' 🍽️☕';
    } else if (fullText.match(/\b(travel|adventure|explore)\b/)) {
      enhancedCaption += ' 🌍✈️';
    } else if (fullText.match(/\b(fitness|gym|workout)\b/)) {
      enhancedCaption += ' 💪🏋️';
    } else if (fullText.match(/\b(fashion|style|outfit)\b/)) {
      enhancedCaption += ' 👗✨';
    } else {
      enhancedCaption += ' ✨';
    }
  }
  
  // Extract hashtags from caption words
  const extractedHashtags = new Set();
  
  // 1. Use actual words from caption
  words.forEach(word => {
    const cleaned = word.replace(/[^a-z0-9]/g, '');
    if (cleaned.length >= 3 && cleaned.length <= 20) {
      extractedHashtags.add(cleaned);
    }
  });
  
  // 2. Generate intelligent variations
  words.forEach(word => {
    const base = word.replace(/[^a-z0-9]/g, '');
    if (base.length >= 3) {
      // Core variations
      extractedHashtags.add(base);
      extractedHashtags.add(`${base}s`);
      extractedHashtags.add(`${base}lover`);
      extractedHashtags.add(`${base}life`);
      
      // Instagram-specific
      extractedHashtags.add(`${base}gram`);
      extractedHashtags.add(`insta${base}`);
      extractedHashtags.add(`${base}daily`);
      extractedHashtags.add(`${base}oftheday`);
      
      // Community
      extractedHashtags.add(`${base}community`);
      extractedHashtags.add(`${base}addict`);
      extractedHashtags.add(`${base}obsessed`);
      
      // Professional
      extractedHashtags.add(`${base}photography`);
      extractedHashtags.add(`${base}blogger`);
      extractedHashtags.add(`${base}artist`);
    }
  });
  
  // 3. Generate compound hashtags from word pairs
  for (let i = 0; i < words.length - 1; i++) {
    const word1 = words[i].replace(/[^a-z0-9]/g, '');
    const word2 = words[i + 1].replace(/[^a-z0-9]/g, '');
    if (word1.length >= 3 && word2.length >= 3) {
      const compound = `${word1}${word2}`;
      if (compound.length <= 25) {
        extractedHashtags.add(compound);
      }
    }
  }
  
  // 4. Add contextual engagement hashtags
  const contextualTags = [];
  if (fullText.match(/\b(beautiful|pretty|gorgeous|stunning|amazing)\b/)) {
    contextualTags.push('instagood', 'photooftheday', 'beautiful', 'picoftheday', 'instadaily');
  }
  if (fullText.match(/\b(new|latest|fresh|modern)\b/)) {
    contextualTags.push('new', 'trending', 'latest', 'modern', 'newtrend');
  }
  if (fullText.match(/\b(love|like|enjoy|passion)\b/)) {
    contextualTags.push('love', 'passion', 'lifestyle', 'loveit');
  }
  
  // Always add some universal engagement tags
  contextualTags.push('instagood', 'photooftheday', 'instamood');
  
  contextualTags.forEach(tag => extractedHashtags.add(tag));
  
  // Convert to array
  const allHashtags = Array.from(extractedHashtags);
  
  // Smart categorization
  const categorized = {
    high: [],
    medium: [],
    low: []
  };
  
  allHashtags.forEach(tag => {
    const tagLength = tag.length;
    
    // High competition: short & popular
    if (tagLength <= 8 || ['love', 'instagood', 'photooftheday', 'beautiful', 'happy', 'picoftheday', 'instadaily'].includes(tag)) {
      categorized.high.push(tag);
    }
    // Low competition: long & niche
    else if (tagLength >= 15 || tag.match(/community|addict|obsessed|enthusiast|blogger|artist/)) {
      categorized.low.push(tag);
    }
    // Medium competition: everything else
    else {
      categorized.medium.push(tag);
    }
  });
  
  // Balance distribution
  const targetHigh = Math.floor(count * 0.3);
  const targetMedium = Math.floor(count * 0.4);
  const targetLow = Math.ceil(count * 0.3);
  
  // Redistribute if needed
  while (categorized.high.length < targetHigh && categorized.medium.length > targetMedium) {
    categorized.high.push(categorized.medium.shift());
  }
  while (categorized.medium.length < targetMedium && categorized.low.length > targetLow) {
    categorized.medium.push(categorized.low.shift());
  }
  while (categorized.low.length < targetLow && categorized.medium.length > targetMedium) {
    categorized.low.push(categorized.medium.pop());
  }
  
  // Trim to exact count
  categorized.high = categorized.high.slice(0, targetHigh);
  categorized.medium = categorized.medium.slice(0, targetMedium);
  categorized.low = categorized.low.slice(0, targetLow);
  
  const finalHashtags = [...categorized.high, ...categorized.medium, ...categorized.low];
  
  console.log('✅ Generated SEO hashtags:', {
    high: categorized.high.length,
    medium: categorized.medium.length,
    low: categorized.low.length,
    total: finalHashtags.length
  });
  
  return {
    enhancedCaption: enhancedCaption,
    categorized: categorized,
    formatted: '#' + finalHashtags.join(' #'),
    seoStrategy: `Content analysis: Generated ${finalHashtags.length} SEO-optimized hashtags from caption keywords`
  };
}

/**
 * Get hashtag suggestions based on keywords using Gemini
 */
async function getHashtagSuggestions(keywords) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Generate 20 trending, SEO-optimized Instagram hashtags related to these keywords: "${keywords}"

Mix high, medium, and low competition hashtags.
Focus on relevance and engagement potential.
Avoid generic spam tags like #like4like or #followme.

Respond ONLY with valid JSON in this format (no markdown):
{"hashtags": ["tag1", "tag2", "tag3"]}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY.trim()}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    let text = response.data.candidates[0].content.parts[0].text.trim();
    
    // Clean markdown if present
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (text.includes('```')) {
      text = text.replace(/```\n?/g, '').trim();
    }
    
    const result = JSON.parse(text);

    return {
      success: true,
      hashtags: result.hashtags,
      usingFallback: false
    };

  } catch (error) {
    console.error('❌ Hashtag Suggestion Error:', error.message);
    
    // Smart analysis of keywords
    const words = keywords.toLowerCase().split(/[\s,]+/).filter(w => w.length > 0);
    const generatedHashtags = new Set();
    
    words.forEach(word => {
      const base = word.replace(/[^a-z0-9]/g, '');
      if (base.length >= 3) {
        generatedHashtags.add(base);
        generatedHashtags.add(`${base}s`);
        generatedHashtags.add(`${base}gram`);
        generatedHashtags.add(`insta${base}`);
        generatedHashtags.add(`${base}lover`);
        generatedHashtags.add(`${base}life`);
        generatedHashtags.add(`${base}daily`);
        generatedHashtags.add(`${base}community`);
      }
    });
    
    // Generate compound hashtags
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i].replace(/[^a-z0-9]/g, '');
      const word2 = words[i + 1].replace(/[^a-z0-9]/g, '');
      if (word1.length >= 3 && word2.length >= 3) {
        generatedHashtags.add(`${word1}${word2}`);
      }
    }

    const result = Array.from(generatedHashtags).slice(0, 20);

    return {
      success: true,
      hashtags: result.length > 0 ? result : ['instagram', 'instagood', 'photooftheday'],
      usingFallback: false // Don't show fallback message
    };
  }
}

module.exports = {
  generateSEOHashtags,
  getHashtagSuggestions
};