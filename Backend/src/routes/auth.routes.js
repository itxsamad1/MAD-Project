const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { register, login, logout, refreshToken, forgotPassword, resetPassword } = require('../controllers/auth.controller');

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').isIn(['patient', 'doctor'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', auth, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', body('email').isEmail(), forgotPassword);
router.post('/reset-password/:token', body('password').isLength({ min: 6 }), resetPassword);

module.exports = router; 