const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Middleware to verify auth token (FIXED VERSION)
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔐 Auth check - Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
    
    console.log('🔑 Verifying token with secret length:', secret.length);
    
    try {
      const decoded = jwt.verify(token, secret);
      console.log('✅ Token decoded:', decoded);
      
      // Try multiple possible field names for user ID
      req.userId = decoded.userId || decoded.id || decoded._id || decoded.user?.id;
      
      if (!req.userId) {
        console.error('❌ No user ID found in token. Decoded token:', decoded);
        return res.status(401).json({ error: 'Invalid token format' });
      }
      
      console.log('✅ User authenticated:', req.userId);
      next();
    } catch (verifyError) {
      console.error('❌ Token verification failed:', verifyError.message);
      
      // If token is expired, try to decode it anyway to see what's inside
      if (verifyError.name === 'TokenExpiredError') {
        const decoded = jwt.decode(token);
        console.log('⚠️  Expired token contents:', decoded);
      }
      
      return res.status(401).json({ 
        error: 'Invalid authentication',
        details: verifyError.message 
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Get all registered users (for user list)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Fetching users for user:', req.userId);
    
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('name email')
      .sort({ name: 1 });
    
    console.log(`✅ Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get or create conversation with a user
router.post('/conversation', authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    
    console.log('💬 Creating conversation between:', req.userId, 'and', otherUserId);
    
    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, otherUserId] }
    }).populate('participants', 'name email');

    // Create new conversation if doesn't exist
    if (!conversation) {
      console.log('📝 Creating new conversation');
      conversation = await Conversation.create({
        participants: [req.userId, otherUserId]
      });
      
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email');
    } else {
      console.log('✅ Found existing conversation:', conversation._id);
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Get all conversations for current user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    })
    .populate('participants', 'name email')
    .populate('lastMessage')
    .sort({ lastMessageTime: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
router.get('/messages/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    console.log('📨 Fetching messages for conversation:', conversationId);
    
    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    console.log(`✅ Found ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    console.log('📤 Sending message to conversation:', conversationId);

    if (!conversationId || !content || !content.trim()) {
      return res.status(400).json({ error: 'Conversation ID and content required' });
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.userId,
      content: content.trim()
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageTime: message.createdAt
    });

    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email');

    // Emit socket event if socket.io is available
    if (req.app.get('io')) {
      const otherUserId = conversation.participants.find(
        p => p.toString() !== req.userId.toString()
      );
      req.app.get('io').to(otherUserId.toString()).emit('new-message', populatedMessage);
    }

    console.log('✅ Message sent successfully');
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/messages/read/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.userId },
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;