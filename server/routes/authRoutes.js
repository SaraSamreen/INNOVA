const express = require('express');
const router = express.Router();
const { updateProfile, deleteAccount, forgotPassword } = require('../controllers/authController');

router.put('/update-profile', updateProfile);
router.delete('/delete-account', deleteAccount);
router.post('/forgot-password', forgotPassword);

module.exports = router;
