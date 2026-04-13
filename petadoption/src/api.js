import { query, withTransaction } from './db.js';
import {
  dashboardStats,
  entityList,
  entities as baseEntities,
  relationships,
  triggerMeta,
  viewsMeta,
} from './entities.js';

const SKIP = Symbol('skip');

const viewQueries = {
  availablePets: 'SELECT * FROM Available_Pets ORDER BY pet_id',
  pendingApplications: 'SELECT * FROM Pending_Applications_View ORDER BY application_id',
  appointmentHistory: 'SELECT * FROM Pet_Appointment_History ORDER BY appointment_date DESC',
};

const optionQueries = {
  'pets.shelter_id': `
    SELECT shelter_id AS value,
           shelter_id || ' - ' || shelter_name AS label
    FROM Shelter
    ORDER BY shelter_id
  `,
  'pets.species': null,
  'pets.pet_id': null,
  'adopters.adopter_id': `
    SELECT adopter_id AS value,
           adopter_id || ' - ' || first_name || ' ' || last_name AS label
    FROM Adopters
    ORDER BY adopter_id
  `,
  'applications.adopter_id': `
    SELECT adopter_id AS value,
           adopter_id || ' - ' || first_name || ' ' || last_name AS label
    FROM Adopters
    ORDER BY adopter_id
  `,
  'applications.pet_id': `
    SELECT pet_id AS value,
           pet_id || ' - ' || name || ' (' || adoption_status || ')' AS label
    FROM Pets
    ORDER BY pet_id
  `,
  'appointments.pet_id': `
    SELECT pet_id AS value,
           pet_id || ' - ' || name || ' (' || adoption_status || ')' AS label
    FROM Pets
    WHERE adoption_status <> 'Adopted'
    ORDER BY pet_id
  `,
  'appointments.provider_id': `
    SELECT provider_id AS value,
           provider_id || ' - ' || name AS label
    FROM Pet_Care_Providers
    ORDER BY provider_id
  `,
  'applications.status': null,
  'appointments.service_type': null,
  'medical.pet_id': `
    SELECT pet_id AS value,
           pet_id || ' - ' || name AS label
    FROM Pets
    ORDER BY pet_id
  `,
  'medical.provider_id': `
    SELECT v.provider_id AS value,
           v.provider_id || ' - ' || p.name AS label
    FROM Veterinarian v
    JOIN Pet_Care_Providers p ON v.provider_id = p.provider_id
    ORDER BY v.provider_id
  `,
  'providers.provider_id': `
    SELECT provider_id AS value,
           provider_id || ' - ' || name AS label
    FROM Pet_Care_Providers
    ORDER BY provider_id
  `,
  'staff.staff_id': `
    SELECT staff_id AS value,
           staff_id || ' - ' || name AS label
    FROM Staff
    ORDER BY staff_id
  `,
  'donations.adopter_id': `
    SELECT adopter_id AS value,
           adopter_id || ' - ' || first_name || ' ' || last_name AS label
    FROM Adopters
    ORDER BY adopter_id
  `,
  'training.program_id': `
    SELECT program_id AS value,
           program_id || ' - ' || program_name AS label
    FROM Training_Programs
    ORDER BY program_id
  `,
  'shelters.shelter_id': `
    SELECT shelter_id AS value,
           shelter_id || ' - ' || shelter_name AS label
    FROM Shelter
    ORDER BY shelter_id
  `,
  'dogs.pet_id': `
    SELECT d.pet_id AS value,
           d.pet_id || ' - ' || p.name AS label
    FROM Dog d
    JOIN Pets p ON d.pet_id = p.pet_id
    ORDER BY d.pet_id
  `,
  'cats.pet_id': `
    SELECT c.pet_id AS value,
           c.pet_id || ' - ' || p.name AS label
    FROM Cat c
    JOIN Pets p ON c.pet_id = p.pet_id
    ORDER BY c.pet_id
  `,
  'other-animals.pet_id': `
    SELECT o.pet_id AS value,
           o.pet_id || ' - ' || p.name AS label
    FROM Other_Animal o
    JOIN Pets p ON o.pet_id = p.pet_id
    ORDER BY o.pet_id
  `,
  'pet-photos.pet_id': `
    SELECT pet_id AS value,
           pet_id || ' - ' || name AS label
    FROM Pets
    ORDER BY pet_id
  `,
  'individuals.adopter_id': `
    SELECT adopter_id AS value,
           adopter_id || ' - ' || first_name || ' ' || last_name AS label
    FROM Adopters
    ORDER BY adopter_id
  `,
  'organizations.adopter_id': `
    SELECT adopter_id AS value,
           adopter_id || ' - ' || first_name || ' ' || last_name AS label
    FROM Adopters
    ORDER BY adopter_id
  `,
  'veterinarians.provider_id': `
    SELECT provider_id AS value,
           provider_id || ' - ' || name AS label
    FROM Pet_Care_Providers
    ORDER BY provider_id
  `,
  'groomers.provider_id': `
    SELECT provider_id AS value,
           provider_id || ' - ' || name AS label
    FROM Pet_Care_Providers
    ORDER BY provider_id
  `,
  'availability.provider_id': `
    SELECT provider_id AS value,
           provider_id || ' - ' || name AS label
    FROM Pet_Care_Providers
    ORDER BY provider_id
  `,
  'volunteers.staff_id': `
    SELECT staff_id AS value,
           staff_id || ' - ' || name AS label
    FROM Staff
    ORDER BY staff_id
  `,
  'employees.staff_id': `
    SELECT staff_id AS value,
           staff_id || ' - ' || name AS label
    FROM Staff
    ORDER BY staff_id
  `,
  'staff-pet.staff_id': `
    SELECT staff_id AS value,
           staff_id || ' - ' || name AS label
    FROM Staff
    ORDER BY staff_id
  `,
  'staff-pet.pet_id': `
    SELECT pet_id AS value,
           pet_id || ' - ' || name AS label
    FROM Pets
    ORDER BY pet_id
  `,
  'dog-training.pet_id': `
    SELECT d.pet_id AS value,
           d.pet_id || ' - ' || p.name AS label
    FROM Dog d
    JOIN Pets p ON d.pet_id = p.pet_id
    ORDER BY d.pet_id
  `,
  'dog-training.program_id': `
    SELECT program_id AS value,
           program_id || ' - ' || program_name AS label
    FROM Training_Programs
    ORDER BY program_id
  `,
};

