const express = require('express');
const router = express.Router();
const weights = require('../controllers/weights');
const { body, validationResult } = require('express-validator');

const createWeightValidation = [
  body('pet_id').isInt().withMessage('pet_id invalide'),
  body('value').isFloat({ min: 0.01 }).withMessage('Valeur de poids invalide'),
  body('date').isISO8601().withMessage('Date invalide'),
  body('note').optional().isString().isLength({ max: 255 }).withMessage('Note trop longue'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Liste des poids pour un animal
router.get('/:petId', weights.list);
// Création d'un poids
router.post('/', createWeightValidation, handleValidationErrors, weights.create);
// Modification d'un poids
router.put('/:id', weights.update);
// Suppression d'un poids
router.delete('/:id', weights.remove);

module.exports = router; 