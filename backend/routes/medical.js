const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT mr.*, p.name AS pet_name, p.breed, pcp.name AS vet_name
      FROM Medical_Records mr
      JOIN Pets p ON mr.pet_id = p.pet_id
      LEFT JOIN Pet_Care_Providers pcp ON mr.provider_id = pcp.provider_id
      ORDER BY mr.record_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { record_date, diagnosis, treatment, follow_up_date, cost, pet_id, provider_id } = req.body;
    const { rows } = await pool.query(`
      INSERT INTO Medical_Records (record_date,diagnosis,treatment,follow_up_date,cost,pet_id,provider_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING record_id
    `, [record_date, diagnosis, treatment, follow_up_date || null, cost, pet_id, provider_id || null]);
    res.status(201).json({ message: 'Record added', record_id: rows[0].record_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