const specialSpecs = {
  pets: {
    key: 'pets',
    table: 'Pets',
    title: 'Pets',
    subtitle: 'Main adoption catalogue with shelter assignment and species subclasses.',
    route: '/pets',
    icon: 'bi-paw',
    pk: ['pet_id'],
    fields: [
      { name: 'pet_id', label: 'Pet ID', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'breed', label: 'Breed', type: 'text' },
      { name: 'age', label: 'Age', type: 'number' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
      { name: 'weight_kg', label: 'Weight (kg)', type: 'number' },
      { name: 'intake_date', label: 'Intake Date', type: 'date' },
      { name: 'adoption_status', label: 'Adoption Status', type: 'select', options: ['Available', 'Reserved', 'Adopted'] },
      { name: 'microchip_id', label: 'Microchip ID', type: 'text' },
      { name: 'is_vaccinated', label: 'Vaccinated', type: 'checkbox' },
      { name: 'shelter_id', label: 'Shelter', type: 'select' },
    ],
    formExtras: [
      { name: 'species', label: 'Species', type: 'select', options: ['Dog', 'Cat', 'Other'] },
      { name: 'size', label: 'Dog Size', type: 'select', options: ['Small', 'Medium', 'Large'] },
      { name: 'is_trained', label: 'Dog Trained', type: 'checkbox' },
      { name: 'is_indoor', label: 'Cat Indoor', type: 'checkbox' },
      { name: 'fur_length', label: 'Cat Fur Length', type: 'select', options: ['Short', 'Medium', 'Long'] },
      { name: 'species_name', label: 'Other Animal Species', type: 'text' },
    ],
    searchColumns: ['p.pet_id', 'p.name', 'p.breed', 'p.gender', 'p.adoption_status', 's.shelter_name'],
    list: {
      select: `
        p.*,
        s.shelter_name,
        CASE
          WHEN d.pet_id IS NOT NULL THEN 'Dog'
          WHEN c.pet_id IS NOT NULL THEN 'Cat'
          WHEN o.pet_id IS NOT NULL THEN 'Other Animal'
          ELSE 'Unassigned'
        END AS species,
        (SELECT COUNT(*)::int FROM Adoption_Applications aa WHERE aa.pet_id = p.pet_id) AS application_count,
        (SELECT COUNT(*)::int FROM Appointments a WHERE a.pet_id = p.pet_id) AS appointment_count,
        (SELECT COUNT(*)::int FROM Pet_Photos ph WHERE ph.pet_id = p.pet_id) AS photo_count
      `,
      from: 'Pets p',
      joins: `
        LEFT JOIN Shelter s ON p.shelter_id = s.shelter_id
        LEFT JOIN Dog d ON p.pet_id = d.pet_id
        LEFT JOIN Cat c ON p.pet_id = c.pet_id
        LEFT JOIN Other_Animal o ON p.pet_id = o.pet_id
      `,
      orderBy: 'p.pet_id',
    },
  },
  adopters: {
    key: 'adopters',
    table: 'Adopters',
    title: 'Adopters',
    subtitle: 'Overlapping adopter subclasses for individuals and organizations.',
    route: '/adopters',
    icon: 'bi-people',
    pk: ['adopter_id'],
    fields: [
      { name: 'adopter_id', label: 'Adopter ID', type: 'text', required: true },
      { name: 'first_name', label: 'First Name', type: 'text', required: true },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'dob', label: 'Date of Birth', type: 'date' },
      { name: 'id_proof', label: 'ID Proof', type: 'text' },
    ],
    formExtras: [
      { name: 'is_individual', label: 'Individual', type: 'checkbox' },
      { name: 'occupation', label: 'Occupation', type: 'text' },
      { name: 'is_org', label: 'Organization', type: 'checkbox' },
      { name: 'org_reg_no', label: 'Organization Registration No.', type: 'text' },
    ],
    searchColumns: ['a.adopter_id', 'a.first_name', 'a.last_name', 'a.email', 'a.phone'],
    list: {
      select: `
        a.*,
        CASE
          WHEN i.adopter_id IS NOT NULL AND o.adopter_id IS NOT NULL THEN 'Individual + Organization'
          WHEN i.adopter_id IS NOT NULL THEN 'Individual'
          WHEN o.adopter_id IS NOT NULL THEN 'Organization'
          ELSE 'None'
        END AS subclass,
        (SELECT COUNT(*)::int FROM Adoption_Applications ap WHERE ap.adopter_id = a.adopter_id) AS application_count,
        (SELECT COUNT(*)::int FROM References_Table r WHERE r.adopter_id = a.adopter_id) AS reference_count,
        (SELECT COUNT(*)::int FROM Donation d WHERE d.adopter_id = a.adopter_id) AS donation_count
      `,
      from: 'Adopters a',
      joins: `
        LEFT JOIN Individual i ON a.adopter_id = i.adopter_id
        LEFT JOIN Organization o ON a.adopter_id = o.adopter_id
      `,
      orderBy: 'a.adopter_id',
    },
  },
  applications: {
    key: 'applications',
    table: 'Adoption_Applications',
    title: 'Adoption Applications',
    subtitle: 'Weak entity linking adopters and pets with trigger-driven approval.',
    route: '/applications',
    icon: 'bi-file-earmark-check',
    pk: ['application_id'],
    fields: [
      { name: 'application_id', label: 'Application ID', type: 'text', required: true },
      { name: 'application_date', label: 'Application Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'adopter_id', label: 'Adopter', type: 'select', required: true },
      { name: 'pet_id', label: 'Pet', type: 'select', required: true },
    ],
    searchColumns: ['aa.application_id', 'aa.status', 'aa.notes', 'p.name', 'ad.first_name', 'ad.last_name'],
    list: {
      select: `
        aa.*,
        p.name AS pet_name,
        p.breed,
        p.adoption_status AS pet_status,
        ad.first_name || ' ' || ad.last_name AS adopter_name
      `,
      from: 'Adoption_Applications aa',
      joins: `
        JOIN Pets p ON aa.pet_id = p.pet_id
        JOIN Adopters ad ON aa.adopter_id = ad.adopter_id
      `,
      orderBy: 'aa.application_date DESC, aa.application_id DESC',
    },
  },
  appointments: {
    key: 'appointments',
    table: 'Appointments',
    title: 'Appointments',
    subtitle: 'Weak entity linking pets and providers with an adopted-pet guard.',
    route: '/appointments',
    icon: 'bi-calendar-check',
    pk: ['appointment_id'],
    fields: [
      { name: 'appointment_id', label: 'Appointment ID', type: 'text', required: true },
      { name: 'appointment_date', label: 'Appointment Date', type: 'date', required: true },
      { name: 'service_type', label: 'Service Type', type: 'text', required: true },
      { name: 'duration_mins', label: 'Duration (mins)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'pet_id', label: 'Pet', type: 'select', required: true },
      { name: 'provider_id', label: 'Provider', type: 'select', required: true },
    ],
    searchColumns: ['a.appointment_id', 'a.service_type', 'a.notes', 'p.name', 'pcp.name'],
    list: {
      select: `
        a.*,
        p.name AS pet_name,
        p.adoption_status AS pet_status,
        pcp.name AS provider_name
      `,
      from: 'Appointments a',
      joins: `
        JOIN Pets p ON a.pet_id = p.pet_id
        JOIN Pet_Care_Providers pcp ON a.provider_id = pcp.provider_id
      `,
      orderBy: 'a.appointment_date DESC, a.appointment_id DESC',
    },
  },
};

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'TRUE' || value === 'on';
}

function normalizeInput(field, rawValue, present) {
  if (!present) {
    return SKIP;
  }

  if (field.type === 'checkbox') {
    return toBoolean(rawValue);
  }

  if (isEmpty(rawValue)) {
    return null;
  }

  if (field.type === 'number' || field.type === 'int') {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid numeric value for ${field.name}`);
    }
    return parsed;
  }

  if (field.type === 'date') {
    return String(rawValue).slice(0, 10);
  }

  return String(rawValue).trim();
}

function formatMoney(value) {
  const amount = Number(value ?? 0);
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function normalizeStatValue(stat, value) {
  if (stat.money) {
    return { value: Number(value ?? 0), formatted: formatMoney(value) };
  }

  if (typeof value === 'string' && value !== '' && !Number.isNaN(Number(value))) {
    return { value: Number(value) };
  }

  return { value };
}

function mergeEntitySpec(key) {
  const base = baseEntities[key] ?? {};
  const override = specialSpecs[key] ?? {};
  const fields = override.fields ?? base.fields ?? [];
  const formExtras = override.formExtras ?? base.formExtras ?? [];
  const searchColumns = override.searchColumns ?? base.searchColumns ?? fields.map((field) => field.name);

  return {
    ...base,
    ...override,
    key,
    table: override.table ?? base.table,
    title: override.title ?? base.title ?? key,
    subtitle: override.subtitle ?? base.subtitle ?? '',
    route: override.route ?? base.route ?? `/${key}`,
    icon: override.icon ?? base.icon ?? 'bi-table',
    pk: override.pk ?? base.pk ?? [],
    fields,
    formExtras,
    searchColumns,
    list: override.list ?? base.list ?? {
      select: '*',
      from: override.table ?? base.table ?? key,
      joins: '',
      orderBy: (override.pk ?? base.pk ?? [])[0] ?? '',
    },
    optionSql: override.optionSql ?? base.optionSql ?? {},
  };
}

export const entitySpecs = Object.fromEntries(
  Object.keys(baseEntities).map((key) => [key, mergeEntitySpec(key)]),
);

export function getEntitySpec(key) {
  const spec = entitySpecs[key];
  if (!spec) {
    const error = new Error(`Unknown entity: ${key}`);
    error.status = 404;
    throw error;
  }
  return spec;
}

function entitySummary(spec, count = null) {
  return {
    key: spec.key,
    title: spec.title,
    subtitle: spec.subtitle,
    route: spec.route,
    icon: spec.icon,
    table: spec.table,
    pk: spec.pk,
    count,
  };
}

export async function getApiMeta() {
  return {
    app: 'Pet Adoption and Care System',
    database: 'PostgreSQL',
    entities: entityList.map((entity) => entitySummary(entitySpecs[entity.key] ?? entity)),
    views: viewsMeta.map((view) => ({
      ...view,
      dataRoute: `/api/views/${view.key}`,
    })),
    relationships,
    triggers: triggerMeta,
  };
}

export async function getDashboardPayload() {
  const statResults = await Promise.all(
    dashboardStats.map(async (stat) => {
      const result = await query(stat.query);
      const value = result.rows[0]?.value ?? 0;
      return {
        key: stat.key,
        label: stat.label,
        accent: stat.accent,
        money: Boolean(stat.money),
        ...normalizeStatValue(stat, value),
      };
    }),
  );

  const entityCounts = await Promise.all(
    entityList.map(async (entity) => {
      const spec = entitySpecs[entity.key] ?? entity;
      const result = await query(`SELECT COUNT(*)::int AS count FROM ${spec.table}`);
      return entitySummary(spec, result.rows[0]?.count ?? 0);
    }),
  );

  return {
    stats: statResults,
    entities: entityCounts,
    relationships,
    triggers: triggerMeta,
    views: viewsMeta.map((view) => ({
      ...view,
      dataRoute: `/api/views/${view.key}`,
      rowCount: null,
    })),
  };
}

function buildListSpec(spec) {
  const list = spec.list ?? {};
  return {
    select: list.select ?? '*',
    from: list.from ?? spec.table,
    joins: list.joins ?? '',
    orderBy: list.orderBy ?? (spec.pk?.length ? spec.pk.join(', ') : ''),
    searchColumns: spec.searchColumns ?? [],
  };
}

function buildSearchClause(searchColumns, searchValue, params) {
  if (!searchValue || !searchColumns.length) {
    return '';
  }

  params.push(`%${searchValue}%`);
  const position = params.length;
  return `WHERE (${searchColumns.map((column) => `${column}::text ILIKE $${position}`).join(' OR ')})`;
}

function buildOrdering(orderBy, sort, direction) {
  const safeSort = typeof sort === 'string' && /^[A-Za-z0-9_.]+$/.test(sort) ? sort : '';

  if (safeSort) {
    const safeDirection = String(direction ?? 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    return `ORDER BY ${safeSort} ${safeDirection}`;
  }

  if (orderBy) {
    return `ORDER BY ${orderBy}`;
  }

  return '';
}

export async function listEntityRows(key, options = {}) {
  const spec = getEntitySpec(key);
  const list = buildListSpec(spec);
  const limit = Math.min(Math.max(Number(options.limit ?? 50) || 50, 1), 500);
  const offset = Math.max(Number(options.offset ?? 0) || 0, 0);
  const searchValue = String(options.search ?? options.searchVal ?? '').trim();
  const params = [];
  const where = buildSearchClause(list.searchColumns, searchValue, params);
  const orderClause = buildOrdering(list.orderBy, options.sort, options.direction);

  const baseSql = `
    FROM ${list.from}
    ${list.joins}
    ${where}
  `;

  const countResult = await query(`SELECT COUNT(*)::int AS count ${baseSql}`, params);
  const count = countResult.rows[0]?.count ?? 0;

  params.push(limit);
  params.push(offset);
  const limitIndex = params.length - 1;
  const offsetIndex = params.length;
  const rowsResult = await query(
    `
      SELECT ${list.select}
      ${baseSql}
      ${orderClause}
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    params,
  );

  return {
    entity: entitySummary(spec, count),
    count,
    limit,
    offset,
    rows: rowsResult.rows,
  };
}

export async function getEntityRecord(key, criteria) {
  const spec = getEntitySpec(key);
  const pkColumns = spec.pk ?? [];
  if (!pkColumns.length) {
    const error = new Error(`Entity ${key} does not define a primary key`);
    error.status = 400;
    throw error;
  }

  const values = [];
  const conditions = pkColumns.map((column, index) => {
    const value = criteria[column];
    if (isEmpty(value)) {
      const error = new Error(`Missing primary key value for ${column}`);
      error.status = 400;
      throw error;
    }
    values.push(value);
    return `${column} = $${index + 1}`;
  });

  const result = await query(`SELECT * FROM ${spec.table} WHERE ${conditions.join(' AND ')} LIMIT 1`, values);
  return result.rows[0] ?? null;
}

function collectFieldPayload(spec, body, mode) {
  const payload = {};
  for (const field of spec.fields ?? []) {
    if (field.readonly || (mode === 'create' && field.readonly_on_add) || (mode === 'update' && field.readonly_on_edit)) {
      continue;
    }

    const present = Object.prototype.hasOwnProperty.call(body, field.name);
    const normalized = normalizeInput(field, body[field.name], present);
    if (normalized === SKIP) {
      if (mode === 'create' && field.required) {
        const error = new Error(`Missing required field: ${field.name}`);
        error.status = 400;
        throw error;
      }
      continue;
    }

    if (field.required && normalized === null) {
      const error = new Error(`Missing required field: ${field.name}`);
      error.status = 400;
      throw error;
    }

    payload[field.name] = normalized;
  }
  return payload;
}

function collectPkCriteria(spec, body) {
  const pk = {};
  for (const column of spec.pk ?? []) {
    if (!Object.prototype.hasOwnProperty.call(body, column)) {
      const error = new Error(`Missing primary key value: ${column}`);
      error.status = 400;
      throw error;
    }
    pk[column] = body[column];
  }
  return pk;
}

function buildInsertStatement(spec, data) {
  const entries = Object.entries(data);
  if (!entries.length) {
    const error = new Error(`No writable fields were provided for ${spec.key}`);
    error.status = 400;
    throw error;
  }

  const columns = entries.map(([column]) => column);
  const values = entries.map(([, value]) => value);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

  return {
    text: `INSERT INTO ${spec.table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    values,
  };
}

function buildUpdateStatement(spec, data, pk) {
  const entries = Object.entries(data);
  if (!entries.length) {
    const error = new Error(`No updatable fields were provided for ${spec.key}`);
    error.status = 400;
    throw error;
  }

  const columns = entries.map(([column]) => column);
  const values = entries.map(([, value]) => value);
  const pkColumns = spec.pk ?? [];
  const conditions = pkColumns.map((column, index) => {
    values.push(pk[column]);
    return `${column} = $${columns.length + index + 1}`;
  });

  return {
    text: `UPDATE ${spec.table} SET ${columns.map((column, index) => `${column} = $${index + 1}`).join(', ')} WHERE ${conditions.join(' AND ')} RETURNING *`,
    values,
    changedColumns: columns,
  };
}

function buildDeleteStatement(spec, pk) {
  const pkColumns = spec.pk ?? [];
  const values = pkColumns.map((column) => pk[column]);
  const conditions = pkColumns.map((column, index) => `${column} = $${index + 1}`);

  return {
    text: `DELETE FROM ${spec.table} WHERE ${conditions.join(' AND ')} RETURNING *`,
    values,
  };
}

function buildSqlPreview(spec, changedColumns, pk) {
  const updates = changedColumns.map((column) => `${column} = ...`).join(', ');
  const where = (spec.pk ?? []).map((column) => `${column} = '${pk[column]}'`).join(' AND ');
  return `UPDATE ${spec.table} SET ${updates} WHERE ${where};`;
}

async function createPetTransaction(client, body) {
  const spec = getEntitySpec('pets');
  const mainData = collectFieldPayload(spec, body, 'create');
  const species = String(body.species ?? 'Dog').trim() || 'Dog';

  const insert = buildInsertStatement(spec, mainData);
  const mainResult = await client.query(insert.text, insert.values);
  const mainRow = mainResult.rows[0];
  let subclass = null;

  if (species === 'Dog') {
    const dogSize = isEmpty(body.size) ? 'Medium' : String(body.size).trim();
    const isTrained = toBoolean(body.is_trained);
    const result = await client.query(
      `INSERT INTO Dog (pet_id, size, is_trained) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *`,
      [mainRow.pet_id, dogSize, isTrained],
    );
    subclass = result.rows[0] ?? { pet_id: mainRow.pet_id, size: dogSize, is_trained: isTrained };
  } else if (species === 'Cat') {
    const isIndoor = Object.prototype.hasOwnProperty.call(body, 'is_indoor') ? toBoolean(body.is_indoor) : true;
    const furLength = isEmpty(body.fur_length) ? 'Short' : String(body.fur_length).trim();
    const result = await client.query(
      `INSERT INTO Cat (pet_id, is_indoor, fur_length) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *`,
      [mainRow.pet_id, isIndoor, furLength],
    );
    subclass = result.rows[0] ?? { pet_id: mainRow.pet_id, is_indoor: isIndoor, fur_length: furLength };
  } else {
    const speciesName = String(body.species_name ?? '').trim();
    if (!speciesName) {
      const error = new Error('species_name is required when species is Other');
      error.status = 400;
      throw error;
    }
    const result = await client.query(
      `INSERT INTO Other_Animal (pet_id, species_name) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
      [mainRow.pet_id, speciesName],
    );
    subclass = result.rows[0] ?? { pet_id: mainRow.pet_id, species_name: speciesName };
  }

  return { row: mainRow, extra: { species, subclass } };
}

