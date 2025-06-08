const db = require('../config/db');

// Doctor search and listing
const listDoctors = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, specialty, experience, rating FROM users WHERE role = $1 AND is_verified = true',
      ['doctor']
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctors'
    });
  }
};

const getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, name, specialty, experience, rating, bio, education FROM users WHERE id = $1 AND role = $2',
      [id, 'doctor']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
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
      message: 'Error fetching doctor details'
    });
  }
};

const searchDoctors = async (req, res) => {
  try {
    const { specialty, name } = req.query;
    let query = 'SELECT id, name, specialty, experience, rating FROM users WHERE role = $1 AND is_verified = true';
    const params = ['doctor'];

    if (specialty) {
      query += ' AND specialty ILIKE $' + (params.length + 1);
      params.push(`%${specialty}%`);
    }

    if (name) {
      query += ' AND name ILIKE $' + (params.length + 1);
      params.push(`%${name}%`);
    }

    const result = await db.query(query, params);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error searching doctors'
    });
  }
};

// Appointments
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    const patientId = req.user.id;

    // Check if doctor exists and is verified
    const doctorResult = await db.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2 AND is_verified = true',
      [doctorId, 'doctor']
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found or not verified'
      });
    }

    // Check if slot is available
    const slotResult = await db.query(
      'SELECT id FROM appointments WHERE doctor_id = $1 AND date = $2 AND time = $3 AND status != $4',
      [doctorId, date, time, 'cancelled']
    );

    if (slotResult.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'This slot is not available'
      });
    }

    // Book appointment
    const result = await db.query(
      'INSERT INTO appointments (patient_id, doctor_id, date, time, reason, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [patientId, doctorId, date, time, reason, 'pending']
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error booking appointment'
    });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const result = await db.query(
      `SELECT a.*, u.name as doctor_name, u.specialty 
       FROM appointments a 
       JOIN users u ON a.doctor_id = u.id 
       WHERE a.patient_id = $1 
       ORDER BY a.date DESC, a.time DESC`,
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
      message: 'Error fetching appointments'
    });
  }
};

const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const result = await db.query(
      `SELECT a.*, u.name as doctor_name, u.specialty 
       FROM appointments a 
       JOIN users u ON a.doctor_id = u.id 
       WHERE a.id = $1 AND a.patient_id = $2`,
      [id, patientId]
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

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const result = await db.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 AND patient_id = $3 AND status = $4 RETURNING *',
      ['cancelled', id, patientId, 'pending']
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
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error cancelling appointment'
    });
  }
};

// Medical Records
const getMyMedicalRecords = async (req, res) => {
  try {
    const patientId = req.user.id;
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
      message: 'Error fetching medical records'
    });
  }
};

const getMedicalRecordDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const result = await db.query(
      'SELECT * FROM medical_records WHERE id = $1 AND patient_id = $2',
      [id, patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Medical record not found'
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
      message: 'Error fetching medical record details'
    });
  }
};

const getMyPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id;
    const result = await db.query(
      `SELECT p.*, u.name as doctor_name 
       FROM prescriptions p 
       JOIN users u ON p.doctor_id = u.id 
       WHERE p.patient_id = $1 
       ORDER BY p.created_at DESC`,
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
      message: 'Error fetching prescriptions'
    });
  }
};

// Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT id, name, email, phone, address, blood_group, allergies FROM users WHERE id = $1',
      [userId]
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
    const userId = req.user.id;
    const { name, phone, address, blood_group, allergies } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           blood_group = COALESCE($4, blood_group),
           allergies = COALESCE($5, allergies)
       WHERE id = $6
       RETURNING id, name, email, phone, address, blood_group, allergies`,
      [name, phone, address, blood_group, allergies, userId]
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
  listDoctors,
  getDoctorDetails,
  searchDoctors,
  bookAppointment,
  getMyAppointments,
  getAppointmentDetails,
  cancelAppointment,
  getMyMedicalRecords,
  getMedicalRecordDetails,
  getMyPrescriptions,
  getProfile,
  updateProfile
}; 