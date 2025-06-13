const express = require('express');
const router = express.Router();
const controller = require('../controllers/subscriptionController');

// Routes for user subscriptions

// Route to get all subscriptions
router.post('/update', controller.updateSubscription);

// Route to get user subscriptions by telegram_id
router.get('/user', controller.getUserSubscriptions);

// Route to get cities the user is subscribed to
router.get('/user-cities', controller.getUserSubscribedCities);

module.exports = router;