async function createAdopterTransaction(client, body) {
  const spec = getEntitySpec('adopters');
  const mainData = collectFieldPayload(spec, body, 'create');
  const insert = buildInsertStatement(spec, mainData);
  const mainResult = await client.query(insert.text, insert.values);
  const mainRow = mainResult.rows[0];
  const extras = [];

  if (toBoolean(body.is_individual)) {
    const occupation = isEmpty(body.occupation) ? null : String(body.occupation).trim();
    const result = await client.query(
      `INSERT INTO Individual (adopter_id, occupation) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
      [mainRow.adopter_id, occupation],
    );
    extras.push({ kind: 'Individual', row: result.rows[0] ?? { adopter_id: mainRow.adopter_id, occupation } });
  }

  if (toBoolean(body.is_org)) {
    const orgRegNo = String(body.org_reg_no ?? '').trim();
    if (!orgRegNo) {
      const error = new Error('org_reg_no is required when organization is selected');
      error.status = 400;
      throw error;
    }
    const result = await client.query(
      `INSERT INTO Organization (adopter_id, org_reg_no) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
      [mainRow.adopter_id, orgRegNo],
    );
    extras.push({ kind: 'Organization', row: result.rows[0] ?? { adopter_id: mainRow.adopter_id, org_reg_no: orgRegNo } });
  }

  return { row: mainRow, extra: extras };
}

