const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://medi_connect_db_owner:npg_pQB7TbYi3wjf@ep-white-poetry-a10s43ts-pooler.ap-southeast-1.aws.neon.tech/medi_connect_db?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Connected to Neon PostgreSQL database');
  });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 