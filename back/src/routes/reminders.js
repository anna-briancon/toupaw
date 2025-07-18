const express = require('express');
const router = express.Router();
const controller = require('../controllers/reminders');
const { body, validationResult } = require('express-validator');

const createReminderValidation = [
  body('pet_id').isInt().withMessage('pet_id invalide'),
  body('title').isLength({ min: 2 }).withMessage('Titre trop court'),
  body('description').notEmpty().withMessage('Description requise'),
  body('due_date').isISO8601().withMessage('Date d\'échéance invalide'),
  body('completed').optional().isBoolean().withMessage('Statut terminé invalide'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.get('/:petId', controller.list);
router.post('/', createReminderValidation, handleValidationErrors, controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router; 