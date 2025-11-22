const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId || decoded.id || decoded._id || decoded.user?.id;
      
      if (!req.userId) {
        return res.status(401).json({ error: 'Invalid token format' });
      }
      
      next();
    } catch (verifyError) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Get ALL users
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email')
      .sort({ name: 1 });

    console.log(`✅ Returning ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create or get a conversation
router.post('/conversation', authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    
    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, otherUserId] }
    }).populate('participants', 'name email');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.userId, otherUserId]
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email');
    }

    console.log('✅ Conversation with participants:', conversation.participants.map(p => p.name));
    res.json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// ===================================================
// 🔥 GET ALL CONVERSATIONS WITH DEBUG ADDED
// ===================================================
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    // Debug model registry
    console.log('📦 Registered models:', mongoose.modelNames());

    const conversations = await Conversation.find({
      participants: req.userId
    })
      .populate('participants', 'name email')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 });

    // DEBUG: Print first conversation
    if (conversations.length > 0) {
      console.log('🔍 First conversation:', JSON.stringify(conversations[0], null, 2));
    }

    // Additional debug
    console.log('📋 Conversations being returned:');
    conversations.forEach(conv => {
      console.log('  - ID:', conv._id);
      console.log('    Participants:', conv.participants.map(p => ({
        id: p._id,
        name: p.name,
        email: p.email
      })));
    });

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

    if (!conversationId || !content || !content.trim()) {
      return res.status(400).json({ error: 'Conversation ID and content required' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.userId,
      content: content.trim()
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageTime: message.createdAt
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email');

    if (req.app.get('io')) {
      req.app.get('io').to(conversationId).emit('new-message', populatedMessage);

      conversation.participants.forEach(pId => {
        if (pId.toString() !== req.userId.toString()) {
          req.app.get('io').to(pId.toString()).emit('new-message', populatedMessage);
        }
      });
    }

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
      { read: true, readAt: new Date() }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;
