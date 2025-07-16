const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
// Route pour récupérer le profil utilisateur connecté
router.get('/me', authMiddleware, authController.me);
// Mise à jour du profil utilisateur
router.patch('/me', authMiddleware, authController.updateProfile);
// Changement de mot de passe
router.patch('/me/password', authMiddleware, authController.changePassword);
// Suppression du compte utilisateur
router.delete('/me', authMiddleware, authController.deleteAccount);
// Optionnel : route de logout (stateless)

module.exports = router; 