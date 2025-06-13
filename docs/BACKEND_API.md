# AirForce Backend API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Forecast](#forecast)
  - [Cities](#cities)
  - [Favorite Cities](#favorite-cities)
  - [Subscriptions](#subscriptions)

## Overview

The AirForce Backend API provides weather forecast data and user management services. It's built with Node.js, Express, and PostgreSQL.

## Base URL

```
https://api.airforce.pics/api
```

## Authentication

Most endpoints require authentication via Telegram user ID. Include the user's Telegram ID in the request body or query parameters where required.

## Error Handling

Standard HTTP status codes are used to indicate success or failure:

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include a JSON object with an `error` field containing the error message.

## Endpoints

### Forecast

#### Get Current Weather by City

```http
GET /api/forecast/:city
```

**Parameters:**
- `city` (required, path) - City name

**Response:**
```json
{
  "coord": {
    "lon": 25.2798,
    "lat": 54.6892
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "main": {
    "temp": 22.5,
    "feels_like": 21.8,
    "temp_min": 21.0,
    "temp_max": 24.0,
    "pressure": 1012,
    "humidity": 60
  }
}
```

#### Get Daily Forecast

```http
GET /api/forecast/daily/:city?cnt=7
```

**Parameters:**
- `city` (required, path) - City name
- `cnt` (optional, query) - Number of days (default: 7)

**Response:**
```json
{
  "city": {
    "name": "Vilnius",
    "country": "LT"
  },
  "list": [
    {
      "dt": 1625097600,
      "temp": {
        "day": 22.5,
        "min": 15.2,
        "max": 24.0
      },
      "weather": [
        {
          "main": "Clear",
          "description": "clear sky"
        }
      ]
    }
  ]
}
```

### Cities

#### Search Cities

```http
GET /api/cities?q=viln
```

**Parameters:**
- `q` (required, query) - Search query (case-insensitive)

**Response:**
```json
[
  {
    "name": "Vilnius",
    "country": "LT",
    "lat": 54.6892,
    "lon": 25.2798
  }
]
```

### Favorite Cities

#### Get User's Favorite Cities

```http
GET /api/favorites?userId=12345
```

**Parameters:**
- `userId` (required, query) - Telegram user ID

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 12345,
    "city": "Vilnius",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Add Favorite City

```http
POST /api/favorites
```

**Request Body:**
```json
{
  "userId": 12345,
  "city": "Vilnius"
}
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 12345,
    "city": "Vilnius",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
]
```

### Subscriptions

#### Get User's Subscriptions

```http
GET /api/subscriptions?userId=12345
```

**Parameters:**
- `userId` (required, query) - Telegram user ID

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 12345,
    "city": "Vilnius",
    "morning_forecast": true,
    "weekly_forecast": false,
    "daily_thrice_forecast": true,
    "created_at": "2023-01-01T00:00:00.000Z"
  }
]
```

#### Update Subscription

```http
POST /api/subscriptions
```

**Request Body:**
```json
{
  "userId": 12345,
  "city": "Vilnius",
  "morningForecast": true,
  "weeklyForecast": false,
  "dailyThriceForecast": true
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 12345,
  "city": "Vilnius",
  "morning_forecast": true,
  "weekly_forecast": false,
  "daily_thrice_forecast": true,
  "updated_at": "2023-01-02T12:00:00.000Z"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- 60 requests per minute per IP address
- 1000 requests per day per API key (where applicable)

## CORS

Cross-Origin Resource Sharing is enabled for the following origins:

- http://airforce.pics
- https://airforce.pics
- http://www.airforce.pics
- https://www.airforce.pics
