const { models } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const rateLimit = require('express-rate-limit'); // Désactivé temporairement
const { sendMail } = require('../utils/mail');

// Limite plus stricte sur l'auth (10 requêtes par 15 min par IP) - DÉSACTIVÉE
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message: 'Trop de tentatives, réessayez plus tard.',
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => req.ip, // Par défaut, mais on l'explicite
// });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Champs requis' });
    const existing = await models.User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });
    const password_hash = await bcrypt.hash(password, 10);
    const user = await models.User.create({ name, email, password_hash });
    // Envoi de l'e-mail de bienvenue
    try {
      await sendMail({
        to: user.email,
        subject: '🐾 Bienvenue sur Toupaw !',
        text: `Bonjour ${user.name},\n\nBienvenue sur l’application Toupaw ! Nous sommes ravis de vous compter parmi nous.`,
        html: `
  <div style="background:#f6f8fa;padding:32px 0;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 8px #0001;padding:32px 24px 24px 24px;text-align:center;">
      <img src='https://toupaw.fr/assets/logo.png' alt='Toupaw' style='width:80px;margin-bottom:16px;border-radius:12px;' />
      <h1 style="font-size:2rem;margin:0 0 12px 0;">🐾 Bienvenue sur <span style='color:#059669;'>Toupaw</span> !</h1>
      <p style="font-size:1.1rem;margin:0 0 18px 0;">Bonjour <b>${user.name}</b>,</p>
      <p style="font-size:1.1rem;margin:0 0 18px 0;">Toute l’équipe Toupaw est ravie de t’accueillir dans la communauté des amoureux des animaux&nbsp;!<br/>🎉</p>
      <p style="font-size:1.1rem;margin:0 0 24px 0;">Tu peux dès maintenant ajouter ton animal, planifier ses repas, balades, rappels santé et bien plus encore&nbsp;!<br/>🐶🐱🐾</p>
      <a href="https://toupaw.fr" style="display:inline-block;padding:14px 32px;background:linear-gradient(90deg,#059669,#14b8a6);color:#fff;font-weight:bold;border-radius:8px;text-decoration:none;font-size:1.1rem;box-shadow:0 2px 8px #0002;margin-bottom:18px;">Accéder à mon compte</a>
      <p style="font-size:0.95rem;color:#666;margin-top:32px;">Besoin d’aide ou une question&nbsp;?<br/>Contacte-nous à <a href="mailto:contact@toupaw.fr" style="color:#059669;">support@toupaw.fr</a></p>
      <p style="font-size:0.85rem;color:#aaa;margin-top:24px;">© Toupaw ${new Date().getFullYear()}</p>
    </div>
  </div>
        `
      });
    } catch (mailErr) {
      console.error('Erreur lors de l\'envoi de l\'e-mail de bienvenue :', mailErr);
      // On ne bloque pas l'inscription si l'e-mail échoue
    }
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
    // Après avoir généré le token et avant de répondre :
    // const store = req.app.get('authLimiterStore'); // Désactivé
    // if (store && store.resetKey) {
    //   store.resetKey(req.ip); // Réinitialise le compteur pour cette IP
    // }
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