-- Table: subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    city VARCHAR(100) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- pvz., 'daily', 'weekly'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Foreign key (jei norite susieti su telegram vartotojų lentele, pvz., telegram_users)
-- ALTER TABLE subscriptions ADD CONSTRAINT fk_telegram_user FOREIGN KEY (telegram_id) REFERENCES telegram_users(telegram_id);
