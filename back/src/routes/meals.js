const express = require('express');
const router = express.Router();
const controller = require('../controllers/meals');

router.get('/:petId', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/id/:id', controller.getOne);

module.exports = router; 