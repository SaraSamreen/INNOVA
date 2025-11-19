const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust path if needed

const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_real_secret'

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' })

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader
    const payload = jwt.verify(token, JWT_SECRET)
    if (!payload?.id) return res.status(401).json({ message: 'Invalid token payload' })

    // Optional: load user from DB to verify still exists
    const user = await User.findById(payload.id).select('_id email name')
    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = { id: user._id.toString(), email: user.email, name: user.name }
    next()
  } catch (err) {
    console.error('authMiddleware error:', err)
    return res.status(401).json({ message: 'Unauthorized' })
  }
}