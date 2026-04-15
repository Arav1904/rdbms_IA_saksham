const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.*, ad.first_name || ' ' || ad.last_name AS donor_name
      FROM Donation d
      LEFT JOIN Adopters ad ON d.adopter_id = ad.adopter_id
      ORDER BY d.donation_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { donation_id, amount, purpose, payment_mode, adopter_id } = req.body;
    await pool.query(`
      INSERT INTO Donation (donation_id,amount,purpose,payment_mode,adopter_id)
      VALUES ($1,$2,$3,$4,$5)
    `, [donation_id, amount, purpose, payment_mode, adopter_id || null]);
    res.status(201).json({ message: 'Donation recorded', donation_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
