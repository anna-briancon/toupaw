const express = require('express');
const router = express.Router();
const controller = require('../controllers/meals');
const { body, validationResult } = require('express-validator');

const createMealValidation = [
  body('pet_id').isInt().withMessage('pet_id invalide'),
  body('food_type').notEmpty().withMessage('Type d’aliment requis'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantité invalide'),
  body('unit').notEmpty().withMessage('Unité requise'),
  body('datetime').isISO8601().withMessage('Date/heure invalide'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.get('/:petId', controller.list);
router.post('/', createMealValidation, handleValidationErrors, controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/id/:id', controller.getOne);

module.exports = router; 