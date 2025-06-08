const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');

// TODO: Import controller once created
// const { createPrescription, getPrescriptions, getPrescriptionById } = require('../controllers/prescription.controller');

// Validation middleware
const prescriptionValidation = [
  body('medical_record_id').isInt({ min: 1 }),
  body('medication_name').trim().notEmpty(),
  body('dosage').trim().notEmpty(),
  body('frequency').trim().notEmpty(),
  body('duration').trim().notEmpty(),
  body('notes').optional().trim()
];

// Routes
router.post('/', auth, checkRole(['doctor']), prescriptionValidation, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.get('/', auth, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.get('/:id', auth, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

module.exports = router; 