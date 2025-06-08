const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://medi_connect_db_owner:npg_pQB7TbYi3wjf@ep-white-poetry-a10s43ts-pooler.ap-southeast-1.aws.neon.tech/medi_connect_db?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

const initializeDatabase = async () => {
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);
    console.log('Schema created successfully');

    // Create default admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await pool.query(
      `INSERT INTO users (name, email, password, role, is_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ['Admin', 'admin@mediconnect.com', hashedPassword, 'admin', true, true]
    );

    console.log('Default admin user created successfully');
    console.log('Admin credentials:');
    console.log('Email: admin@mediconnect.com');
    console.log('Password: admin123');

    await pool.end();
    console.log('Database initialization completed');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initializeDatabase(); 