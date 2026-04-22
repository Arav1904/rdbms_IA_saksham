const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let clause = '';
    if (status) { params.push(status); clause = `WHERE aa.status = $1`; }
    const count = await pool.query(`SELECT COUNT(*) FROM Adoption_Applications aa ${clause}`, params);
    params.push(limit); params.push(offset);
    const { rows } = await pool.query(`
      SELECT aa.*,
             p.name AS pet_name, p.breed, p.adoption_status AS pet_status,
             ad.first_name || ' ' || ad.last_name AS adopter_name, ad.phone, ad.email
      FROM Adoption_Applications aa
      JOIN Pets p    ON aa.pet_id    = p.pet_id
      JOIN Adopters ad ON aa.adopter_id = ad.adopter_id
      ${clause}
      ORDER BY aa.application_date DESC
      LIMIT $${params.length-1} OFFSET $${params.length}
    `, params);
    res.json({ applications: rows, total: parseInt(count.rows[0].count), page: +page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { application_id, application_date, adopter_id, pet_id, notes } = req.body;
    // Check pet availability
    const pet = await pool.query(`SELECT adoption_status FROM Pets WHERE pet_id=$1`, [pet_id]);
    if (!pet.rows.length) return res.status(404).json({ error: 'Pet not found' });
    if (pet.rows[0].adoption_status === 'Adopted')
      return res.status(400).json({ error: 'Pet is already adopted' });

    const adopter = await pool.query(`SELECT 1 FROM Adopters WHERE adopter_id=$1`, [adopter_id]);
    if (!adopter.rows.length) return res.status(404).json({ error: 'Adopter not found' });

    await pool.query(`
      INSERT INTO Adoption_Applications (application_id,application_date,adopter_id,pet_id,notes)
      VALUES ($1,COALESCE($2, CURRENT_DATE),$3,$4,$5)
    `, [application_id, application_date, adopter_id, pet_id, notes || null]);
    res.status(201).json({ message: 'Application submitted', application_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending','Approved','Rejected'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    const result = await pool.query(`
      UPDATE Adoption_Applications SET status=$1 WHERE application_id=$2
    `, [status, req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: `Application ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM Adoption_Applications WHERE application_id=$1`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
