const { Pool } = require('pg');
const { logger } = require('../utils/logger');

if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon database connection
  },
  connectionTimeoutMillis: 5000, // 5 seconds
  query_timeout: 10000 // 10 seconds
});

pool.on('connect', () => {
  logger.info('Connected to the database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code
    }
  });
  process.exit(-1);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { 
      text, 
      duration, 
      rows: res.rowCount 
    });
    return res;
  } catch (err) {
    logger.error('Error executing query', {
      text,
      error: {
        message: err.message,
        stack: err.stack,
        code: err.code
      }
    });
    throw err;
  }
};

module.exports = {
  query,
  pool
}; 