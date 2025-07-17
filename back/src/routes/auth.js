const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées
router.get('/me', authMiddleware, authController.me);
router.patch('/me', authMiddleware, authController.updateProfile);
router.patch('/me/password', authMiddleware, authController.changePassword);
router.delete('/me', authMiddleware, authController.deleteAccount);

module.exports = router; 