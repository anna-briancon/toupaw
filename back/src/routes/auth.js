const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
// Route pour récupérer le profil utilisateur connecté
router.get('/me', authMiddleware, authController.me);
// Optionnel : route de logout (stateless)

module.exports = router; 