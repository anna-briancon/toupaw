const express = require('express');
const router = express.Router();
const petsController = require('../controllers/pets');
const multer = require('multer');
const path = require('path');
const { inviteUserToPet } = require('../controllers/pets');
const authMiddleware = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

// Configurer le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5 Mo
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers jpg, jpeg, png, webp sont autorisés'));
    }
  }
});

const createPetValidation = [
  body('name').isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('birthdate').isISO8601().withMessage('Date de naissance invalide'),
  body('species').notEmpty().withMessage('Espèce requise'),
  body('breed').notEmpty().withMessage('Race requise'),
  body('gender').optional().isIn(['male', 'female', 'other', null]).withMessage('Genre invalide'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.use(authMiddleware);

router.get('/', petsController.list);
router.post('/', upload.single('photo'), createPetValidation, handleValidationErrors, petsController.create);
router.put('/:id', upload.single('photo'), petsController.update);
router.delete('/:id', petsController.remove);
router.get('/:id', petsController.getOne);
router.post('/:petId/invite', inviteUserToPet);
router.get('/:petId/members', petsController.getPetMembers);
router.delete('/:petId/members/:userId', petsController.removePetMember);

module.exports = router; 