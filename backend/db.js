require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'pet_adoption_db',
  user:     process.env.DB_USER     || 'postgres',
  password: String(process.env.DB_PASSWORD),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => console.log('✅ DB connected'));
pool.on('error', (err) => console.error('DB error:', err.message));

module.exports = pool;