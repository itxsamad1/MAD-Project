const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth } = require('../middleware/auth');

// TODO: Import controller once created
// const { createPayment, getPayments, getPaymentById, updatePaymentStatus } = require('../controllers/payment.controller');

// Validation middleware
const paymentValidation = [
  body('appointment_id').isInt({ min: 1 }),
  body('amount').isFloat({ min: 0 }),
  body('payment_method').trim().notEmpty()
];

const statusValidation = [
  body('status').isIn(['pending', 'completed', 'failed', 'refunded'])
];

// Routes
router.post('/', auth, paymentValidation, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.get('/', auth, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.get('/:id', auth, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

router.put('/:id/status', auth, statusValidation, (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
});

module.exports = router; 