const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token or no token provided'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      status: 'error',
      message: 'Access forbidden'
    });
  }

  // Default error
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

module.exports = {
  errorHandler
}; 