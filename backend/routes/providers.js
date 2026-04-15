const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT pcp.*,
             v.vet_license_no, v.specialization,
             g.tools_used, g.grooming_styles,
             (SELECT STRING_AGG(day_of_week,', ') FROM Provider_Availability pa WHERE pa.provider_id=pcp.provider_id) AS availability,
             (SELECT COUNT(*) FROM Appointments a WHERE a.provider_id=pcp.provider_id) AS appointment_count
      FROM Pet_Care_Providers pcp
      LEFT JOIN Veterinarian v ON pcp.provider_id = v.provider_id
      LEFT JOIN Groomer g      ON pcp.provider_id = g.provider_id
      ORDER BY pcp.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { provider_id, name, qualification, phone, email, visiting_fee,
            type, vet_license_no, specialization, tools_used, grooming_styles } = req.body;

    await client.query(`
      INSERT INTO Pet_Care_Providers (provider_id,name,qualification,phone,email,visiting_fee)
      VALUES ($1,$2,$3,$4,$5,$6)
    `, [provider_id, name, qualification, phone, email, visiting_fee]);

    if (type === 'Veterinarian') {
      await client.query(`INSERT INTO Veterinarian (provider_id,vet_license_no,specialization) VALUES ($1,$2,$3)`,
        [provider_id, vet_license_no, specialization]);
    } else if (type === 'Groomer') {
      await client.query(`INSERT INTO Groomer (provider_id,tools_used,grooming_styles) VALUES ($1,$2,$3)`,
        [provider_id, tools_used, grooming_styles]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Provider added', provider_id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
