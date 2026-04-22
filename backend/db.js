require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { Pool } = require('pg');

function getErrorMessage(err) {
  if (!err) return 'Unknown database error';
  if (typeof err.message === 'string' && err.message.trim()) return err.message.trim();
  if (Array.isArray(err.errors) && err.errors.length) {
    const nested = err.errors
      .map((item) => item && (item.message || item.code))
      .filter(Boolean)
      .join('; ');
    if (nested) return nested;
  }
  if (typeof err.code === 'string' && err.code.trim()) return err.code.trim();
  if (err.name === 'AggregateError') return 'Database connection failed';
  return 'Database query failed';
}

const poolConfig = {
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'pet_adoption_db',
  user:     process.env.DB_USER || 'sakshamtyagi',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Only add password if it's actually set (allows trust/peer auth without password)
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim()) {
  poolConfig.password = process.env.DB_PASSWORD.trim();
}

const pool = new Pool(poolConfig);

pool.on('connect', () => console.log(' DB connected'));
pool.on('error', (err) => console.error('DB error:', getErrorMessage(err)));

const originalQuery = pool.query.bind(pool);
pool.query = async (...args) => {
  try {
    return await originalQuery(...args);
  } catch (err) {
    err.message = getErrorMessage(err);
    throw err;
  }
};

const originalConnect = pool.connect.bind(pool);
pool.connect = async (...args) => {
  try {
    return await originalConnect(...args);
  } catch (err) {
    err.message = getErrorMessage(err);
    throw err;
  }
};

module.exports = pool;
