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
    const walks = await models.Walk.findAll({ where: { pet_id: petId } });
    const walksWithEvents = walks.map(walk => {
      let events = walk.events;
      if (typeof events === 'string') {
        try { events = JSON.parse(events); } catch { events = null; }
      }
      return { ...walk.toJSON(), events };
    });
    res.json(walksWithEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pet_id, start_time, end_time, distance_m, elevation_m, geojson_path, note, events } = req.body;
    if (!await checkOwnership(pet_id, userId)) return res.status(403).json({ error: 'Forbidden' });
    const walk = await models.Walk.create({ pet_id, start_time, end_time, distance_m, elevation_m, geojson_path, note, events });
    res.status(201).json(walk);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const walk = await models.Walk.findByPk(req.params.id);
    if (!walk || !await checkOwnership(walk.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    const { start_time, end_time, distance_m, elevation_m, geojson_path, note } = req.body;
    await walk.update({ start_time, end_time, distance_m, elevation_m, geojson_path, note });
    res.json(walk);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const walk = await models.Walk.findByPk(req.params.id);
    if (!walk || !await checkOwnership(walk.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    await walk.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 