const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin only.'
    });
  }
  next();
};

const isDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Doctor only.'
    });
  }
  next();
};

const isPatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Patient only.'
    });
  }
  next();
};

const isDoctorOrAdmin = (req, res, next) => {
  if (!['doctor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Doctor or Admin only.'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isDoctor,
  isPatient,
  isDoctorOrAdmin
}; 