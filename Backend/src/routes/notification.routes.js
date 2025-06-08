const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// TODO: Import controller once created
// const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');

// Routes
router.get('/', auth, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.put('/:id/read', auth, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.put('/read-all', auth, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

module.exports = router; 