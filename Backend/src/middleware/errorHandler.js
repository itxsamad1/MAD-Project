const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden'
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found'
    });
  }

  // Default to 500 server error
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
};

module.exports = errorHandler; 