require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const authMiddleware = require('./src/middlewares/auth');
// const seed = require('./src/seeds/seed');

const app = express();
app.use(cors());
app.use(express.json());

// Servir les fichiers uploadés
app.use('/uploads', express.static(__dirname + '/uploads'));

// Auth routes (non protégées)
app.use('/api/auth', require('./src/routes/auth'));

// Middleware d'auth pour toutes les autres routes
app.use(authMiddleware);

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

const PORT = process.env.APP_PORT || 8081;
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