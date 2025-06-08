const { validationResult } = require('express-validator');
const db = require('../config/database');
const { logger } = require('../utils/logger');

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { doctor_id, date, time, notes } = req.body;
    const patient_id = req.user.id;

    // Check if doctor exists and is active
    const doctorResult = await db.query(
      'SELECT id FROM users WHERE id = $1 AND role = \'doctor\' AND is_active = true',
      [doctor_id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found or inactive'
      });
    }

    // Check doctor's availability
    const availabilityResult = await db.query(
      'SELECT * FROM availability WHERE doctor_id = $1 AND day_of_week = EXTRACT(DOW FROM $2::date) AND $3::time BETWEEN start_time AND end_time',
      [doctor_id, date, time]
    );

    if (availabilityResult.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor is not available at this time'
      });
    }

    // Check for existing appointments
    const existingAppointment = await db.query(
      'SELECT id FROM appointments WHERE doctor_id = $1 AND date = $2 AND time = $3 AND status != \'cancelled\'',
      [doctor_id, date, time]
    );

    if (existingAppointment.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const result = await db.query(
      'INSERT INTO appointments (patient_id, doctor_id, date, time, status, notes) VALUES ($1, $2, $3, $4, \'pending\', $5) RETURNING *',
      [patient_id, doctor_id, date, time, notes]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Book appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error booking appointment'
    });
  }
};

// Get appointments (for both doctors and patients)
const getAppointments = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { status, date } = req.query;

    let query = `
      SELECT 
        a.*,
        p.name as patient_name,
        d.name as doctor_name,
        d.specialty
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      WHERE ${role === 'doctor' ? 'a.doctor_id' : 'a.patient_id'} = $1
    `;
    const params = [id];

    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }

    if (date) {
      params.push(date);
      query += ` AND a.date = $${params.length}`;
    }

    query += ' ORDER BY a.date DESC, a.time DESC';

    const result = await db.query(query, params);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    logger.error('Get appointments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointments'
    });
  }
};

// Update appointment status (for doctors)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doctor_id = req.user.id;

    const result = await db.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND doctor_id = $3 RETURNING *',
      [status, id, doctor_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found or unauthorized'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Update appointment status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating appointment status'
    });
  }
};

// Cancel appointment (for patients)
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patient_id = req.user.id;

    const result = await db.query(
      'UPDATE appointments SET status = \'cancelled\', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND patient_id = $2 AND status = \'pending\' RETURNING *',
      [id, patient_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found or cannot be cancelled'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Cancel appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error cancelling appointment'
    });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
  cancelAppointment
}; 