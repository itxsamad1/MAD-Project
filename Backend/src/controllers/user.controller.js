const { validationResult } = require('express-validator');
const db = require('../config/database');
const { logger } = require('../utils/logger');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, phone, address, blood_group, allergies, specialty, experience, education, bio, rating, is_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { name, phone, address, blood_group, allergies, specialty, experience, education, bio } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           blood_group = COALESCE($4, blood_group),
           allergies = COALESCE($5, allergies),
           specialty = COALESCE($6, specialty),
           experience = COALESCE($7, experience),
           education = COALESCE($8, education),
           bio = COALESCE($9, bio),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING id, name, email, role, phone, address, blood_group, allergies, specialty, experience, education, bio, rating, is_verified`,
      [name, phone, address, blood_group, allergies, specialty, experience, education, bio, req.user.id]
    );

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile'
    });
  }
};

// Get doctor list (for patients)
const getDoctors = async (req, res) => {
  try {
    const { specialty, rating } = req.query;
    let query = `
      SELECT id, name, specialty, experience, education, bio, rating, is_verified 
      FROM users 
      WHERE role = 'doctor' AND is_active = true
    `;
    const params = [];

    if (specialty) {
      params.push(specialty);
      query += ` AND specialty = $${params.length}`;
    }

    if (rating) {
      params.push(parseFloat(rating));
      query += ` AND rating >= $${params.length}`;
    }

    query += ' ORDER BY rating DESC, experience DESC';

    const result = await db.query(query, params);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    logger.error('Get doctors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctors'
    });
  }
};

// Get doctor details
const getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, name, specialty, experience, education, bio, rating, is_verified 
       FROM users 
       WHERE id = $1 AND role = 'doctor' AND is_active = true`,
      [id]
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
  } catch (error) {
    logger.error('Get doctor details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctor details'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDoctors,
  getDoctorDetails
}; 