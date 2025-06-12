const express = require('express');
const router = express.Router();
const controller = require('../controllers/subscriptionController');

router.post('/update', controller.updateSubscription);
router.get('/user', controller.getUserSubscriptions);
router.get('/user-cities', controller.getUserSubscribedCities);

module.exports = router;