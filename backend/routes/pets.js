const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/pets — list with filters
router.get('/', async (req, res) => {
  try {
    const { status, gender, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const where  = [];

    if (status) { params.push(status);  where.push(`p.adoption_status = $${params.length}`); }
    if (gender) { params.push(gender);  where.push(`p.gender = $${params.length}`); }
    if (search) { params.push(`%${search}%`); where.push(`(p.name ILIKE $${params.length} OR p.breed ILIKE $${params.length})`); }

    const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countQ = await pool.query(`SELECT COUNT(*) FROM Pets p ${clause}`, params);
    const total  = parseInt(countQ.rows[0].count);

    params.push(limit); params.push(offset);
    const { rows } = await pool.query(`
      SELECT p.*,
             d.size, d.is_trained,
             c.is_indoor, c.fur_length,
             o.species_name,
             s.shelter_name
      FROM Pets p
      LEFT JOIN Dog d ON p.pet_id = d.pet_id
      LEFT JOIN Cat c ON p.pet_id = c.pet_id
      LEFT JOIN Other_Animal o ON p.pet_id = o.pet_id
      LEFT JOIN Shelter s ON p.shelter_id = s.shelter_id
      ${clause}
      ORDER BY p.intake_date DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json({ pets: rows, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pets/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*,
             d.size, d.is_trained,
             c.is_indoor, c.fur_length,
             o.species_name,
             s.shelter_name, s.address AS shelter_address
      FROM Pets p
      LEFT JOIN Dog d ON p.pet_id = d.pet_id
      LEFT JOIN Cat c ON p.pet_id = c.pet_id
      LEFT JOIN Other_Animal o ON p.pet_id = o.pet_id
      LEFT JOIN Shelter s ON p.shelter_id = s.shelter_id
      WHERE p.pet_id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Pet not found' });

    // Also get medical records
    const med = await pool.query(`
      SELECT mr.*, pcp.name AS vet_name
      FROM Medical_Records mr
      LEFT JOIN Pet_Care_Providers pcp ON mr.provider_id = pcp.provider_id
      WHERE mr.pet_id = $1
      ORDER BY mr.record_date DESC
    `, [req.params.id]);

    // And appointments
    const apts = await pool.query(`
      SELECT a.*, pcp.name AS provider_name
      FROM Appointments a
      JOIN Pet_Care_Providers pcp ON a.provider_id = pcp.provider_id
      WHERE a.pet_id = $1
      ORDER BY a.appointment_date DESC
    `, [req.params.id]);

    res.json({ ...rows[0], medical_records: med.rows, appointments: apts.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pets — create
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      pet_id, name, breed, age, gender, weight_kg, intake_date,
      adoption_status, microchip_id, is_vaccinated, shelter_id,
      // type-specific
      type, size, is_trained, is_indoor, fur_length, species_name
    } = req.body;

    await client.query(`
      INSERT INTO Pets (pet_id,name,breed,age,gender,weight_kg,intake_date,
        adoption_status,microchip_id,is_vaccinated,shelter_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `, [pet_id, name, breed, age, gender, weight_kg, intake_date,
        adoption_status || 'Available', microchip_id, is_vaccinated || false, shelter_id]);

    if (type === 'Dog') {
      await client.query(`INSERT INTO Dog (pet_id,size,is_trained) VALUES ($1,$2,$3)`,
        [pet_id, size, is_trained || false]);
    } else if (type === 'Cat') {
      await client.query(`INSERT INTO Cat (pet_id,is_indoor,fur_length) VALUES ($1,$2,$3)`,
        [pet_id, is_indoor !== undefined ? is_indoor : true, fur_length]);
    } else if (type === 'Other') {
      await client.query(`INSERT INTO Other_Animal (pet_id,species_name) VALUES ($1,$2)`,
        [pet_id, species_name]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Pet added successfully', pet_id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/pets/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, breed, age, gender, weight_kg, adoption_status, is_vaccinated } = req.body;
    await pool.query(`
      UPDATE Pets SET name=$1,breed=$2,age=$3,gender=$4,
        weight_kg=$5,adoption_status=$6,is_vaccinated=$7
      WHERE pet_id=$8
    `, [name, breed, age, gender, weight_kg, adoption_status, is_vaccinated, req.params.id]);
    res.json({ message: 'Pet updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/pets/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM Pets WHERE pet_id=$1`, [req.params.id]);
    res.json({ message: 'Pet deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
