const { models } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Champs requis' });
    const existing = await models.User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });
    const password_hash = await bcrypt.hash(password, 10);
    const user = await models.User.create({ name, email, password_hash });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Champs requis' });
    const user = await models.User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Retourne le profil utilisateur connecté
exports.me = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email']
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Met à jour le profil utilisateur (nom, email)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name && !email) return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    const user = await models.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    if (email && email !== user.email) {
      // Vérifier unicité de l'email
      const existing = await models.User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change le mot de passe utilisateur
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Champs requis' });
    const user = await models.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprime le compte utilisateur
exports.deleteAccount = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    await user.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 