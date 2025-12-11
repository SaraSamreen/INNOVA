const cron = require('node-cron');
const InstagramPost = require('../models/InstagramPost');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Posts to Instagram using Graph API
 */
async function postToInstagram(post) {
  try {
    console.log(`\n📸 ========== POSTING TO INSTAGRAM ==========`);
    console.log(`Post ID: ${post._id}`);
    console.log(`Caption: ${post.caption?.substring(0, 50)}...`);
    console.log(`Image Path: ${post.imagePath}`);
    
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!accessToken || !businessAccountId) {
      throw new Error('Instagram credentials not configured in environment variables');
    }

    // Check if image exists
    if (!fs.existsSync(post.imagePath)) {
      throw new Error(`Image file not found: ${post.imagePath}`);
    }

    console.log('✅ Image file exists');
    console.log('📤 Step 1: Creating media container...');

    // IMPORTANT: Use the SERVER_URL for the image URL since Instagram needs to fetch it
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const imageUrl = post.imageUrl.startsWith('http') 
      ? post.imageUrl 
      : `${serverUrl}${post.imageUrl.startsWith('/') ? '' : '/'}${post.imageUrl}`;

    console.log('🌐 Image URL for Instagram:', imageUrl);

    // Step 1: Create media container
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${businessAccountId}/media`,
      null,
      {
        params: {
          image_url: imageUrl,
          caption: post.caption || '',
          access_token: accessToken
        },
        timeout: 60000 // 60 second timeout
      }
    );

    const creationId = containerResponse.data.id;
    console.log('✅ Media container created:', creationId);

    // Wait a few seconds for Instagram to process the image
    console.log('⏳ Waiting for Instagram to process image...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 2: Check container status
    console.log('📤 Step 2: Checking container status...');
    const statusResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${creationId}`,
      {
        params: {
          fields: 'status_code',
          access_token: accessToken
        }
      }
    );

    console.log('📊 Container status:', statusResponse.data);

    if (statusResponse.data.status_code === 'ERROR') {
      throw new Error('Instagram reported an error processing the media');
    }

    // Step 3: Publish the post
    console.log('📤 Step 3: Publishing post...');
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${businessAccountId}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: accessToken
        },
        timeout: 60000
      }
    );

    const instagramPostId = publishResponse.data.id;
    console.log('✅ Post published successfully!');
    console.log('📝 Instagram Post ID:', instagramPostId);
    console.log('=========================================\n');

    return {
      success: true,
      instagramPostId
    };

  } catch (error) {
    console.error('\n❌ ========== INSTAGRAM POST ERROR ==========');
    console.error('Error Message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      // Extract detailed error message from Instagram API
      const fbError = error.response.data?.error;
      if (fbError) {
        console.error('Facebook Error Code:', fbError.code);
        console.error('Facebook Error Type:', fbError.type);
        console.error('Facebook Error Message:', fbError.message);
        
        throw new Error(`Instagram API Error: ${fbError.message}`);
      }
    }
    
    console.error('=========================================\n');
    throw error;
  }
}

/**
 * Scheduler function - runs every minute
 */
const startScheduler = () => {
  console.log('🚀 Starting Instagram post scheduler...');
  
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Find posts that should be published now
      const postsToPublish = await InstagramPost.find({
        status: 'scheduled',
        scheduleTime: { $lte: now }
      });

      if (postsToPublish.length > 0) {
        console.log(`\n⏰ Found ${postsToPublish.length} post(s) to publish at ${now.toISOString()}`);
      }

      for (const post of postsToPublish) {
        try {
          // Update status to pending
          post.status = 'pending';
          await post.save();

          console.log(`📱 Processing post ${post._id}...`);

          // Post to Instagram
          const result = await postToInstagram(post);

          // Update status to posted
          post.status = 'posted';
          post.postedAt = new Date();
          post.instagramPostId = result.instagramPostId;
          post.error = null;
          await post.save();

          console.log(`✅ Successfully posted scheduled post: ${post._id}`);

        } catch (error) {
          // Update status to failed
          post.status = 'failed';
          post.error = error.message;
          await post.save();

          console.error(`❌ Failed to post ${post._id}:`, error.message);
        }
      }

    } catch (error) {
      console.error('❌ Scheduler error:', error);
    }
  });

  console.log('✅ Instagram post scheduler started - checking every minute');
  console.log('⏰ Scheduler is now active\n');
};

module.exports = { 
  startScheduler,
  postToInstagram // Export for testing
};