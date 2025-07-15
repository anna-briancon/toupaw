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
    const reminders = await models.Reminder.findAll({ where: { pet_id: petId } });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pet_id, title, description, due_date, completed } = req.body;
    if (!await checkOwnership(pet_id, userId)) return res.status(403).json({ error: 'Forbidden' });
    const reminder = await models.Reminder.create({ pet_id, title, description, due_date, completed });
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminder = await models.Reminder.findByPk(req.params.id);
    if (!reminder || !await checkOwnership(reminder.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    const { title, description, due_date, completed } = req.body;
    await reminder.update({ title, description, due_date, completed });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminder = await models.Reminder.findByPk(req.params.id);
    if (!reminder || !await checkOwnership(reminder.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    await reminder.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 