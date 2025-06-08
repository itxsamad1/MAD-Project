const express = require('express');
const router = express.Router();
const { verifyToken, isDoctor } = require('../middlewares/auth');
const doctorController = require('../controllers/doctor.controller');

// Apply authentication middleware to all routes
router.use(verifyToken, isDoctor);

// Appointments
router.get('/appointments', doctorController.getAppointments);
router.get('/appointments/:id', doctorController.getAppointmentDetails);
router.patch('/appointments/:id/status', doctorController.updateAppointmentStatus);

// Prescriptions
router.post('/prescriptions', doctorController.createPrescription);
router.get('/prescriptions', doctorController.getPrescriptions);
router.get('/prescriptions/:id', doctorController.getPrescriptionDetails);

// Availability
router.get('/availability', doctorController.getAvailability);
router.post('/availability', doctorController.setAvailability);
router.delete('/availability/:id', doctorController.removeAvailability);

// Patient Records
router.get('/patients/:id/records', doctorController.getPatientRecords);
router.post('/patients/:id/records', doctorController.addMedicalRecord);

// Profile
router.get('/profile', doctorController.getProfile);
router.patch('/profile', doctorController.updateProfile);

module.exports = router; 