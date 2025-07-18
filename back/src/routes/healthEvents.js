const express = require('express');
const router = express.Router();
const controller = require('../controllers/healthEvents');
const { body, validationResult } = require('express-validator');

const createHealthEventValidation = [
  body('pet_id').isInt().withMessage('pet_id invalide'),
  body('type').notEmpty().withMessage('Type requis'),
  body('date').isISO8601().withMessage('Date invalide'),
  body('note').optional().isString().isLength({ max: 255 }).withMessage('Note trop longue'),
  body('document_url').optional().isString().isLength({ max: 255 }).withMessage('URL de document invalide'),
  body('recurrence').optional().isIn(['1y','6m','3m','1m',null]).withMessage('Récurrence invalide'),
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
router.post('/', createHealthEventValidation, handleValidationErrors, controller.create);
router.put('/:id', controller.update);
router.put('/group/:groupId', controller.updateGroup);
router.delete('/:id', controller.remove);

module.exports = router; 