const db = require('../config/db');

// Users Management
const getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = 'SELECT id, name, email, role, created_at, is_active FROM users';
    const params = [];

    if (role) {
      query += params.length === 0 ? ' WHERE' : ' AND';
      query += ' role = $' + (params.length + 1);
      params.push(role);
    }

    if (status) {
      query += params.length === 0 ? ' WHERE' : ' AND';
      query += ' is_active = $' + (params.length + 1);
      params.push(status === 'active');
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users'
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT u.*, 
              COUNT(DISTINCT a.id) as total_appointments,
              COUNT(DISTINCT p.id) as total_prescriptions
       FROM users u
       LEFT JOIN appointments a ON u.id = a.patient_id OR u.id = a.doctor_id
       LEFT JOIN prescriptions p ON u.id = p.patient_id OR u.id = p.doctor_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
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
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user details'
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await db.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, role, is_active',
      [isActive, id]
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
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error updating user status'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userCheck = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Don't allow deleting other admins
    if (userCheck.rows[0].role === 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot delete admin users'
      });
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting user'
    });
  }
};

// Doctor Verification
const getPendingDoctors = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, specialty, experience, education 
       FROM users 
       WHERE role = 'doctor' AND is_verified = false 
       ORDER BY created_at ASC`,
      []
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching pending doctors'
    });
  }
};

const verifyDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE users 
       SET is_verified = true 
       WHERE id = $1 AND role = 'doctor' 
       RETURNING id, name, email, specialty`,
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
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error verifying doctor'
    });
  }
};

// Analytics
const getUserAnalytics = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'patient' THEN 1 END) as total_patients,
        COUNT(CASE WHEN role = 'doctor' THEN 1 END) as total_doctors,
        COUNT(CASE WHEN role = 'doctor' AND is_verified = true THEN 1 END) as verified_doctors,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_30_days
      FROM users
    `);

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user analytics'
    });
  }
};

const getAppointmentAnalytics = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as appointments_last_30_days,
        COUNT(CASE WHEN date >= NOW() AND status = 'pending' THEN 1 END) as upcoming_appointments
      FROM appointments
    `);

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointment analytics'
    });
  }
};

const getRevenueAnalytics = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN amount END), 0) as revenue_last_30_days,
        COALESCE(AVG(amount), 0) as average_appointment_revenue
      FROM payments
      WHERE status = 'completed'
    `);

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching revenue analytics'
    });
  }
};

// Notifications
const sendNotification = async (req, res) => {
  try {
    const { title, message, userIds, role } = req.body;

    let targetUsers = [];
    if (userIds && userIds.length > 0) {
      const userResult = await db.query(
        'SELECT id FROM users WHERE id = ANY($1)',
        [userIds]
      );
      targetUsers = userResult.rows.map(user => user.id);
    } else if (role) {
      const roleResult = await db.query(
        'SELECT id FROM users WHERE role = $1',
        [role]
      );
      targetUsers = roleResult.rows.map(user => user.id);
    }

    // Insert notifications for each target user
    await Promise.all(
      targetUsers.map(userId =>
        db.query(
          'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
          [userId, title, message]
        )
      )
    );

    res.json({
      status: 'success',
      message: `Notification sent to ${targetUsers.length} users`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error sending notification'
    });
  }
};

const getNotificationHistory = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, u.name as user_name, u.role as user_role
       FROM notifications n
       JOIN users u ON n.user_id = u.id
       ORDER BY n.created_at DESC
       LIMIT 100`
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching notification history'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getPendingDoctors,
  verifyDoctor,
  getUserAnalytics,
  getAppointmentAnalytics,
  getRevenueAnalytics,
  sendNotification,
  getNotificationHistory
}; 