const express = require('express');
const router = express.Router();
const controller = require('../controllers/photos');
const { body, validationResult } = require('express-validator');

const createPhotoValidation = [
  body('pet_id').isInt().withMessage('pet_id invalide'),
  body('url').isString().isLength({ min: 1, max: 255 }).withMessage('URL de la photo invalide'),
  body('description').optional().isString().isLength({ max: 255 }).withMessage('Description trop longue'),
  body('event_date').optional().isISO8601().withMessage('Date d\'événement invalide'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.get('/:petId', controller.list);
router.post('/', createPhotoValidation, handleValidationErrors, controller.create);
router.delete('/:id', controller.remove);

module.exports = router; 