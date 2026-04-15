require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/pets',          require('./routes/pets'));
app.use('/api/adopters',      require('./routes/adopters'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/providers',     require('./routes/providers'));
app.use('/api/staff',         require('./routes/staff'));
app.use('/api/donations',     require('./routes/donations'));
app.use('/api/medical',       require('./routes/medical'));
app.use('/api/training',      require('./routes/training'));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
  console.log(`🐾  Paws Shelter API running on http://localhost:${PORT}`);
});
