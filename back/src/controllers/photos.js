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
    const photos = await models.Photo.findAll({ where: { pet_id: petId } });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pet_id, url, description, event_date } = req.body;
    if (!await checkOwnership(pet_id, userId)) return res.status(403).json({ error: 'Forbidden' });
    const photo = await models.Photo.create({ pet_id, url, description, event_date });
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const photo = await models.Photo.findByPk(req.params.id);
    if (!photo || !await checkOwnership(photo.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    await photo.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 