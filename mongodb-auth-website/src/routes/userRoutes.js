const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

const userController = new UserController();

// Route to get user profile
router.get('/profile', userController.getUserProfile);

// Route to update user profile
router.put('/profile', userController.updateUserProfile);

module.exports = router;