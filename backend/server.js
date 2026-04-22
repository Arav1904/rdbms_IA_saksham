const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const frontendDir = path.join(__dirname, '../frontend');
const frontendPages = {
  '/': 'login.html',
  '/login': 'login.html',
  '/dashboard': 'index.html',
  '/index': 'index.html',
  '/pets': 'pets.html',
  '/adopters': 'adopters.html',
  '/applications': 'applications.html',
  '/appointments': 'appointments.html',
  '/providers': 'providers.html',
  '/staff': 'staff.html',
};

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/pets',          require('./routes/pets'));
app.use('/api/adopters',      require('./routes/adopters'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/providers',     require('./routes/providers'));
app.use('/api/staff',         require('./routes/staff'));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: err.message || 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ── Frontend routes ──────────────────────────────────────────
for (const [routePath, fileName] of Object.entries(frontendPages)) {
  app.get(routePath, (req, res) => {
    res.sendFile(path.join(frontendDir, fileName));
  });
}

// Redirect old file-based entry points to clean routes.
app.get('/index.html', (req, res) => res.redirect(302, '/dashboard'));
app.get('/login.html', (req, res) => res.redirect(302, '/login'));

// Keep existing file-based links working for the remaining pages.
app.get('/:page.html', (req, res, next) => {
  if (req.params.page === 'index' || req.params.page === 'login') {
    return next();
  }

  const filePath = path.join(frontendDir, `${req.params.page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) next();
  });
});

app.use(express.static(frontendDir, { index: false }));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.status(404).sendFile(path.join(frontendDir, 'login.html'));
});

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`  Paws Shelter API running on http://localhost:${PORT}`);
  pool.query('SELECT 1')
    .then(() => console.log(' Database ready'))
    .catch((err) => console.error(` Database unavailable: ${err.message || 'Database connection failed'}`));
});
