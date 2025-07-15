const express = require('express');
const router = express.Router();
const petsController = require('../controllers/pets');

router.get('/', petsController.list);
router.post('/', petsController.create);
router.put('/:id', petsController.update);
router.delete('/:id', petsController.remove);

module.exports = router; 