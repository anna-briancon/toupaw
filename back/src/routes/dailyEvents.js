const express = require('express');
const router = express.Router();
const controller = require('../controllers/dailyEvents');
const { body, validationResult } = require('express-validator');

const createDailyEventValidation = [
  body('pet_id').isInt().withMessage('pet_id invalide'),
  body('type').notEmpty().withMessage('Type requis'),
  body('datetime').isISO8601().withMessage('Date/heure invalide'),
  body('note').optional().isString().isLength({ max: 255 }).withMessage('Note trop longue'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.get('/:petId', controller.list);
router.post('/', createDailyEventValidation, handleValidationErrors, controller.create);
router.delete('/:id', controller.remove);

module.exports = router; 