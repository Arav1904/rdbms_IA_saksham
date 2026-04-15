const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const count = await pool.query(`SELECT COUNT(*) FROM Appointments`);
    const { rows } = await pool.query(`
      SELECT a.*, p.name AS pet_name, p.breed,
             pcp.name AS provider_name, pcp.visiting_fee
      FROM Appointments a
      JOIN Pets p ON a.pet_id = p.pet_id
      JOIN Pet_Care_Providers pcp ON a.provider_id = pcp.provider_id
      ORDER BY a.appointment_date DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    res.json({ appointments: rows, total: parseInt(count.rows[0].count), page: +page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { appointment_id, appointment_date, service_type, duration_mins, notes, pet_id, provider_id } = req.body;
    await pool.query(`
      INSERT INTO Appointments (appointment_id,appointment_date,service_type,duration_mins,notes,pet_id,provider_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `, [appointment_id, appointment_date, service_type, duration_mins, notes, pet_id, provider_id]);
    res.status(201).json({ message: 'Appointment scheduled', appointment_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM Appointments WHERE appointment_id=$1`, [req.params.id]);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
