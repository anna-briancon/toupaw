const { models } = require('../models');

module.exports = (app, router) => {
  // GET /api/pets?userId=1
  router.get('/pets', async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) return res.status(400).json({ error: 'userId requis' });
      const user = await models.User.findByPk(userId, {
        include: [{ model: models.Pet, as: 'pets' }],
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user.pets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/pets { userId, name, birthdate, species, breed, photo_url }
  router.post('/pets', async (req, res) => {
    try {
      const { userId, name, birthdate, species, breed, photo_url } = req.body;
      if (!userId || !name || !birthdate || !species || !breed)
        return res.status(400).json({ error: 'Champs requis manquants' });
      const pet = await models.Pet.create({ name, birthdate, species, breed, photo_url });
      await models.UserPet.create({ user_id: userId, pet_id: pet.id, role: 'owner' });
      res.status(201).json(pet);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}; 