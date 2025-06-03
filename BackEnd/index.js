require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const forecastRoutes = require('./routes/forecastRoutes');
const cityRoutes = require('./routes/cityRoutes');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

// Ensure logs directory exists
fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());
app.use(cors({
  origin: [
    'http://airforce.pics',
    'https://airforce.pics',
    'http://www.airforce.pics',
    'https://www.airforce.pics'
  ],
  credentials: true
}));

// Morgan HTTP logging to winston
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use('/api/forecast', forecastRoutes);
app.use('/api/cities', cityRoutes);

app.get('/', (req, res) => {
  res.send('Program running!');
  logger.info('Root endpoint accessed');
});

// Telegram user save endpoint
app.post('/api/telegram-user', async (req, res) => {
  const { telegram_id, username, first_name, last_name, photo_url } = req.body;
  if (!telegram_id) {
    logger.warn('telegram_id missing in /api/telegram-user');
    return res.status(400).json({ error: 'telegram_id required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO telegram_users (telegram_id, username, first_name, last_name, photo_url, last_login)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (telegram_id) DO UPDATE SET
         username=EXCLUDED.username,
         first_name=EXCLUDED.first_name,
         last_name=EXCLUDED.last_name,
         photo_url=EXCLUDED.photo_url,
         last_login=NOW()
       RETURNING *`,
      [telegram_id, username, first_name, last_name, photo_url]
    );
    logger.info(`User login: ${username} (${telegram_id})`);
    res.json({ user: result.rows[0] });
  } catch (err) {
    logger.error('Error saving telegram user: %o', err);
    res.status(500).json({ error: err.message });
  }
});

// Startup and shutdown logging
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  console.log(`Server running on port ${port}`);
});

process.on('SIGINT', () => {
  logger.info('Server shutting down (SIGINT)');
  process.exit();
});
process.on('SIGTERM', () => {
  logger.info('Server shutting down (SIGTERM)');
  process.exit();
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception: %o', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at: %o, reason: %o', promise, reason);
});