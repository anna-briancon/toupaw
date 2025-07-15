const { models } = require('../models');

module.exports = (app, router) => {
  // Créer un user, un pet, les lier, ajouter un HealthEvent et un Walk
  router.post('/test-associations', async (req, res) => {
    try {
      const user = await models.User.create({
        name: 'Alice',
        email: `alice${Date.now()}@test.com`,
        password_hash: 'hashed',
      });
      const pet = await models.Pet.create({
        name: 'Rex',
        birthdate: '2020-01-01',
        species: 'dog',
        breed: 'labrador',
        photo_url: '',
      });
      await models.UserPet.create({ user_id: user.id, pet_id: pet.id, role: 'owner' });
      const healthEvent = await models.HealthEvent.create({
        pet_id: pet.id,
        type: 'vaccination',
        date: new Date(),
        note: 'Premier vaccin',
      });
      const walk = await models.Walk.create({
        pet_id: pet.id,
        start_time: new Date(),
        end_time: new Date(),
        distance_m: 1000,
        elevation_m: 10,
        geojson_path: '',
        note: 'Petite balade',
      });
      res.json({ user, pet, healthEvent, walk });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vérifier les associations
  router.get('/test-associations/:userId', async (req, res) => {
    try {
      const user = await models.User.findByPk(req.params.userId, {
        include: [{ model: models.Pet, as: 'pets' }],
      });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/test-pet/:petId', async (req, res) => {
    try {
      const pet = await models.Pet.findByPk(req.params.petId, {
        include: [
          { model: models.User, as: 'users' },
          { model: models.HealthEvent, as: 'healthEvents' },
          { model: models.Walk, as: 'walks' },
        ],
      });
      res.json(pet);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}; 