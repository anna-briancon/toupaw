const express = require('express');
const router = express.Router();
const controller = require('../controllers/symptoms');

router.get('/:petId', controller.list);
router.get('/id/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router; 