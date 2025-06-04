require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const forecastRoutes = require('./routes/forecastRoutes');
const cityRoutes = require('./routes/cityRoutes');
const telegramUserRoutes = require('./routes/telegramUserRoutes');
const favoriteCitiesRoutes = require('./routes/favoriteCitiesRoutes');
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
app.use('/api/telegram-user', telegramUserRoutes);
app.use('/api/favorite-cities', favoriteCitiesRoutes);

app.get('/', (req, res) => {
  res.send('Program running!');
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
