const { Pool } = require('pg');
require('dotenv').config();

class SubscriptionModel {
  constructor(pool) {
    this.pool = pool;
  }

  async addSubscription(telegram_id, city, morning_forecast, weekly_forecast, daily_thrice_forecast) {
    const query = `
      INSERT INTO subscriptions (telegram_id, city, morning_forecast, weekly_forecast, daily_thrice_forecast)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (telegram_id, city) DO UPDATE SET
        morning_forecast = EXCLUDED.morning_forecast,
        weekly_forecast = EXCLUDED.weekly_forecast,
        daily_thrice_forecast = EXCLUDED.daily_thrice_forecast
      RETURNING *;
    `;
    const values = [telegram_id, city, morning_forecast, weekly_forecast, daily_thrice_forecast];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getUserSubscriptions(telegram_id) {
    const query = 'SELECT * FROM subscriptions WHERE telegram_id = $1';
    const result = await this.pool.query(query, [telegram_id]);
    return result.rows;
  }

  async getAllSubscriptions() {
    const query = 'SELECT * FROM subscriptions';
    const result = await this.pool.query(query);
    return result.rows;
  }

  async deleteSubscription(telegram_id, city) {
    const query = 'DELETE FROM subscriptions WHERE telegram_id = $1 AND LOWER(city) = LOWER($2) RETURNING *';
    const result = await this.pool.query(query, [telegram_id, city]);
    return result.rows[0];
  }

  async getSubscriptionById(telegram_id, city) {
    const query = 'SELECT * FROM subscriptions WHERE telegram_id = $1 AND LOWER(city) = LOWER($2)';
    const result = await this.pool.query(query, [telegram_id, city]);
    return result.rows[0];
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Prijungiame prie DB ir tikriname ryšį
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Prisijungta prie duomenų bazės sėkmingai');
  });
});

module.exports = new SubscriptionModel(pool);
