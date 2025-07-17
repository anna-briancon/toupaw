const { models } = require('../models');
const { User, Pet, UserPet } = models;

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
    let { name, birthdate, species, breed, gender } = req.body;
    let photo_url = req.body.photo_url;
    if (req.file) {
      // Construire l'URL d'accès à l'image
      photo_url = `/uploads/${req.file.filename}`;
    }
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
    let { name, birthdate, species, breed, gender } = req.body;
    let photo_url = req.body.photo_url;
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
    }
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

exports.inviteUserToPet = async (req, res) => {
  const { petId } = req.params;
  const { email } = req.body;

  try {
    // Vérifie que l'utilisateur existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie que l'association n'existe pas déjà
    const existing = await UserPet.findOne({ where: { user_id: user.id, pet_id: petId } });
    if (existing) {
      return res.status(400).json({ message: "Cet utilisateur a déjà accès à cet animal" });
    }

    // Crée l'association
    await UserPet.create({
      user_id: user.id,
      pet_id: petId,
      role: 'member'
    });

    res.status(200).json({ message: "Utilisateur ajouté à l'animal" });
  } catch (error) {
    console.error("Erreur dans inviteUserToPet:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getPetMembers = async (req, res) => {
  const { petId } = req.params;
  try {
    const userPets = await UserPet.findAll({
      where: { pet_id: petId },
      include: [{ model: User, as: 'User', attributes: ['id', 'email', 'name'] }]
    });
    // Retourne aussi le role de UserPet pour chaque membre
    res.json(userPets.map(up => ({
      ...up.User.toJSON(),
      role: up.role
    })));
  } catch (error) {
    console.error("Erreur dans getPetMembers:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.removePetMember = async (req, res) => {
  const { petId, userId } = req.params;
  const currentUserId = req.user.id;
  try {
    // Vérifie que le currentUser est bien owner de ce pet
    const ownerAssoc = await UserPet.findOne({ where: { pet_id: petId, user_id: currentUserId, role: 'owner' } });
    if (!ownerAssoc) {
      return res.status(403).json({ message: "Seul le propriétaire peut supprimer un membre." });
    }
    // On ne peut pas supprimer le propriétaire
    const memberAssoc = await UserPet.findOne({ where: { pet_id: petId, user_id: userId } });
    if (!memberAssoc) {
      return res.status(404).json({ message: "Membre non trouvé." });
    }
    if (memberAssoc.role === 'owner') {
      return res.status(403).json({ message: "Impossible de supprimer le propriétaire." });
    }
    // On ne peut pas supprimer soi-même si on est owner
    if (parseInt(userId) === parseInt(currentUserId)) {
      return res.status(403).json({ message: "Le propriétaire ne peut pas se supprimer lui-même." });
    }
    await memberAssoc.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur dans removePetMember:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}; 