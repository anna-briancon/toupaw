const express = require('express');
const router = express.Router();
const petsController = require('../controllers/pets');
const multer = require('multer');
const path = require('path');
const { inviteUserToPet } = require('../controllers/pets');

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
const upload = multer({ storage });

router.get('/', petsController.list);
router.post('/', upload.single('photo'), petsController.create);
router.put('/:id', upload.single('photo'), petsController.update);
router.delete('/:id', petsController.remove);
router.get('/:id', petsController.getOne);
router.post('/:petId/invite', inviteUserToPet);
router.get('/:petId/members', petsController.getPetMembers);
router.delete('/:petId/members/:userId', petsController.removePetMember);

module.exports = router; 