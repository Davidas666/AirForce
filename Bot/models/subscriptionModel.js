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
      ON CONFLICT (telegram_id, city)
      DO UPDATE SET morning_forecast = EXCLUDED.morning_forecast,
                    weekly_forecast = EXCLUDED.weekly_forecast,
                    daily_thrice_forecast = EXCLUDED.daily_thrice_forecast
      RETURNING *;
    `;
    const values = [telegram_id, city, morning_forecast, weekly_forecast, daily_thrice_forecast];
    try {
      const result = await this.pool.query(query, values);
      if (!result.rows[0]) {
        throw new Error('Prenumerata nebuvo išsaugota.');
      }
      return result.rows[0];
    } catch (err) {
      console.error('Klaida išsaugant prenumeratą:', err);
      throw err;
    }
  }

  async getUserSubscriptions(telegram_id) {
    const query = 'SELECT * FROM subscriptions WHERE telegram_id = $1';
    const result = await this.pool.query(query, [telegram_id]);
    return result.rows;
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
module.exports = SubscriptionModel;
