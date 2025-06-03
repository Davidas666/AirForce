require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const forecastRoutes = require('./routes/forecastRoutes');
const cityRoutes = require('./routes/cityRoutes.js');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

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
app.use('/api/forecast', forecastRoutes);
app.use('/api/cities', cityRoutes);

app.get('/', (req, res) => {
  res.send('Program running!');
});

// Telegram user save endpoint
app.post('/api/telegram-user', async (req, res) => {
  const { telegram_id, username, first_name, last_name, photo_url } = req.body;
  if (!telegram_id) {
    console.warn('POST /api/telegram-user: missing telegram_id. Body:', req.body);
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
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error saving Telegram user:', err, 'Request body:', req.body);
    res.status(500).json({ error: 'Nepavyko išsaugoti naudotojo duomenų. Bandykite vėliau.' });
  }
});

// GET endpoint visų naudotojų peržiūrai
app.get('/api/telegram-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM telegram_users ORDER BY last_login DESC');
    res.json({ users: result.rows });
  } catch (err) {
    console.error('Error fetching Telegram users:', err);
    res.status(500).json({ error: 'Nepavyko gauti naudotojų sąrašo.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
