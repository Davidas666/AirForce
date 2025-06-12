require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const cityRoutes = require('./routes/cityRoutes');
const telegramUserRoutes = require('./routes/telegramUserRoutes');
const favoriteCitiesRoutes = require('./routes/favoriteCitiesRoutes');
const cors = require('cors');
const winston = require('winston');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Ensure logs directory exists
fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });

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
    new winston.transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join('logs', 'combined.log') }),
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

// Morgan HTTP logging to winston
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use('/api/subscription', subscriptionRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/telegram-user', telegramUserRoutes);
app.use('/api/favorite-cities', favoriteCitiesRoutes);

app.get('/', (req, res) => {
  res.send('Program running!');
  logger.info('Root endpoint accessed');
});



app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
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