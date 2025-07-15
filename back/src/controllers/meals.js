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
    const meals = await models.Meal.findAll({ where: { pet_id: petId } });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pet_id, food_type, quantity, unit, datetime, note } = req.body;
    if (!await checkOwnership(pet_id, userId)) return res.status(403).json({ error: 'Forbidden' });
    const meal = await models.Meal.create({ pet_id, food_type, quantity, unit, datetime, note });
    res.status(201).json(meal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const meal = await models.Meal.findByPk(req.params.id);
    if (!meal || !await checkOwnership(meal.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    const { food_type, quantity, unit, datetime, note } = req.body;
    await meal.update({ food_type, quantity, unit, datetime, note });
    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const meal = await models.Meal.findByPk(req.params.id);
    if (!meal || !await checkOwnership(meal.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    await meal.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const userId = req.user.id;
    const meal = await models.Meal.findByPk(req.params.id);
    if (!meal) return res.status(404).json({ error: 'Not found' });
    const userPet = await models.UserPet.findOne({ where: { pet_id: meal.pet_id, user_id: userId } });
    if (!userPet) return res.status(403).json({ error: 'Forbidden' });
    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 