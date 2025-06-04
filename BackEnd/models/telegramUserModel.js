const pool = require('../db');
const winston = require('winston');

// Save or update Telegram user
async function saveTelegramUser(req, res) {
  const { telegram_id, username, first_name, last_name, photo_url } = req.body;
  if (!telegram_id) {
    winston.warn(`POST /api/telegram-user: missing telegram_id. Body: ${JSON.stringify(req.body)}`);
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
    winston.info(`Telegram user saved: ${JSON.stringify(result.rows[0])}`);
    res.json({ success: true, message: 'Naudotojas sėkmingai išsaugotas', user: result.rows[0] });
  } catch (err) {
    winston.error(`Error saving Telegram user: ${err} | Request body: ${JSON.stringify(req.body)}`);
    res.status(500).json({ error: 'Nepavyko išsaugoti naudotojo duomenų. Bandykite vėliau.' });
  }
}

// Get all Telegram users
async function getTelegramUsers(req, res) {
  try {
    const result = await pool.query('SELECT * FROM telegram_users ORDER BY last_login DESC');
    winston.info(`Fetched ${result.rows.length} telegram users`);
    res.json({ users: result.rows });
  } catch (err) {
    winston.error(`Error fetching Telegram users: ${err}`);
    res.status(500).json({ error: 'Nepavyko gauti naudotojų sąrašo.' });
  }
}

// Update user's favorite cities (JSONB field)
async function updateUserFavorites(req, res) {
  const { telegram_id, favorite_cities } = req.body;
  if (!telegram_id || !Array.isArray(favorite_cities)) {
    winston.warn(`POST /api/telegram-user/favorites: missing data. Body: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ error: 'telegram_id and favorite_cities (array) required' });
  }
  try {
    const result = await pool.query(
      `UPDATE telegram_users SET favorite_cities = $1 WHERE telegram_id = $2 RETURNING *`,
      [JSON.stringify(favorite_cities), telegram_id]
    );
    if (result.rowCount === 0) {
      winston.warn(`User not found for updating favorites: ${telegram_id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    winston.info(`Updated favorite cities for user ${telegram_id}: ${JSON.stringify(favorite_cities)}`);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    winston.error(`Error updating favorite cities: ${err} | Body: ${JSON.stringify(req.body)}`);
    res.status(500).json({ error: 'Nepavyko išsaugoti mėgstamų miestų. Bandykite vėliau.' });
  }
}

module.exports = {
  saveTelegramUser,
  getTelegramUsers,
  updateUserFavorites
};
