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
    const symptoms = await models.Symptom.findAll({ where: { pet_id: petId } });
    res.json(symptoms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pet_id, description, intensity, date, location, photo_url } = req.body;
    if (!await checkOwnership(pet_id, userId)) return res.status(403).json({ error: 'Forbidden' });
    const symptom = await models.Symptom.create({ pet_id, description, intensity, date, location, photo_url });
    return res.status(201).json(symptom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const symptom = await models.Symptom.findByPk(req.params.id);
    if (!symptom || !await checkOwnership(symptom.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    const { description, intensity, date, location, photo_url } = req.body;
    await symptom.update({ description, intensity, date, location, photo_url });
    res.json(symptom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const symptom = await models.Symptom.findByPk(req.params.id);
    if (!symptom || !await checkOwnership(symptom.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    await symptom.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const userId = req.user.id;
    const symptom = await models.Symptom.findByPk(req.params.id);
    if (!symptom) return res.status(404).json({ error: 'Not found' });
    const userPet = await models.UserPet.findOne({ where: { pet_id: symptom.pet_id, user_id: userId } });
    if (!userPet) return res.status(403).json({ error: 'Forbidden' });
    res.json(symptom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 