function buildGenericMutation(specKey, body, mode) {
  const spec = getEntitySpec(specKey);
  const payload = collectFieldPayload(spec, body, mode);
  const pk = collectPkCriteria(spec, body);
  if (mode === 'create') {
    return { spec, payload, pk };
  }
  return { spec, payload, pk };
}

export async function createEntityRecord(key, body) {
  if (key === 'pets') {
    return withTransaction((client) => createPetTransaction(client, body));
  }

  if (key === 'adopters') {
    return withTransaction((client) => createAdopterTransaction(client, body));
  }

  const spec = getEntitySpec(key);
  const payload = collectFieldPayload(spec, body, 'create');
  const insert = buildInsertStatement(spec, payload);
  const result = await query(insert.text, insert.values);
  return {
    row: result.rows[0],
    extra: null,
  };
}

export async function updateEntityRecord(key, body) {
  const spec = getEntitySpec(key);
  const payload = collectFieldPayload(spec, body, 'update');
  const pk = collectPkCriteria(spec, body);
  const before = await getEntityRecord(key, pk);
  if (!before) {
    const error = new Error(`No ${key} row found for the supplied primary key`);
    error.status = 404;
    throw error;
  }

  const update = buildUpdateStatement(spec, payload, pk);
  const result = await query(update.text, update.values);
  const after = result.rows[0] ?? null;
  return {
    before,
    after,
    sqlPreview: buildSqlPreview(spec, update.changedColumns, pk),
    entity: entitySummary(spec),
  };
}

