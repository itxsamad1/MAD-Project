const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { getProfile, updateProfile, getDoctors, getDoctorDetails } = require('../controllers/user.controller');

// Validation middleware
const updateProfileValidation = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('blood_group').optional().trim(),
  body('allergies').optional().trim(),
  body('specialty').optional().trim(),
  body('experience').optional().isInt({ min: 0 }),
  body('education').optional().trim(),
  body('bio').optional().trim()
];

// Routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfileValidation, updateProfile);
router.get('/doctors', auth, checkRole(['patient']), getDoctors);
router.get('/doctors/:id', auth, checkRole(['patient']), getDoctorDetails);

module.exports = router; 