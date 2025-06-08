const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');

// TODO: Import controller once created
// const { createRecord, getRecords, getRecordById, updateRecord } = require('../controllers/medicalRecord.controller');

// Validation middleware
const recordValidation = [
  body('diagnosis').trim().notEmpty(),
  body('prescription').optional().trim(),
  body('notes').optional().trim(),
  body('date').isDate()
];

// Routes
router.post('/', auth, checkRole(['doctor']), recordValidation, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.get('/', auth, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.get('/:id', auth, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.put('/:id', auth, checkRole(['doctor']), recordValidation, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

module.exports = router; 