const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

// Make sure these paths match your project
const authMiddleware = require('../middleware/authMiddleware') // should export a function (req,res,next)
const Team = require('../models/team')
const Chat = require('../models/chatModel') // adjust if model filename / export differs

// helper
const isValidObjectId = (id) => !!id && mongoose.Types.ObjectId.isValid(id)

// GET chats for a team
router.get('/team/:teamId/chats', authMiddleware, async (req, res) => {
  try {
    const teamId = req.params.teamId
    if (!teamId) return res.status(400).json({ message: 'teamId required' })
    if (!isValidObjectId(teamId)) return res.status(400).json({ message: 'invalid teamId' })

    const team = await Team.findById(teamId)
    if (!team) return res.status(404).json({ message: 'team not found' })

    const chats = await Chat.find({ team: teamId }).sort({ createdAt: 1 }) // adapt query if schema differs
    return res.json({ success: true, data: chats })
  } catch (err) {
    console.error('GET /team/:teamId/chats error:', err)
    return res.status(500).json({ message: 'server error' })
  }
})

// Example fixed route (replace the failing route with this pattern)
router.get('/team/:teamId/chats', authMiddleware, async (req, res) => {
  try {
    const teamId = req.params.teamId || req.query.teamId || req.body.teamId

    if (!teamId) {
      return res.status(400).json({ message: 'teamId is required' })
    }
    if (!isValidObjectId(teamId)) {
      return res.status(400).json({ message: 'Invalid teamId format' })
    }

    const team = await Team.findById(teamId)
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    // delegate to controller or fetch chats here
    // if your controller expects (req, res) you can call it; otherwise call a method:
    if (ChatController && typeof ChatController.getChatsByTeam === 'function') {
      return ChatController.getChatsByTeam(req, res)
    }

    // fallback: manually fetch chats (example - adapt to your schema)
    // const chats = await Chat.find({ team: teamId }).sort({ createdAt: -1 })
    // return res.json(chats)

    return res.status(501).json({ message: 'No chat handler implemented' })
  } catch (err) {
    console.error('Error in /team/:teamId/chats', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router