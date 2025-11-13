// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { generateProductDesign } = require('../controllers/aiController');

// POST /api/ai/design
router.post('/design', generateProductDesign);

module.exports = router;
