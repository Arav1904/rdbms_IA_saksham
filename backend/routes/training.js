const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT tp.*,
             COUNT(dt.pet_id) AS enrolled_dogs
      FROM Training_Programs tp
      LEFT JOIN Dog_Training dt ON tp.program_id = dt.program_id
      GROUP BY tp.program_id
      ORDER BY tp.program_name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/dogs', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.pet_id, p.name, p.breed, d.size, d.is_trained
      FROM Dog_Training dt
      JOIN Pets p ON dt.pet_id = p.pet_id
      JOIN Dog d  ON dt.pet_id = d.pet_id
      WHERE dt.program_id = $1
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
