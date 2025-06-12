const { upsertSubscription, getSubscriptions, getUserSubscribedCities } = require('../models/subscriptionModel');

exports.updateSubscription = async (req, res) => {
  const { telegram_id, city, type, enabled } = req.body;
  if (!telegram_id || !city || !type || typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const sub = await upsertSubscription(telegram_id, city, type, enabled);
    res.json({ success: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserSubscriptions = async (req, res) => {
  const { telegram_id } = req.query;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  try {
    const subs = await getSubscriptions(telegram_id);
    res.json({ subscriptions: subs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserSubscribedCities = async (req, res) => {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/telegram_user=([^;]+)/);
  if (!match) return res.status(401).json({ error: "Not authenticated" });

  let user;
  try {
    user = JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return res.status(400).json({ error: "Invalid user cookie" });
  }

  const telegram_id = user.id;
  if (!telegram_id) return res.status(400).json({ error: "telegram_id required" });

  try {
    const cities = await getUserSubscribedCities(telegram_id);
    res.json({ cities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};