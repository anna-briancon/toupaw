const express = require('express');
const router = express.Router();
const weights = require('../controllers/weights');

// Liste des poids pour un animal
router.get('/:petId', weights.list);
// Création d'un poids
router.post('/', weights.create);
// Modification d'un poids
router.put('/:id', weights.update);
// Suppression d'un poids
router.delete('/:id', weights.remove);

module.exports = router; 