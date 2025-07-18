const express = require('express');
const router = express.Router();
const controller = require('../controllers/walks');
const { body, validationResult } = require('express-validator');

const createWalkValidation = [
  body('pet_id').isInt().withMessage('pet_id invalide'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.get('/:petId', controller.list);
router.post('/', createWalkValidation, handleValidationErrors, controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router; 