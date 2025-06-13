# AirForce Bot - Backend Documentation

## Table of Contents
- [Overview](#overview)
- [Core Components](#core-components)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Environment Variables](#environment-variables)

## Overview

The AirForce Bot is a Telegram bot that provides weather forecast services with subscription capabilities. It's built using Node.js with the `node-telegram-bot-api` library and uses PostgreSQL for data persistence.

## Core Components

### 1. Bot Initialization (`bot.js`)

Main entry point that initializes all services and sets up the Telegram bot.

```javascript
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const messageService = new MessageService(bot);
const stateManager = StateManager;
const subscriptionModel = SubscriptionModel;
const menuHandler = new MenuHandler(messageService, stateManager);
const subscriptionHandler = new SubscriptionHandler(
  messageService,
  subscriptionModel,
  stateManager,
  menuHandler
);
const weatherHandler = new WeatherHandler(messageService, stateManager, menuHandler);
```

### 2. Subscription Management (`handlers/subscriptionHandler.js`)

Handles all subscription-related functionality including creating, reading, and deleting subscriptions.

#### Key Methods:
- `formatFrequency(sub)` - Formats subscription frequency
- `createSubscriptionKeyboard(subscriptions)` - Creates inline keyboard for subscriptions
- `handleSubscriptionFlow(chatId, messageId, userInput)` - Manages subscription flow
- `showSubscriptionMenu(chatId, messageId)` - Displays subscription menu

### 3. Database Models (`models/subscriptionModel.js`)

Manages database operations for subscriptions.

#### Key Methods:
- `addSubscription(telegram_id, city, morning_forecast, weekly_forecast, daily_thrice_forecast)`
- `getUserSubscriptions(telegram_id)`
- `getAllSubscriptions()`
- `deleteSubscription(telegram_id, city)`
- `getSubscriptionById(telegram_id, city)`

### 4. Weather Formatters (`src/formatters/`)

Formats weather data for display in Telegram messages.

#### Available Formatters:
- `BaseFormatter.js` - Base formatter class
- `WeeklyForecastFormatter.js` - Formats weekly forecasts
- `ThriceDailyForecastFormatter.js` - Formats three-times-daily forecasts
- `MorningForecastFormatter.js` - Formats morning forecasts

## Database Schema

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  city VARCHAR(255) NOT NULL,
  morning_forecast BOOLEAN DEFAULT false,
  weekly_forecast BOOLEAN DEFAULT false,
  daily_thrice_forecast BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(telegram_id, city)
);
```

## API Reference

### Subscription Endpoints
- `POST /api/subscriptions` - Create or update a subscription
- `GET /api/subscriptions/:telegram_id` - Get user's subscriptions
- `DELETE /api/subscriptions/:telegram_id/:city` - Delete a subscription

## Error Handling

Errors are logged using Winston and appropriate error messages are sent to users. The system handles:
- Database connection errors
- API rate limiting
- Invalid user input
- Network timeouts

## Logging

Logs are written to both console and `bot.log` file with the following levels:
- `error`: Critical errors that require immediate attention
- `warn`: Non-critical issues
- `info`: General operational information
- `debug`: Debug information (when enabled)

## Environment Variables

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=postgresql://user:password@localhost:5432/airforce_bot
NODE_ENV=development
TIMEZONE=Europe/Vilnius
```

## Usage Examples

### Creating a Subscription
```javascript
const subscription = await subscriptionModel.addSubscription(
  123456789,        // telegram_id
  'Vilnius',        // city
  true,             // morning_forecast
  false,            // weekly_forecast
  true              // daily_thrice_forecast
);
```

### Getting User Subscriptions
```javascript
const subscriptions = await subscriptionModel.getUserSubscriptions(123456789);
```

### Formatting Weather Data
```javascript
const formatter = new WeeklyForecastFormatter(weatherData, 'Europe/Vilnius');
const formattedForecast = formatter.format();
```
