require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./src/models');
const authMiddleware = require('./src/middlewares/auth');
const rateLimit = require('express-rate-limit');
// const seed = require('./src/seeds/seed');

const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net', 'https://unpkg.com', "'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'http://localhost:8082', 'http://localhost:5173'],
      connectSrc: ["'self'", 'https://toupaw.fr', 'http://localhost:5173'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginResourcePolicy: false, // <--- AJOUTE CETTE LIGNE
}));
const allowedOrigins = ['http://localhost:5173', 'https://toupaw.fr'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// Limite globale (100 requêtes par 15 min par IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Limite plus stricte sur l'auth (10 requêtes par 15 min par IP)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message: 'Trop de tentatives, réessayez plus tard.',
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => req.ip, // Par défaut, mais on l'explicite
// });
// app.use('/api/auth', authLimiter);
// Expose le store pour pouvoir le réinitialiser dans le contrôleur
// app.set('authLimiterStore', authLimiter.store);

// Autoriser CORS sur les fichiers uploadés
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Servir les fichiers uploadés
app.use('/uploads', express.static('uploads'));

// Auth routes (publiques)
app.use('/api/auth', require('./src/routes/auth'));

// Middleware d'auth pour toutes les autres routes
app.use(authMiddleware);

// Routes protégées
app.use('/api/pets', require('./src/routes/pets'));
app.use('/api/health-events', require('./src/routes/healthEvents'));
app.use('/api/meals', require('./src/routes/meals'));
app.use('/api/walks', require('./src/routes/walks'));
app.use('/api/daily-events', require('./src/routes/dailyEvents'));
app.use('/api/reminders', require('./src/routes/reminders'));
app.use('/api/photos', require('./src/routes/photos'));
app.use('/api/weights', require('./src/routes/weights'));
app.use('/api/symptoms', require('./src/routes/symptoms'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.APP_PORT || 8082;
const shouldSeed = process.env.SEED_DB === 'true';

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    if (shouldSeed) {
      // await seed();
    }
    console.log('Connexion DB OK');
    app.listen(PORT, '0.0.0.0', () => console.log(`API sur http://localhost:${PORT}`));
  } catch (e) {
    console.error('Erreur DB:', e);
    process.exit(1);
  }
})(); 