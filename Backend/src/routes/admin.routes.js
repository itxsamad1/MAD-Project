const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth');
const adminController = require('../controllers/admin.controller');

// Apply authentication middleware to all routes
router.use(verifyToken, isAdmin);

// Users Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Doctor Verification
router.get('/doctors/pending', adminController.getPendingDoctors);
router.patch('/doctors/:id/verify', adminController.verifyDoctor);

// Analytics
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/appointments', adminController.getAppointmentAnalytics);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

// Notifications
router.post('/notifications', adminController.sendNotification);
router.get('/notifications/history', adminController.getNotificationHistory);

module.exports = router; 