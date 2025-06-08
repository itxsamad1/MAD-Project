const express = require('express');
const router = express.Router();
const { verifyToken, isPatient } = require('../middlewares/auth');
const patientController = require('../controllers/patient.controller');

// Apply authentication middleware to all routes
router.use(verifyToken, isPatient);

// Doctor search and listing
router.get('/doctors', patientController.listDoctors);
router.get('/doctors/:id', patientController.getDoctorDetails);
router.get('/doctors/search', patientController.searchDoctors);

// Appointments
router.post('/appointments', patientController.bookAppointment);
router.get('/appointments', patientController.getMyAppointments);
router.get('/appointments/:id', patientController.getAppointmentDetails);
router.patch('/appointments/:id/cancel', patientController.cancelAppointment);

// Medical Records
router.get('/records', patientController.getMyMedicalRecords);
router.get('/records/:id', patientController.getMedicalRecordDetails);
router.get('/prescriptions', patientController.getMyPrescriptions);

// Profile
router.get('/profile', patientController.getProfile);
router.patch('/profile', patientController.updateProfile);

module.exports = router; 