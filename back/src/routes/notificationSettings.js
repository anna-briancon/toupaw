const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationSettings');
const auth = require('../middlewares/auth');

router.get('/', auth, controller.getAll);
router.post('/', auth, controller.saveAll);

module.exports = router; 