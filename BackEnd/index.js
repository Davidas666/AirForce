require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const forecastRoutes = require('./routes/forecastRoutes');
const cityRoutes = require('./routes/cityRoutes');
const cors = require('cors');
const winston = require('winston');
const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'backend-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'backend-combined.log' }),
    new winston.transports.Console()
  ],
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
app.use('/api/forecast', forecastRoutes);
app.use('/api/cities', cityRoutes);

app.get('/', (req, res) => {
  res.send('Program running!');
});

// Telegram user save endpoint
app.post('/api/telegram-user', async (req, res) => {
  const { telegram_id, username, first_name, last_name, photo_url } = req.body;
  if (!telegram_id) {
    logger.warn(`POST /api/telegram-user: missing telegram_id. Body: ${JSON.stringify(req.body)}`);
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
    logger.info(`Telegram user saved: ${JSON.stringify(result.rows[0])}`);
    res.json({ success: true, message: 'Naudotojas sėkmingai išsaugotas', user: result.rows[0] });
  } catch (err) {
    logger.error(`Error saving Telegram user: ${err} | Request body: ${JSON.stringify(req.body)}`);
    res.status(500).json({ error: 'Nepavyko išsaugoti naudotojo duomenų. Bandykite vėliau.' });
  }
});

// GET endpoint visų naudotojų peržiūrai
app.get('/api/telegram-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM telegram_users ORDER BY last_login DESC');
    logger.info(`Fetched ${result.rows.length} telegram users`);
    res.json({ users: result.rows });
  } catch (err) {
    logger.error(`Error fetching Telegram users: ${err}`);
    res.status(500).json({ error: 'Nepavyko gauti naudotojų sąrašo.' });
  }
});

// Endpoint to update user's favorite cities
app.post('/api/telegram-user/favorites', async (req, res) => {
  const { telegram_id, favorite_cities } = req.body;
  if (!telegram_id || !Array.isArray(favorite_cities)) {
    logger.warn(`POST /api/telegram-user/favorites: missing data. Body: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ error: 'telegram_id and favorite_cities (array) required' });
  }
  try {
    // Save as JSONB in DB
    const result = await pool.query(
      `UPDATE telegram_users SET favorite_cities = $1 WHERE telegram_id = $2 RETURNING *`,
      [JSON.stringify(favorite_cities), telegram_id]
    );
    if (result.rowCount === 0) {
      logger.warn(`User not found for updating favorites: ${telegram_id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    logger.info(`Updated favorite cities for user ${telegram_id}: ${JSON.stringify(favorite_cities)}`);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    logger.error(`Error updating favorite cities: ${err} | Body: ${JSON.stringify(req.body)}`);
    res.status(500).json({ error: 'Nepavyko išsaugoti mėgstamų miestų. Bandykite vėliau.' });
  }
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
