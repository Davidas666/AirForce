const serverless = require('serverless-http');
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const forecastRoutes = require('./routes/forecastRoutes');
const cityRoutes = require('./routes/cityRoutes');
const app = express();
const port = process.env.PORT || 3001;

console.log('Starting Express app...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
console.log('PostgreSQL pool created.');

app.use(express.json());
console.log('JSON middleware enabled.');
app.use('/api/forecast', forecastRoutes);
console.log('Forecast routes enabled.');
app.use('/api/cities', cityRoutes);
console.log('City routes enabled.');

app.get('/', (req, res) => {
  res.send('Program running!');
});
console.log('Root route enabled.');

module.exports = app;
module.exports.handler = serverless(app);
console.log('Express app exported for serverless.');

// Remove app.listen for Vercel serverless compatibility
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
