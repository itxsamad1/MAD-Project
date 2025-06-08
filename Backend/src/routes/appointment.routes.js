const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
  cancelAppointment
} = require('../controllers/appointment.controller');

// Validation middleware
const bookAppointmentValidation = [
  body('doctor_id').isInt({ min: 1 }),
  body('date').isDate(),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('notes').optional().trim()
];

const updateStatusValidation = [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled'])
];

// Routes
router.post('/', auth, checkRole(['patient']), bookAppointmentValidation, bookAppointment);
router.get('/', auth, getAppointments);
router.put('/:id/status', auth, checkRole(['doctor']), updateStatusValidation, updateAppointmentStatus);
router.put('/:id/cancel', auth, checkRole(['patient']), cancelAppointment);

module.exports = router; 