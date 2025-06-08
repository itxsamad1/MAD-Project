const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');

// TODO: Import controller once created
// const { setAvailability, getAvailability, updateAvailability } = require('../controllers/availability.controller');

// Validation middleware
const availabilityValidation = [
  body('day_of_week').isInt({ min: 0, max: 6 }),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('is_available').isBoolean()
];

// Routes
router.post('/', auth, checkRole(['doctor']), availabilityValidation, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.get('/', auth, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.put('/:id', auth, checkRole(['doctor']), availabilityValidation, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

module.exports = router; 