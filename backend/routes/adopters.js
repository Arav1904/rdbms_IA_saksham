const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let clause = '';
    if (search) {
      params.push(`%${search}%`);
      clause = `WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1`;
    }
    const count  = await pool.query(`SELECT COUNT(*) FROM Adopters ${clause}`, params);
    params.push(limit); params.push(offset);
    const { rows } = await pool.query(`
      SELECT a.*,
             i.occupation,
             o.org_reg_no,
             (SELECT COUNT(*) FROM Adoption_Applications aa WHERE aa.adopter_id = a.adopter_id) AS app_count,
             (SELECT COALESCE(SUM(amount),0) FROM Donation d WHERE d.adopter_id = a.adopter_id) AS total_donated
      FROM Adopters a
      LEFT JOIN Individual i    ON a.adopter_id = i.adopter_id
      LEFT JOIN Organization o  ON a.adopter_id = o.adopter_id
      ${clause}
      ORDER BY a.adopter_id
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);
    res.json({ adopters: rows, total: parseInt(count.rows[0].count), page: +page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, i.occupation, o.org_reg_no
      FROM Adopters a
      LEFT JOIN Individual i   ON a.adopter_id = i.adopter_id
      LEFT JOIN Organization o ON a.adopter_id = o.adopter_id
      WHERE a.adopter_id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const refs = await pool.query(`SELECT * FROM References_Table WHERE adopter_id=$1`, [req.params.id]);
    const apps = await pool.query(`
      SELECT aa.*, p.name AS pet_name, p.breed FROM Adoption_Applications aa
      JOIN Pets p ON aa.pet_id = p.pet_id WHERE aa.adopter_id=$1
      ORDER BY aa.application_date DESC
    `, [req.params.id]);
    const dons = await pool.query(`SELECT * FROM Donation WHERE adopter_id=$1 ORDER BY donation_date DESC`, [req.params.id]);

    res.json({ ...rows[0], references: refs.rows, applications: apps.rows, donations: dons.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { adopter_id, first_name, last_name, email, phone, address, dob, id_proof,
            type, occupation, org_reg_no } = req.body;

    await client.query(`
      INSERT INTO Adopters (adopter_id,first_name,last_name,email,phone,address,dob,id_proof)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    `, [adopter_id, first_name, last_name, email, phone, address, dob, id_proof]);

    if (type === 'Individual' || !type) {
      await client.query(`INSERT INTO Individual (adopter_id,occupation) VALUES ($1,$2)`,
        [adopter_id, occupation]);
    }
    if (type === 'Organization') {
      await client.query(`INSERT INTO Organization (adopter_id,org_reg_no) VALUES ($1,$2)`,
        [adopter_id, org_reg_no]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Adopter registered', adopter_id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address } = req.body;
    await pool.query(`
      UPDATE Adopters SET first_name=$1,last_name=$2,email=$3,phone=$4,address=$5
      WHERE adopter_id=$6
    `, [first_name, last_name, email, phone, address, req.params.id]);
    res.json({ message: 'Adopter updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM Adopters WHERE adopter_id=$1`, [req.params.id]);
    res.json({ message: 'Adopter deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
