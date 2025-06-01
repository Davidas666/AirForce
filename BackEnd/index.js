require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const forecastRoutes = require('./routes/forecastRoutes');
const cityRoutes = require('./routes/cityRoutes');
const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());
app.use('/api/forecast', forecastRoutes);
app.use('/api/cities', cityRoutes);

app.get('/', (req, res) => {
  res.send('Program running!');
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
