const { models } = require('../models');

// GET /api/notification-settings
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await models.NotificationSettings.findAll({ where: { user_id: userId } });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notification-settings (remplace toutes les préférences de l'utilisateur)
exports.saveAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body; // [{type, enabled, times}]
    if (!Array.isArray(settings)) return res.status(400).json({ error: 'Format invalide' });
    // On supprime les anciennes préférences
    await models.NotificationSettings.destroy({ where: { user_id: userId } });
    // On insère les nouvelles
    const created = await models.NotificationSettings.bulkCreate(
      settings.map(s => ({ ...s, user_id: userId }))
    );
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 