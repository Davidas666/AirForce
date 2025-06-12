const express = require('express');
const router = express.Router();
const controller = require('../controllers/subscriptionController');

router.post('/update', controller.updateSubscription);
router.get('/user', controller.getUserSubscriptions);

module.exports = router;