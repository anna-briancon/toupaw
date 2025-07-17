const { models } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function checkOwnership(petId, userId) {
  const userPet = await models.UserPet.findOne({ where: { pet_id: petId, user_id: userId } });
  return !!userPet;
}

exports.list = async (req, res) => {
  try {
    const userId = req.user.id;
    const petId = req.params.petId;
    if (!await checkOwnership(petId, userId)) return res.status(403).json({ error: 'Forbidden' });
    const events = await models.HealthEvent.findAll({ where: { pet_id: petId } });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pet_id, type, date, note, document_url, recurrence } = req.body;
    if (!await checkOwnership(pet_id, userId)) return res.status(403).json({ error: 'Forbidden' });

    // Gestion de la récurrence
    let events = [];
    if (recurrence && ['1y','6m','3m','1m'].includes(recurrence)) {
      const intervals = { '1y': 12, '6m': 6, '3m': 3, '1m': 1 };
      const count = 4; // Créer 4 occurrences par défaut
      const group_id = uuidv4();
      let d = new Date(date);
      for (let i = 0; i < count; i++) {
        events.push({
          pet_id,
          type,
          date: new Date(d),
          note,
          document_url,
          recurrence,
          group_id,
        });
        d.setMonth(d.getMonth() + intervals[recurrence]);
      }
      const created = await models.HealthEvent.bulkCreate(events);
      return res.status(201).json(created);
    } else {
      // Pas de récurrence
      const event = await models.HealthEvent.create({ pet_id, type, date, note, document_url, recurrence: null });
      return res.status(201).json(event);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const event = await models.HealthEvent.findByPk(req.params.id);
    if (!event || !await checkOwnership(event.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    const { type, date, note, document_url, completed, recurrence } = req.body;
    await event.update({ type, date, note, document_url, completed, recurrence });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.groupId;
    // On vérifie que l'utilisateur possède au moins un event de ce groupe
    const events = await models.HealthEvent.findAll({ where: { group_id: groupId }, order: [['date', 'ASC']] });
    if (!events || events.length === 0) return res.status(404).json({ error: 'Not found' });
    if (!await checkOwnership(events[0].pet_id, userId)) return res.status(403).json({ error: 'Forbidden' });
    const { type, date, note, document_url, completed, recurrence } = req.body;
    // Si la récurrence change, on supprime et on recrée la série
    if (recurrence && recurrence !== events[0].recurrence) {
      const pet_id = events[0].pet_id;
      const startDate = new Date(events[0].date);
      // Supprimer tous les events du groupe
      await models.HealthEvent.destroy({ where: { group_id: groupId } });
      // Générer la nouvelle série
      const intervals = { '1y': 12, '6m': 6, '3m': 3, '1m': 1 };
      const count = 4; // Créer 4 occurrences par défaut
      let d = new Date(startDate);
      let newEvents = [];
      for (let i = 0; i < count; i++) {
        newEvents.push({
          pet_id,
          type: type || events[0].type,
          date: new Date(d),
          note: note !== undefined ? note : events[0].note,
          document_url: document_url !== undefined ? document_url : events[0].document_url,
          completed: completed !== undefined ? completed : false,
          recurrence,
          group_id: groupId,
        });
        d.setMonth(d.getMonth() + intervals[recurrence]);
      }
      const created = await models.HealthEvent.bulkCreate(newEvents);
      return res.json(created);
    } else {
      // Sinon, update groupé classique
      await models.HealthEvent.update(
        { type, note, document_url, completed, recurrence },
        { where: { group_id: groupId } }
      );
      const updated = await models.HealthEvent.findAll({ where: { group_id: groupId } });
      res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const event = await models.HealthEvent.findByPk(req.params.id);
    if (!event || !await checkOwnership(event.pet_id, userId)) return res.status(404).json({ error: 'Not found or forbidden' });
    if (event.group_id) {
      // Supprimer tous les événements du groupe
      await models.HealthEvent.destroy({ where: { group_id: event.group_id } });
    } else {
      await event.destroy();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const userId = req.user.id;
    const event = await models.HealthEvent.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    const userPet = await models.UserPet.findOne({ where: { pet_id: event.pet_id, user_id: userId } });
    if (!userPet) return res.status(403).json({ error: 'Forbidden' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 