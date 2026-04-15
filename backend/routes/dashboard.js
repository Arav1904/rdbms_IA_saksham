const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/dashboard/stats — summary cards
router.get('/stats', async (req, res) => {
  try {
    const [pets, adopters, apps, donations, appointments] = await Promise.all([
      pool.query(`SELECT
        COUNT(*) FILTER (WHERE adoption_status = 'Available') AS available,
        COUNT(*) FILTER (WHERE adoption_status = 'Adopted')   AS adopted,
        COUNT(*) FILTER (WHERE adoption_status = 'Reserved')  AS reserved,
        COUNT(*) AS total
        FROM Pets`),
      pool.query(`SELECT COUNT(*) AS total FROM Adopters`),
      pool.query(`SELECT
        COUNT(*) FILTER (WHERE status = 'Pending')  AS pending,
        COUNT(*) FILTER (WHERE status = 'Approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected
        FROM Adoption_Applications`),
      pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM Donation`),
      pool.query(`SELECT COUNT(*) AS total FROM Appointments`)
    ]);

    res.json({
      pets:         pets.rows[0],
      adopters:     adopters.rows[0],
      applications: apps.rows[0],
      donations:    donations.rows[0],
      appointments: appointments.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/breed-distribution — pie chart
router.get('/breed-distribution', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT breed, COUNT(*) AS count
      FROM Pets
      WHERE breed IS NOT NULL
      GROUP BY breed
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/status-over-time — line chart
router.get('/monthly-intakes', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT TO_CHAR(intake_date,'Mon YYYY') AS month,
             COUNT(*) AS count,
             DATE_TRUNC('month', intake_date) AS sort_date
      FROM Pets
      GROUP BY month, sort_date
      ORDER BY sort_date
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/donation-breakdown — bar chart
router.get('/donation-breakdown', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT payment_mode, COALESCE(SUM(amount),0) AS total, COUNT(*) AS count
      FROM Donation
      WHERE payment_mode IS NOT NULL
      GROUP BY payment_mode
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/recent-activity — activity feed
router.get('/recent-activity', async (req, res) => {
  try {
    const apps = await pool.query(`
      SELECT 'Application' AS type,
             aa.application_date AS date,
             ad.first_name || ' ' || ad.last_name AS actor,
             p.name AS subject, aa.status AS detail
      FROM Adoption_Applications aa
      JOIN Adopters ad ON aa.adopter_id = ad.adopter_id
      JOIN Pets p      ON aa.pet_id     = p.pet_id
      ORDER BY aa.application_date DESC LIMIT 5
    `);
    const apts = await pool.query(`
      SELECT 'Appointment' AS type,
             a.appointment_date AS date,
             pcp.name AS actor,
             p.name AS subject, a.service_type AS detail
      FROM Appointments a
      JOIN Pets p                ON a.pet_id      = p.pet_id
      JOIN Pet_Care_Providers pcp ON a.provider_id = pcp.provider_id
      ORDER BY a.appointment_date DESC LIMIT 5
    `);
    const combined = [...apps.rows, ...apts.rows]
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
