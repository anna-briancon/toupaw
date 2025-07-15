const { models } = require('../models');

async function checkOwnership(petId, userId) {
  const userPet = await models.UserPet.findOne({ where: { pet_id: petId, user_id: userId } });
  return !!userPet;
}

exports.list = async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    if (!await checkOwnership(petId, userId)) return res.status(403).json({ error: 'Forbidden' });
    const weights = await models.Weight.findAll({ where: { pet_id: petId }, order: [['date', 'DESC']] });
    res.json(weights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pet_id, value, date, note } = req.body;
    if (!await checkOwnership(pet_id, userId)) return res.status(403).json({ error: 'Forbidden' });
    const weight = await models.Weight.create({ pet_id, value, date, note });
    res.status(201).json(weight);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const weight = await models.Weight.findByPk(req.params.id);
    if (!weight || !await checkOwnership(weight.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    const { value, date, note } = req.body;
    await weight.update({ value, date, note });
    res.json(weight);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const weight = await models.Weight.findByPk(req.params.id);
    if (!weight || !await checkOwnership(weight.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    await weight.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 