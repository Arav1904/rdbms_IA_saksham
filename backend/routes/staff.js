const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.*,
             v.hours_per_week,
             e.salary, e.emp_id,
             CASE WHEN v.staff_id IS NOT NULL THEN 'Volunteer'
                  WHEN e.staff_id IS NOT NULL THEN 'Employee'
                  ELSE 'Unknown' END AS staff_type,
             (SELECT COUNT(*) FROM Staff_Pet sp WHERE sp.staff_id=s.staff_id) AS pets_cared
      FROM Staff s
      LEFT JOIN Volunteer v ON s.staff_id = v.staff_id
      LEFT JOIN Employee e  ON s.staff_id = e.staff_id
      ORDER BY s.name
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
    const { staff_id, name, role, shift, type, hours_per_week, salary, emp_id } = req.body;
    await client.query(`INSERT INTO Staff (staff_id,name,role,shift) VALUES ($1,$2,$3,$4)`,
      [staff_id, name, role, shift]);
    if (type === 'Volunteer') {
      await client.query(`INSERT INTO Volunteer (staff_id,hours_per_week) VALUES ($1,$2)`,
        [staff_id, hours_per_week]);
    } else if (type === 'Employee') {
      await client.query(`INSERT INTO Employee (staff_id,salary,emp_id) VALUES ($1,$2,$3)`,
        [staff_id, salary, emp_id]);
    }
    await client.query('COMMIT');
    res.status(201).json({ message: 'Staff added', staff_id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
