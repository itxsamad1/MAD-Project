const db = require('../config/db');

// Appointments
const getAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { status, date } = req.query;

    let query = `
      SELECT a.*, u.name as patient_name 
      FROM appointments a 
      JOIN users u ON a.patient_id = u.id 
      WHERE a.doctor_id = $1
    `;
    const params = [doctorId];

    if (status) {
      query += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    if (date) {
      query += ` AND a.date = $${params.length + 1}`;
      params.push(date);
    }

    query += ' ORDER BY a.date ASC, a.time ASC';

    const result = await db.query(query, params);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointments'
    });
  }
};

const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const result = await db.query(
      `SELECT a.*, u.name as patient_name, u.blood_group, u.allergies 
       FROM appointments a 
       JOIN users u ON a.patient_id = u.id 
       WHERE a.id = $1 AND a.doctor_id = $2`,
      [id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointment details'
    });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doctorId = req.user.id;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    const result = await db.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 AND doctor_id = $3 RETURNING *',
      [status, id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error updating appointment status'
    });
  }
};

// Prescriptions
const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId, appointmentId, medications, instructions, diagnosis } = req.body;

    // Verify if the appointment exists and belongs to this doctor
    const appointmentResult = await db.query(
      'SELECT id FROM appointments WHERE id = $1 AND doctor_id = $2 AND patient_id = $3',
      [appointmentId, doctorId, patientId]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found or unauthorized'
      });
    }

    const result = await db.query(
      `INSERT INTO prescriptions 
       (doctor_id, patient_id, appointment_id, medications, instructions, diagnosis) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [doctorId, patientId, appointmentId, medications, instructions, diagnosis]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error creating prescription'
    });
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const result = await db.query(
      `SELECT p.*, u.name as patient_name 
       FROM prescriptions p 
       JOIN users u ON p.patient_id = u.id 
       WHERE p.doctor_id = $1 
       ORDER BY p.created_at DESC`,
      [doctorId]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching prescriptions'
    });
  }
};

const getPrescriptionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const result = await db.query(
      `SELECT p.*, u.name as patient_name 
       FROM prescriptions p 
       JOIN users u ON p.patient_id = u.id 
       WHERE p.id = $1 AND p.doctor_id = $2`,
      [id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching prescription details'
    });
  }
};

// Availability
const getAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const result = await db.query(
      'SELECT * FROM availability WHERE doctor_id = $1 ORDER BY day_of_week, start_time',
      [doctorId]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching availability'
    });
  }
};

const setAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { dayOfWeek, startTime, endTime } = req.body;

    const result = await db.query(
      `INSERT INTO availability (doctor_id, day_of_week, start_time, end_time) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [doctorId, dayOfWeek, startTime, endTime]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error setting availability'
    });
  }
};

const removeAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const result = await db.query(
      'DELETE FROM availability WHERE id = $1 AND doctor_id = $2 RETURNING *',
      [id, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Availability slot not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Availability removed successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error removing availability'
    });
  }
};

// Patient Records
const getPatientRecords = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const doctorId = req.user.id;

    // Verify if the doctor has access to this patient's records
    const accessCheck = await db.query(
      'SELECT id FROM appointments WHERE doctor_id = $1 AND patient_id = $2 LIMIT 1',
      [doctorId, patientId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to patient records'
      });
    }

    const result = await db.query(
      'SELECT * FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient records'
    });
  }
};

const addMedicalRecord = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const doctorId = req.user.id;
    const { diagnosis, treatment, notes } = req.body;

    // Verify if the doctor has access to this patient
    const accessCheck = await db.query(
      'SELECT id FROM appointments WHERE doctor_id = $1 AND patient_id = $2 LIMIT 1',
      [doctorId, patientId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to patient'
      });
    }

    const result = await db.query(
      `INSERT INTO medical_records 
       (patient_id, doctor_id, diagnosis, treatment, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [patientId, doctorId, diagnosis, treatment, notes]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error adding medical record'
    });
  }
};

// Profile
const getProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const result = await db.query(
      `SELECT id, name, email, specialty, experience, education, bio, rating 
       FROM users 
       WHERE id = $1`,
      [doctorId]
    );

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { specialty, experience, education, bio } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET specialty = COALESCE($1, specialty),
           experience = COALESCE($2, experience),
           education = COALESCE($3, education),
           bio = COALESCE($4, bio)
       WHERE id = $5
       RETURNING id, name, email, specialty, experience, education, bio, rating`,
      [specialty, experience, education, bio, doctorId]
    );

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile'
    });
  }
};

module.exports = {
  getAppointments,
  getAppointmentDetails,
  updateAppointmentStatus,
  createPrescription,
  getPrescriptions,
  getPrescriptionDetails,
  getAvailability,
  setAvailability,
  removeAvailability,
  getPatientRecords,
  addMedicalRecord,
  getProfile,
  updateProfile
}; 