export async function deleteEntityRecord(key, body) {
  const spec = getEntitySpec(key);
  const pk = collectPkCriteria(spec, body);
  const deleteStmt = buildDeleteStatement(spec, pk);
  const result = await query(deleteStmt.text, deleteStmt.values);
  return {
    deleted: Boolean(result.rows[0]),
    row: result.rows[0] ?? null,
    entity: entitySummary(spec),
  };
}

function resolveStaticOptions(spec, field) {
  if (Array.isArray(field.options)) {
    return field.options.map((option) => ({
      value: option,
      label: option,
    }));
  }

  if (field.options_sql) {
    return null;
  }

  if (spec.optionSql?.[field.name]) {
    return null;
  }

  if (optionQueries[`${spec.key}.${field.name}`]) {
    return null;
  }

  return [];
}

export async function listFieldOptions(key, fieldName, search = '') {
  const spec = getEntitySpec(key);
  const field = [...(spec.fields ?? []), ...(spec.formExtras ?? [])].find((item) => item.name === fieldName);
  if (!field) {
    const error = new Error(`Unknown field ${fieldName} for entity ${key}`);
    error.status = 404;
    throw error;
  }

  const staticOptions = resolveStaticOptions(spec, field);
  if (staticOptions) {
    return {
      entity: entitySummary(spec),
      field: field.name,
      options: search
        ? staticOptions.filter((option) => `${option.label} ${option.value}`.toLowerCase().includes(search.toLowerCase()))
        : staticOptions,
      source: 'static',
    };
  }

  const sql = field.options_sql ?? spec.optionSql?.[field.name] ?? optionQueries[`${spec.key}.${field.name}`];
  if (!sql) {
    const error = new Error(`No option source configured for ${key}.${fieldName}`);
    error.status = 404;
    throw error;
  }

  const result = await query(sql);
  const options = result.rows.map((row) => ({
    value: row.value,
    label: row.label ?? row.value,
  }));

  return {
    entity: entitySummary(spec),
    field: field.name,
    options: search
      ? options.filter((option) => `${option.label} ${option.value}`.toLowerCase().includes(search.toLowerCase()))
      : options,
    source: 'sql',
  };
}

export async function listViewRows(key) {
  const meta = viewsMeta.find((view) => view.key === key);
  if (!meta) {
    const error = new Error(`Unknown view: ${key}`);
    error.status = 404;
    throw error;
  }

  const sql = viewQueries[key];
  if (!sql) {
    const error = new Error(`No data query registered for view ${key}`);
    error.status = 500;
    throw error;
  }

  const result = await query(sql);
  return {
    view: {
      ...meta,
      dataRoute: `/api/views/${meta.key}`,
    },
    rows: result.rows,
    count: result.rows.length,
  };
}

export function listEntitySummaries() {
  return entityList.map((entity) => {
    const spec = entitySpecs[entity.key] ?? entity;
    return {
      ...entitySummary(spec),
    };
  });
}

export function listViewSummaries() {
  return viewsMeta.map((view) => ({
    ...view,
    dataRoute: `/api/views/${view.key}`,
  }));
}

export function listTriggerSummaries() {
  return triggerMeta;
}

export function listRelationshipSummaries() {
  return relationships;
}

export function listDashboardStats() {
  return dashboardStats;
}
