const { models } = require('../models');

exports.list = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await models.User.findByPk(userId, {
      include: [{
        model: models.Pet,
        as: 'pets',
        include: [
          { model: models.HealthEvent, as: 'healthEvents' },
          { model: models.Meal, as: 'meals' },
          { model: models.Walk, as: 'walks' },
          { model: models.DailyEvent, as: 'dailyEvents' },
          { model: models.Reminder, as: 'reminders' },
          { model: models.Photo, as: 'photos' },
        ]
      }]
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, birthdate, species, breed, photo_url, gender } = req.body;
    if (!name || !birthdate || !species || !breed)
      return res.status(400).json({ error: 'Champs requis manquants' });
    const pet = await models.Pet.create({ name, birthdate, species, breed, photo_url, gender });
    await models.UserPet.create({ user_id: userId, pet_id: pet.id, role: 'owner' });
    res.status(201).json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const pet = await models.Pet.findByPk(req.params.id, {
      include: [{ model: models.User, as: 'users', where: { id: userId } }]
    });
    if (!pet) return res.status(404).json({ error: 'Pet not found or forbidden' });
    const { name, birthdate, species, breed, photo_url, gender } = req.body;
    await pet.update({ name, birthdate, species, breed, photo_url, gender });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const pet = await models.Pet.findByPk(req.params.id, {
      include: [{ model: models.User, as: 'users', where: { id: userId } }]
    });
    if (!pet) return res.status(404).json({ error: 'Pet not found or forbidden' });
    // Suppression cascade manuelle
    await models.HealthEvent.destroy({ where: { pet_id: pet.id } });
    await models.Meal.destroy({ where: { pet_id: pet.id } });
    await models.Walk.destroy({ where: { pet_id: pet.id } });
    await models.DailyEvent.destroy({ where: { pet_id: pet.id } });
    await models.Reminder.destroy({ where: { pet_id: pet.id } });
    await models.Photo.destroy({ where: { pet_id: pet.id } });
    await models.UserPet.destroy({ where: { pet_id: pet.id } });
    await pet.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const userId = req.user.id;
    const pet = await models.Pet.findByPk(req.params.id, {
      include: [{ model: models.User, as: 'users', where: { id: userId } }]
    });
    if (!pet) return res.status(404).json({ error: 'Pet not found or forbidden' });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 