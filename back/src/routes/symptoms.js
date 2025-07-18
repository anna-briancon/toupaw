const express = require('express');
const router = express.Router();
const controller = require('../controllers/symptoms');
const { body, validationResult } = require('express-validator');

const createSymptomValidation = [
  body('pet_id').isInt().withMessage('pet_id invalide'),
  body('description').isLength({ min: 2 }).withMessage('Description trop courte'),
  body('date').isISO8601().withMessage('Date invalide'),
  body('photo_url').optional().isString().isLength({ max: 255 }).withMessage('URL de photo invalide'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.get('/:petId', controller.list);
router.get('/id/:id', controller.getOne);
router.post('/', createSymptomValidation, handleValidationErrors, controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router; 