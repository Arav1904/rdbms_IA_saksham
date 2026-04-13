import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { query, pool } from './db.js';
import {
  createEntityRecord,
  deleteEntityRecord,
  getApiMeta,
  getDashboardPayload,
  getEntityRecord,
  getEntitySpec,
  listEntityRows,
  listEntitySummaries,
  listFieldOptions,
  listRelationshipSummaries,
  listTriggerSummaries,
  listViewRows,
  listViewSummaries,
  updateEntityRecord,
} from './api.js';
import { dashboardStats, entities, entityGroups, entityList, triggerMeta, viewsMeta } from './entities.js';
import { getOptionsQuery } from './options.js';
import {
  actionBar,
  card,
  dataTable,
  flashMessage,
  formField,
  renderDashboard,
  renderKeyValueTable,
  shell,
  sqlBlock,
} from './render.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const flashStore = new Map();
const updateStore = new Map();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public'), { index: false }));

app.get('/PROJECT_GUIDE.md', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'PROJECT_GUIDE.md'));
});

function consumeStore(store, token) {
  if (!token || !store.has(token)) return null;
  const value = store.get(token);
  store.delete(token);
  return value;
}

function stash(store, payload) {
  const token = crypto.randomUUID();
  store.set(token, payload);
  return token;
}

function withFlash(req) {
  return consumeStore(flashStore, req.query.flash);
}

function redirectWithFlash(res, to, flash) {
  const token = stash(flashStore, flash);
  res.redirect(`${to}${to.includes('?') ? '&' : '?'}flash=${token}`);
}

function page(res, req, config) {
  res.send(shell({ ...config, flash: withFlash(req), currentPath: req.path }));
}

function safeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function apiErrorPayload(error) {
  return {
    error: error.message,
    code: error.code ?? null,
  };
}

function normalizeRecordCriteria(spec, source) {
  if (spec.pk.length === 1 && source.id !== undefined) {
    return { [spec.pk[0]]: source.id };
  }

  return Object.fromEntries(spec.pk.map((field) => [field, source[field]]));
}

function renderCell(value, column) {
  if (value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (column === 'status') {
    return `<span class="status-pill status-pill--${safeHtml(String(value).toLowerCase())}">${safeHtml(value)}</span>`;
  }
  if (column.includes('id')) {
    return `<code>${safeHtml(value)}</code>`;
  }
  return safeHtml(value);
}

function rowToHtml(row, columns) {
  return Object.fromEntries(columns.map((column) => [column, renderCell(row[column], column)]));
}

function buildWhereClause(pkFields, values, startIndex = 1) {
  const clauses = pkFields.map((field, index) => `"${field}" = $${index + startIndex}`);
  return {
    text: clauses.join(' AND '),
    values: pkFields.map((field) => values[field]),
  };
}

function normalizeCheckbox(raw) {
  return raw === 'on' || raw === 'true' || raw === '1' || raw === true;
}

function readField(field, body) {
  if (field.type === 'checkbox') return normalizeCheckbox(body[field.name]);
  const value = body[field.name];
  return value === undefined ? null : String(value).trim();
}

function mutationSqlValue(field, value) {
  if (field.type === 'checkbox') return value;
  if (value === null || value === '') return null;
  if (field.type === 'number' || field.type === 'int') return Number(value);
  return value;
}

async function getOptions(entityKey, fieldName) {
  const text = getOptionsQuery(entityKey, fieldName);
  if (!text) return [];
  const result = await query(text);
  return result.rows;
}

async function buildFormFields(entityKey, fields, record = {}, mode = 'add') {
  const built = [];
  for (const field of fields) {
    const isReadonly = (mode === 'add' && field.readonly_on_add) || (mode === 'edit' && field.readonly_on_edit) || field.readonly;
    if (mode === 'add' && field.skipOnAdd) continue;
    const builtField = {
      ...field,
      readonly: isReadonly,
      value: record[field.name] ?? '',
      checked: field.type === 'checkbox' ? Boolean(record[field.name]) : false,
    };
    if (field.type === 'select') {
      builtField.options = field.options
        ? field.options.map((option) => ({ value: option, label: option }))
        : await getOptions(entityKey, field.name);
    }
    built.push(builtField);
  }
  return built;
}

function layoutActions(route, extra = []) {
  return actionBar([`<a class="button button--solid" href="${route}?action=add">Add Row</a>`, ...extra]);
}

async function fetchCounts() {
  const stats = {};
  for (const stat of dashboardStats) {
    const result = await query(stat.query);
    stats[stat.key] = result.rows[0]?.value ?? 0;
  }
  for (const entity of entityList) {
    const result = await query(`SELECT COUNT(*)::int AS count FROM ${entity.table}`);
    stats[entity.key] = result.rows[0].count;
  }
  return stats;
}

async function renderHome(req, res) {
  const counts = await fetchCounts();
  page(res, req, {
    title: 'Dashboard',
    pageTitle: 'Dashboard',
    pageSubtitle: 'Same PostgreSQL schema and parity-focused CRUD flows, now served through a vanilla HTML and JavaScript runtime.',
    body: renderDashboard(counts),
  });
}

async function renderViewsPage(req, res) {
  const sections = [];
  for (const view of viewsMeta) {
    const rows = (await query(`SELECT * FROM ${view.title} ORDER BY 1 DESC NULLS LAST`)).rows;
    const columns = rows[0] ? Object.keys(rows[0]) : view.sql.match(/SELECT([\s\S]*?)FROM/) ? [] : [];
    sections.push(
      card(
        view.title,
        `${sqlBlock(view.sql)}${dataTable(
          columns,
          rows.map((row) => rowToHtml(row, columns)),
        )}`,
      ),
    );
  }

  const auditRows = (await query('SELECT * FROM Application_Audit ORDER BY logged_at DESC LIMIT 10')).rows;
  const auditColumns = auditRows[0] ? Object.keys(auditRows[0]) : [];
  sections.push(
    card(
      'Trigger Summary',
      `<div class="trigger-grid">${triggerMeta
        .map(
          (trigger) => `<article class="mini-card">
            <h3>${safeHtml(trigger.name)}</h3>
            <p>${safeHtml(trigger.fires)}</p>
            <small>${safeHtml(trigger.behavior)}</small>
          </article>`,
        )
        .join('')}</div>${auditColumns.length ? `<div class="spacer-sm"></div>${dataTable(auditColumns, auditRows.map((row) => rowToHtml(row, auditColumns)))}` : ''}`,
    ),
  );

  page(res, req, {
    title: 'Views & Triggers',
    pageTitle: 'Views, Triggers, And Audit Records',
    pageSubtitle: 'Live PostgreSQL views and trigger behavior preserved from the legacy application.',
    body: sections.join(''),
  });
}

async function renderUpdateResult(req, res) {
  const payload = consumeStore(updateStore, req.query.token);
  if (!payload) {
    redirectWithFlash(res, '/', flashMessage('warning', 'That update snapshot is no longer available.'));
    return;
  }

  const beforeRows = Object.entries(payload.before).map(([field, value]) => ({
    field,
    value: safeHtml(value ?? '—'),
  }));
  const afterRows = Object.entries(payload.after).map(([field, value]) => ({
    field,
    value: safeHtml(value ?? '—'),
    changed: payload.before[field] !== value,
  }));

  page(res, req, {
    title: 'Update Result',
    pageTitle: `Updated ${payload.recordLabel}`,
    pageSubtitle: `Before and after comparison for ${payload.entityName}.`,
    body: `<section class="compare-grid">
      <article class="panel"><div class="panel__header"><h2>Before</h2></div><div class="panel__body">${beforeRows
        .map((row) => `<div class="compare-row"><strong>${safeHtml(row.field)}</strong><span>${row.value}</span></div>`)
        .join('')}</div></article>
      <article class="panel"><div class="panel__header"><h2>After</h2></div><div class="panel__body">${afterRows
        .map(
          (row) =>
            `<div class="compare-row ${row.changed ? 'compare-row--changed' : ''}"><strong>${safeHtml(row.field)}</strong><span>${row.value}${row.changed ? ' <em>changed</em>' : ''}</span></div>`,
        )
        .join('')}</div></article>
    </section>
    ${card('SQL Executed', sqlBlock(payload.sql), `<a class="button button--ghost" href="${payload.backUrl}">Back</a>`)}
    `,
  });
}

async function renderGenericList(req, res, entity) {
  const rows = (await query(`SELECT * FROM ${entity.table} ORDER BY 1`)).rows;
  const columns = rows[0] ? Object.keys(rows[0]) : entity.fields.map((field) => field.name);
  const relatedSections = await renderRelatedSections(entity.key);

  page(res, req, {
    title: entity.title,
    pageTitle: entity.title,
    pageSubtitle: entity.subtitle,
    body: `${layoutActions(entity.route)}${card(
      entity.table,
      dataTable(
        columns,
        rows.map((row) => rowToHtml(row, columns)),
        (row) => {
          const params = new URLSearchParams();
          entity.pk.forEach((field) => params.set(field, row[field]));
          return `<a class="button button--small button--ghost" href="${entity.route}?action=edit&${params.toString()}">Edit</a>
            <a class="button button--small button--danger" href="${entity.route}?action=delete&${params.toString()}">Delete</a>`;
        },
      ),
    )}${relatedSections}`,
  });
}

async function renderRelatedSections(entityKey) {
  if (entityKey === 'providers') {
    const vets = (await query("SELECT v.*, pcp.name FROM Veterinarian v JOIN Pet_Care_Providers pcp ON v.provider_id = pcp.provider_id ORDER BY v.provider_id")).rows;
    const groomers = (await query("SELECT g.*, pcp.name FROM Groomer g JOIN Pet_Care_Providers pcp ON g.provider_id = pcp.provider_id ORDER BY g.provider_id")).rows;
    const groups = [
      ['Veterinarian subclass', vets, '/veterinarians'],
      ['Groomer subclass', groomers, '/groomers'],
    ];
    return `<section class="split-grid">${groups
      .map(([title, rows, route]) => {
        const columns = rows[0] ? Object.keys(rows[0]) : [];
        return card(title, dataTable(columns, rows.map((row) => rowToHtml(row, columns))), `<a class="button button--ghost" href="${route}">Open</a>`);
      })
      .join('')}</section>`;
  }

  if (entityKey === 'staff') {
    const volunteers = (await query("SELECT v.*, s.name FROM Volunteer v JOIN Staff s ON v.staff_id = s.staff_id ORDER BY v.staff_id")).rows;
    const employees = (await query("SELECT e.*, s.name FROM Employee e JOIN Staff s ON e.staff_id = s.staff_id ORDER BY e.staff_id")).rows;
    const pairs = (await query("SELECT sp.*, s.name AS staff_name, p.name AS pet_name FROM Staff_Pet sp JOIN Staff s ON sp.staff_id = s.staff_id JOIN Pets p ON sp.pet_id = p.pet_id ORDER BY sp.staff_id, sp.pet_id")).rows;
    const pairColumns = pairs[0] ? Object.keys(pairs[0]) : [];
    return `<section class="split-grid">
      ${card(
        'Volunteer subclass',
        dataTable(volunteers[0] ? Object.keys(volunteers[0]) : [], volunteers.map((row) => rowToHtml(row, Object.keys(volunteers[0] || {})))),
        `<a class="button button--ghost" href="/volunteers">Open</a>`,
      )}
      ${card(
        'Employee subclass',
        dataTable(employees[0] ? Object.keys(employees[0]) : [], employees.map((row) => rowToHtml(row, Object.keys(employees[0] || {})))),
        `<a class="button button--ghost" href="/employees">Open</a>`,
      )}
    </section>${card('Staff_Pet junction table', dataTable(pairColumns, pairs.map((row) => rowToHtml(row, pairColumns))), `<a class="button button--ghost" href="/staff-pet">Open</a>`)}`;
  }

  if (entityKey === 'training') {
    const rows = (await query("SELECT dt.pet_id, p.name AS dog_name, dt.program_id, t.program_name FROM Dog_Training dt JOIN Dog d ON dt.pet_id = d.pet_id JOIN Pets p ON d.pet_id = p.pet_id JOIN Training_Programs t ON dt.program_id = t.program_id ORDER BY dt.pet_id, dt.program_id")).rows;
    const columns = rows[0] ? Object.keys(rows[0]) : [];
    return card('Dog_Training junction table', dataTable(columns, rows.map((row) => rowToHtml(row, columns))), `<a class="button button--ghost" href="/dog-training">Open</a>`);
  }

  return '';
}

async function renderGenericDelete(req, res, entity) {
  const keys = Object.fromEntries(entity.pk.map((field) => [field, req.query[field]]));
  const where = buildWhereClause(entity.pk, keys);
  const result = await query(`SELECT * FROM ${entity.table} WHERE ${where.text}`, where.values);
  const row = result.rows[0];
  if (!row) {
    redirectWithFlash(res, entity.route, flashMessage('warning', `${entity.title} row not found.`));
    return;
  }

  page(res, req, {
    title: `Delete ${entity.title}`,
    pageTitle: `Delete ${entity.title} Row`,
    pageSubtitle: `Confirm removal from ${entity.table}.`,
    body: `${card('Record Preview', renderKeyValueTable(row) + sqlBlock(`DELETE FROM ${entity.table} WHERE ${entity.pk.map((field) => `${field} = ?`).join(' AND ')};`), `<form method="post" action="${entity.route}?action=delete&${new URLSearchParams(keys).toString()}"><button class="button button--danger" type="submit">Delete Row</button></form><a class="button button--ghost" href="${entity.route}">Cancel</a>` )}`,
  });
}

async function handleGenericDelete(req, res, entity) {
  const keys = Object.fromEntries(entity.pk.map((field) => [field, req.query[field]]));
  const where = buildWhereClause(entity.pk, keys);
  await query(`DELETE FROM ${entity.table} WHERE ${where.text}`, where.values);
  redirectWithFlash(res, entity.route, flashMessage('success', `${entity.title} row deleted.`));
}

async function renderGenericForm(req, res, entity, mode) {
  let record = {};
  const original = {};
  if (mode === 'edit') {
    entity.pk.forEach((field) => {
      original[field] = req.query[field];
    });
    const where = buildWhereClause(entity.pk, original);
    const result = await query(`SELECT * FROM ${entity.table} WHERE ${where.text}`, where.values);
    record = result.rows[0] ?? {};
  }

  const fields = await buildFormFields(entity.key, entity.fields, record, mode);
  const hiddenOriginal = mode === 'edit'
    ? entity.pk.map((field) => `<input type="hidden" name="original_${field}" value="${safeHtml(original[field])}" />`).join('')
    : '';

  page(res, req, {
    title: `${mode === 'add' ? 'Add' : 'Edit'} ${entity.title}`,
    pageTitle: `${mode === 'add' ? 'Add' : 'Edit'} ${entity.title}`,
    pageSubtitle: entity.subtitle,
    body: card(
      `${entity.table} form`,
      `<form method="post" class="entity-form">${hiddenOriginal}${fields.map(formField).join('')}${sqlBlock(
        mode === 'add' ? `INSERT INTO ${entity.table} (...) VALUES (...);` : `UPDATE ${entity.table} SET ... WHERE ...;`,
      )}<div class="form-actions"><button class="button button--solid" type="submit">${mode === 'add' ? 'Create Row' : 'Save Changes'}</button><a class="button button--ghost" href="${entity.route}">Cancel</a></div></form>`,
    ),
  });
}

async function handleGenericMutation(req, res, entity, mode) {
  const fields = entity.fields.filter((field) => !(mode === 'add' && entity.serialPk && entity.pk.includes(field.name)));
  const values = Object.fromEntries(fields.map((field) => [field.name, mutationSqlValue(field, readField(field, req.body))]));

  if (mode === 'add') {
    const columns = Object.keys(values).filter((key) => values[key] !== null || !entity.pk.includes(key));
    const params = columns.map((_, index) => `$${index + 1}`);
    await query(
      `INSERT INTO ${entity.table} (${columns.join(', ')}) VALUES (${params.join(', ')})`,
      columns.map((column) => values[column]),
    );
    redirectWithFlash(res, entity.route, flashMessage('success', `${entity.title} row created.`));
    return;
  }

  const original = Object.fromEntries(entity.pk.map((field) => [field, req.body[`original_${field}`]]));
  const beforeWhere = buildWhereClause(entity.pk, original);
  const before = (await query(`SELECT * FROM ${entity.table} WHERE ${beforeWhere.text}`, beforeWhere.values)).rows[0] ?? {};
  const setColumns = Object.keys(values);
  const setSql = setColumns.map((column, index) => `${column} = $${index + 1}`).join(', ');
  const where = buildWhereClause(entity.pk, original, setColumns.length + 1);
  await query(`UPDATE ${entity.table} SET ${setSql} WHERE ${where.text}`, [...setColumns.map((column) => values[column]), ...where.values]);

  const afterKeys = Object.fromEntries(entity.pk.map((field) => [field, values[field] ?? original[field]]));
  const afterWhere = buildWhereClause(entity.pk, afterKeys);
  const after = (await query(`SELECT * FROM ${entity.table} WHERE ${afterWhere.text}`, afterWhere.values)).rows[0] ?? {};
  const token = stash(updateStore, {
    before,
    after,
    sql: `UPDATE ${entity.table} SET ${setColumns.join(', ')} WHERE ${entity.pk.join(', ')};`,
    entityName: entity.table,
    recordLabel: entity.title,
    backUrl: entity.route,
  });
  res.redirect(`/update-result?token=${token}`);
}

async function renderPetsList(req, res) {
  const allowed = new Set(['name', 'breed', 'adoption_status', 'gender', 'pet_id']);
  const column = allowed.has(req.query.col) ? req.query.col : 'name';
  const search = String(req.query.val ?? '').trim();
  const params = [];
  let where = '';
  if (search) {
    params.push(`%${search}%`);
    where = `WHERE p.${column}::text ILIKE $1`;
  }
  const rows = (
    await query(
      `SELECT p.*, s.shelter_name,
       CASE WHEN d.pet_id IS NOT NULL THEN 'Dog'
            WHEN c.pet_id IS NOT NULL THEN 'Cat'
            WHEN o.pet_id IS NOT NULL THEN 'Other'
            ELSE '—' END AS species
       FROM Pets p
       LEFT JOIN Shelter s ON p.shelter_id = s.shelter_id
       LEFT JOIN Dog d ON p.pet_id = d.pet_id
       LEFT JOIN Cat c ON p.pet_id = c.pet_id
       LEFT JOIN Other_Animal o ON p.pet_id = o.pet_id
       ${where}
       ORDER BY p.pet_id`,
      params,
    )
  ).rows;
  const columns = rows[0]
    ? Object.keys(rows[0])
    : ['pet_id', 'name', 'breed', 'age', 'gender', 'weight_kg', 'intake_date', 'adoption_status', 'microchip_id', 'is_vaccinated', 'shelter_id', 'shelter_name', 'species'];

  const filters = `<form class="inline-form" method="get" action="/pets">
    <select name="col"><option value="name" ${column === 'name' ? 'selected' : ''}>Name</option><option value="breed" ${column === 'breed' ? 'selected' : ''}>Breed</option><option value="adoption_status" ${column === 'adoption_status' ? 'selected' : ''}>Status</option><option value="gender" ${column === 'gender' ? 'selected' : ''}>Gender</option><option value="pet_id" ${column === 'pet_id' ? 'selected' : ''}>Pet ID</option></select>
    <input type="text" name="val" value="${safeHtml(search)}" placeholder="Search pets" />
    <button class="button button--ghost" type="submit">Filter</button>
    ${search ? '<a class="button button--ghost" href="/pets">Reset</a>' : ''}
  </form>`;

  page(res, req, {
    title: 'Pets',
    pageTitle: 'Pets',
    pageSubtitle: 'Main adoption catalogue with shelter assignment and Dog/Cat/Other specialization handling.',
    body: `${actionBar([`<a class="button button--solid" href="/pets?action=add">Add Pet</a>`, filters])}${card(
      'Pets',
      dataTable(columns, rows.map((row) => rowToHtml(row, columns)), (row) => `<a class="button button--small button--ghost" href="/pets?action=edit&id=${encodeURIComponent(row.pet_id)}">Edit</a><a class="button button--small button--danger" href="/pets?action=delete&id=${encodeURIComponent(row.pet_id)}">Delete</a>`),
    )}`,
  });
}

async function renderPetForm(req, res, mode) {
  const petId = req.query.id;
  let pet = {};
  if (mode === 'edit' && petId) {
    pet = (await query('SELECT * FROM Pets WHERE pet_id = $1', [petId])).rows[0] ?? {};
  }
  const shelters = await getOptions('pets', 'shelter_id');
  const species = pet.pet_id
    ? (await query("SELECT CASE WHEN EXISTS (SELECT 1 FROM Dog WHERE pet_id = $1) THEN 'Dog' WHEN EXISTS (SELECT 1 FROM Cat WHERE pet_id = $1) THEN 'Cat' WHEN EXISTS (SELECT 1 FROM Other_Animal WHERE pet_id = $1) THEN 'Other' ELSE 'Dog' END AS species", [pet.pet_id])).rows[0]?.species ?? 'Dog'
    : 'Dog';

  const form = [
    { name: 'pet_id', label: 'Pet ID', type: 'text', required: true, value: pet.pet_id ?? '', readonly: mode === 'edit' },
    { name: 'name', label: 'Name', type: 'text', required: true, value: pet.name ?? '' },
    { name: 'breed', label: 'Breed', type: 'text', value: pet.breed ?? '' },
    { name: 'age', label: 'Age', type: 'number', required: true, step: '1', value: pet.age ?? '' },
    { name: 'weight_kg', label: 'Weight (kg)', type: 'number', value: pet.weight_kg ?? '' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'].map((value) => ({ value, label: value })), value: pet.gender ?? '' },
    { name: 'adoption_status', label: 'Adoption Status', type: 'select', options: ['Available', 'Reserved', 'Adopted'].map((value) => ({ value, label: value })), value: pet.adoption_status ?? 'Available' },
    { name: 'intake_date', label: 'Intake Date', type: 'date', value: pet.intake_date ? String(pet.intake_date).slice(0, 10) : new Date().toISOString().slice(0, 10) },
    { name: 'microchip_id', label: 'Microchip ID', type: 'text', value: pet.microchip_id ?? '' },
    { name: 'shelter_id', label: 'Shelter', type: 'select', options: shelters, value: pet.shelter_id ?? '' },
    { name: 'is_vaccinated', label: 'Vaccinated', type: 'checkbox', checked: pet.is_vaccinated ?? false },
  ];

  const speciesSection =
    mode === 'add'
      ? `<section class="subclass-card" data-species-wrapper>
        <label class="field"><span>Species (Subclass)</span><select name="species" data-species-select>
          <option value="Dog" ${species === 'Dog' ? 'selected' : ''}>Dog</option>
          <option value="Cat" ${species === 'Cat' ? 'selected' : ''}>Cat</option>
          <option value="Other" ${species === 'Other' ? 'selected' : ''}>Other Animal</option>
        </select></label>
        <div data-species-panel="Dog">${formField({ name: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large'].map((value) => ({ value, label: value })), value: 'Medium' })}${formField({ name: 'is_trained', label: 'Is Trained', type: 'checkbox' })}</div>
        <div data-species-panel="Cat" hidden>${formField({ name: 'fur_length', label: 'Fur Length', type: 'select', options: ['Short', 'Medium', 'Long'].map((value) => ({ value, label: value })), value: 'Short' })}${formField({ name: 'is_indoor', label: 'Indoor', type: 'checkbox', checked: true })}</div>
        <div data-species-panel="Other" hidden>${formField({ name: 'species_name', label: 'Species Name', type: 'text', value: '' })}</div>
      </section>`
      : '';

  page(res, req, {
    title: `${mode === 'add' ? 'Add' : 'Edit'} Pet`,
    pageTitle: `${mode === 'add' ? 'Add' : 'Edit'} Pet`,
    pageSubtitle: mode === 'add' ? 'Create a new pet and attach it to the correct subclass table.' : 'Update the pet record while preserving its subclass rows.',
    body: card(
      'Pet form',
      `<form method="post" class="entity-form">${form.map(formField).join('')}${speciesSection}${sqlBlock(
        mode === 'add'
          ? 'INSERT INTO Pets (...) VALUES (...); -- subclass insert also runs'
          : `UPDATE Pets SET ... WHERE pet_id = '${safeHtml(pet.pet_id ?? '')}';`,
      )}<div class="form-actions"><button class="button button--solid" type="submit">${mode === 'add' ? 'Add Pet' : 'Save Changes'}</button><a class="button button--ghost" href="/pets">Cancel</a></div></form>`,
    ),
  });
}

async function handlePetMutation(req, res, mode) {
  const values = {
    pet_id: req.body.pet_id,
    name: req.body.name,
    breed: req.body.breed || null,
    age: Number(req.body.age),
    gender: req.body.gender || null,
    weight_kg: req.body.weight_kg ? Number(req.body.weight_kg) : null,
    intake_date: req.body.intake_date || null,
    adoption_status: req.body.adoption_status || 'Available',
    microchip_id: req.body.microchip_id || null,
    is_vaccinated: normalizeCheckbox(req.body.is_vaccinated),
    shelter_id: req.body.shelter_id || null,
  };

  if (mode === 'add') {
    await query(
      `INSERT INTO Pets (pet_id, name, breed, age, gender, weight_kg, intake_date, adoption_status, microchip_id, is_vaccinated, shelter_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [values.pet_id, values.name, values.breed, values.age, values.gender, values.weight_kg, values.intake_date, values.adoption_status, values.microchip_id, values.is_vaccinated, values.shelter_id],
    );

    if (req.body.species === 'Dog') {
      await query('INSERT INTO Dog (pet_id, size, is_trained) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [values.pet_id, req.body.size || 'Medium', normalizeCheckbox(req.body.is_trained)]);
    } else if (req.body.species === 'Cat') {
      await query('INSERT INTO Cat (pet_id, is_indoor, fur_length) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [values.pet_id, normalizeCheckbox(req.body.is_indoor), req.body.fur_length || 'Short']);
    } else {
      await query('INSERT INTO Other_Animal (pet_id, species_name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [values.pet_id, req.body.species_name || 'Unknown']);
    }

    redirectWithFlash(res, '/pets', flashMessage('success', `Pet <strong>${safeHtml(values.name)}</strong> added successfully.`));
    return;
  }

  const before = (await query('SELECT * FROM Pets WHERE pet_id = $1', [values.pet_id])).rows[0] ?? {};
  await query(
    `UPDATE Pets
     SET name = $2, breed = $3, age = $4, gender = $5, weight_kg = $6, intake_date = $7,
         adoption_status = $8, microchip_id = $9, is_vaccinated = $10, shelter_id = $11
     WHERE pet_id = $1`,
    [values.pet_id, values.name, values.breed, values.age, values.gender, values.weight_kg, values.intake_date, values.adoption_status, values.microchip_id, values.is_vaccinated, values.shelter_id],
  );
  const after = (await query('SELECT * FROM Pets WHERE pet_id = $1', [values.pet_id])).rows[0] ?? {};
  const token = stash(updateStore, {
    before,
    after,
    sql: `UPDATE Pets SET name='${values.name}', breed='${values.breed ?? ''}', age=${values.age}, adoption_status='${values.adoption_status}' WHERE pet_id='${values.pet_id}';`,
    entityName: 'Pets',
    recordLabel: values.pet_id,
    backUrl: '/pets',
  });
  res.redirect(`/update-result?token=${token}`);
}

async function renderPetDelete(req, res) {
  const pet = (await query('SELECT * FROM Pets WHERE pet_id = $1', [req.query.id])).rows[0];
  if (!pet) {
    redirectWithFlash(res, '/pets', flashMessage('warning', 'Pet not found.'));
    return;
  }
  page(res, req, {
    title: 'Delete Pet',
    pageTitle: 'Delete Pet',
    pageSubtitle: 'Deleting a pet also removes dependent records due to the schema cascade rules.',
    body: card(
      'Confirm deletion',
      `${renderKeyValueTable(pet)}${sqlBlock(`DELETE FROM Pets WHERE pet_id = '${safeHtml(req.query.id)}';`)}`,
      `<form method="post" action="/pets?action=delete&id=${encodeURIComponent(req.query.id)}"><button class="button button--danger" type="submit">Yes, delete</button></form><a class="button button--ghost" href="/pets">Cancel</a>`,
    ),
  });
}

async function handlePetDelete(req, res) {
  const pet = (await query('SELECT name FROM Pets WHERE pet_id = $1', [req.query.id])).rows[0];
  await query('DELETE FROM Pets WHERE pet_id = $1', [req.query.id]);
  redirectWithFlash(res, '/pets', flashMessage('success', `Pet <strong>${safeHtml(pet?.name ?? req.query.id)}</strong> deleted.`));
}

async function renderAdoptersList(req, res) {
  const rows = (
    await query(`SELECT a.*,
      CASE WHEN i.adopter_id IS NOT NULL AND o.adopter_id IS NOT NULL THEN 'Individual + Org'
           WHEN i.adopter_id IS NOT NULL THEN 'Individual'
           WHEN o.adopter_id IS NOT NULL THEN 'Organization'
           ELSE '—' END AS subclass,
      (SELECT COUNT(*) FROM Adoption_Applications ap WHERE ap.adopter_id = a.adopter_id) AS apps,
      (SELECT COUNT(*) FROM References_Table r WHERE r.adopter_id = a.adopter_id) AS refs
      FROM Adopters a
      LEFT JOIN Individual i ON a.adopter_id = i.adopter_id
      LEFT JOIN Organization o ON a.adopter_id = o.adopter_id
      ORDER BY a.adopter_id`)).rows;
  const columns = rows[0] ? Object.keys(rows[0]) : ['adopter_id', 'first_name', 'last_name', 'phone', 'email', 'subclass', 'apps', 'refs'];

  page(res, req, {
    title: 'Adopters',
    pageTitle: 'Adopters',
    pageSubtitle: 'Adopter records plus overlapping Individual and Organization specialization assignment.',
    body: `${actionBar([`<a class="button button--solid" href="/adopters?action=add">Add Adopter</a>`])}${card(
      'Adopters',
      dataTable(columns, rows.map((row) => rowToHtml(row, columns)), (row) => `<a class="button button--small button--ghost" href="/adopters?action=edit&id=${encodeURIComponent(row.adopter_id)}">Edit</a><a class="button button--small button--danger" href="/adopters?action=delete&id=${encodeURIComponent(row.adopter_id)}">Delete</a>`),
    )}`,
  });
}

async function renderAdopterForm(req, res, mode) {
  const id = req.query.id;
  const adopter = mode === 'edit' ? (await query('SELECT * FROM Adopters WHERE adopter_id = $1', [id])).rows[0] ?? {} : {};
  const individual = mode === 'edit' ? (await query('SELECT * FROM Individual WHERE adopter_id = $1', [id])).rows[0] ?? null : null;
  const organization = mode === 'edit' ? (await query('SELECT * FROM Organization WHERE adopter_id = $1', [id])).rows[0] ?? null : null;

  const form = [
    { name: 'adopter_id', label: 'Adopter ID', type: 'text', required: true, readonly: mode === 'edit', value: adopter.adopter_id ?? '' },
    { name: 'first_name', label: 'First Name', type: 'text', required: true, value: adopter.first_name ?? '' },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true, value: adopter.last_name ?? '' },
    { name: 'email', label: 'Email', type: 'email', value: adopter.email ?? '' },
    { name: 'phone', label: 'Phone', type: 'text', required: true, value: adopter.phone ?? '' },
    { name: 'address', label: 'Address', type: 'text', value: adopter.address ?? '' },
    { name: 'dob', label: 'Date of Birth', type: 'date', value: adopter.dob ? String(adopter.dob).slice(0, 10) : '' },
    { name: 'id_proof', label: 'ID Proof Reference', type: 'text', value: adopter.id_proof ?? '' },
  ];

  const specialization = mode === 'add'
    ? `<section class="subclass-card">
        <label class="field field--checkbox"><input type="checkbox" name="is_individual" /><span>Individual</span></label>
        ${formField({ name: 'occupation', label: 'Occupation', type: 'text', value: '' })}
        <label class="field field--checkbox"><input type="checkbox" name="is_org" /><span>Organization</span></label>
        ${formField({ name: 'org_reg_no', label: 'Registration Number', type: 'text', value: '' })}
      </section>`
    : `<section class="mini-card">
        <h3>Current subclass rows</h3>
        <p>Individual: ${individual ? safeHtml(individual.occupation ?? 'Yes') : 'No row'}</p>
        <p>Organization: ${organization ? safeHtml(organization.org_reg_no ?? 'Yes') : 'No row'}</p>
      </section>`;

  page(res, req, {
    title: `${mode === 'add' ? 'Add' : 'Edit'} Adopter`,
    pageTitle: `${mode === 'add' ? 'Add' : 'Edit'} Adopter`,
    pageSubtitle: 'Manage adopter data while preserving the overlapping specialization model.',
    body: card(
      'Adopter form',
      `<form method="post" class="entity-form">${form.map(formField).join('')}${specialization}${sqlBlock(
        mode === 'add' ? 'INSERT INTO Adopters (...) VALUES (...); -- subclass rows may also be inserted' : `UPDATE Adopters SET ... WHERE adopter_id = '${safeHtml(adopter.adopter_id ?? '')}';`,
      )}<div class="form-actions"><button class="button button--solid" type="submit">${mode === 'add' ? 'Save Adopter' : 'Save Changes'}</button><a class="button button--ghost" href="/adopters">Cancel</a></div></form>`,
    ),
  });
}

async function handleAdopterMutation(req, res, mode) {
  const values = {
    adopter_id: req.body.adopter_id,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email || null,
    phone: req.body.phone,
    address: req.body.address || null,
    dob: req.body.dob || null,
    id_proof: req.body.id_proof || null,
  };

  if (mode === 'add') {
    await query('INSERT INTO Adopters (adopter_id, first_name, last_name, email, phone, address, dob, id_proof) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', Object.values(values));
    if (normalizeCheckbox(req.body.is_individual)) {
      await query('INSERT INTO Individual (adopter_id, occupation) VALUES ($1, $2) ON CONFLICT DO NOTHING', [values.adopter_id, req.body.occupation || null]);
    }
    if (normalizeCheckbox(req.body.is_org)) {
      await query('INSERT INTO Organization (adopter_id, org_reg_no) VALUES ($1, $2) ON CONFLICT DO NOTHING', [values.adopter_id, req.body.org_reg_no || null]);
    }
    redirectWithFlash(res, '/adopters', flashMessage('success', 'Adopter saved successfully.'));
    return;
  }

  const before = (await query('SELECT * FROM Adopters WHERE adopter_id = $1', [values.adopter_id])).rows[0] ?? {};
  await query(
    'UPDATE Adopters SET first_name = $2, last_name = $3, email = $4, phone = $5, address = $6, dob = $7, id_proof = $8 WHERE adopter_id = $1',
    Object.values(values),
  );
  const after = (await query('SELECT * FROM Adopters WHERE adopter_id = $1', [values.adopter_id])).rows[0] ?? {};
  const token = stash(updateStore, {
    before,
    after,
    sql: `UPDATE Adopters SET first_name='${values.first_name}', last_name='${values.last_name}' WHERE adopter_id='${values.adopter_id}';`,
    entityName: 'Adopters',
    recordLabel: values.adopter_id,
    backUrl: '/adopters',
  });
  res.redirect(`/update-result?token=${token}`);
}

async function renderAdopterDelete(req, res) {
  const adopter = (await query('SELECT * FROM Adopters WHERE adopter_id = $1', [req.query.id])).rows[0];
  if (!adopter) {
    redirectWithFlash(res, '/adopters', flashMessage('warning', 'Adopter not found.'));
    return;
  }
  page(res, req, {
    title: 'Delete Adopter',
    pageTitle: 'Delete Adopter',
    pageSubtitle: 'Deleting an adopter removes applications, references, and related subclass rows through the existing schema rules.',
    body: card(
      'Confirm deletion',
      `${renderKeyValueTable(adopter)}${sqlBlock(`DELETE FROM Adopters WHERE adopter_id = '${safeHtml(req.query.id)}';`)}`,
      `<form method="post" action="/adopters?action=delete&id=${encodeURIComponent(req.query.id)}"><button class="button button--danger" type="submit">Yes, delete</button></form><a class="button button--ghost" href="/adopters">Cancel</a>`,
    ),
  });
}

async function handleAdopterDelete(req, res) {
  await query('DELETE FROM Adopters WHERE adopter_id = $1', [req.query.id]);
  redirectWithFlash(res, '/adopters', flashMessage('success', 'Adopter deleted.'));
}

async function renderApplicationsList(req, res) {
  const rows = (await query(`SELECT aa.*, p.name AS pet_name, ad.first_name || ' ' || ad.last_name AS adopter_name
    FROM Adoption_Applications aa
    JOIN Pets p ON aa.pet_id = p.pet_id
    JOIN Adopters ad ON aa.adopter_id = ad.adopter_id
    ORDER BY aa.application_date DESC`)).rows;
  const columns = rows[0] ? Object.keys(rows[0]) : ['application_id', 'application_date', 'status', 'notes', 'adopter_id', 'pet_id', 'pet_name', 'adopter_name'];

  page(res, req, {
    title: 'Applications',
    pageTitle: 'Adoption Applications',
    pageSubtitle: 'Weak entity between adopters and pets. Trigger-driven approval and audit behavior remains in PostgreSQL.',
    body: `${actionBar([`<a class="button button--solid" href="/applications?action=add">New Application</a>`, `<a class="button button--ghost" href="/audit-log">View Audit Log</a>`])}${card(
      'Adoption_Applications',
      dataTable(columns, rows.map((row) => rowToHtml(row, columns)), (row) => `<a class="button button--small button--ghost" href="/applications?action=edit&id=${encodeURIComponent(row.application_id)}">Edit</a><a class="button button--small button--danger" href="/applications?action=delete&id=${encodeURIComponent(row.application_id)}">Delete</a>`),
    )}`,
  });
}

async function renderApplicationForm(req, res, mode) {
  const row = mode === 'edit' ? (await query('SELECT * FROM Adoption_Applications WHERE application_id = $1', [req.query.id])).rows[0] ?? {} : {};
  const adopters = await getOptions('applications', 'adopter_id');
  const pets = await getOptions('applications', 'pet_id');
  const fields = [
    { name: 'application_id', label: 'Application ID', type: 'text', required: true, readonly: mode === 'edit', value: row.application_id ?? '' },
    { name: 'application_date', label: 'Application Date', type: 'date', required: true, value: row.application_date ? String(row.application_date).slice(0, 10) : new Date().toISOString().slice(0, 10) },
    { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'].map((value) => ({ value, label: value })), value: row.status ?? 'Pending' },
    { name: 'adopter_id', label: 'Adopter', type: 'select', options: adopters, value: row.adopter_id ?? '' },
    { name: 'pet_id', label: 'Pet', type: 'select', options: pets, value: row.pet_id ?? '' },
    { name: 'notes', label: 'Notes', type: 'textarea', value: row.notes ?? '' },
  ];

  page(res, req, {
    title: `${mode === 'add' ? 'Add' : 'Edit'} Application`,
    pageTitle: `${mode === 'add' ? 'Add' : 'Edit'} Application`,
    pageSubtitle: "Approving an application still triggers PostgreSQL to mark the pet as 'Adopted'.",
    body: card(
      'Application form',
      `<form method="post" class="entity-form">${fields.map(formField).join('')}${sqlBlock(
        mode === 'add'
          ? 'INSERT INTO Adoption_Applications (...) VALUES (...); -- audit trigger fires on insert'
          : `UPDATE Adoption_Applications SET ... WHERE application_id = '${safeHtml(row.application_id ?? '')}';`,
      )}<div class="mini-card"><strong>Trigger notes</strong><p><code>trg_approval_status</code> updates the pet when status becomes Approved. <code>trg_log_application</code> writes to <code>Application_Audit</code> on insert.</p></div><div class="form-actions"><button class="button button--solid" type="submit">Save</button><a class="button button--ghost" href="/applications">Cancel</a></div></form>`,
    ),
  });
}

async function handleApplicationMutation(req, res, mode) {
  const values = [req.body.application_id, req.body.application_date, req.body.status, req.body.notes || null, req.body.adopter_id, req.body.pet_id];
  if (mode === 'add') {
    await query('INSERT INTO Adoption_Applications (application_id, application_date, status, notes, adopter_id, pet_id) VALUES ($1,$2,$3,$4,$5,$6)', values);
    redirectWithFlash(res, '/applications', flashMessage('success', 'Application saved. Audit trigger executed automatically.'));
    return;
  }

  const before = (await query('SELECT * FROM Adoption_Applications WHERE application_id = $1', [req.body.application_id])).rows[0] ?? {};
  await query('UPDATE Adoption_Applications SET application_date = $2, status = $3, notes = $4, adopter_id = $5, pet_id = $6 WHERE application_id = $1', values);
  const after = (await query('SELECT * FROM Adoption_Applications WHERE application_id = $1', [req.body.application_id])).rows[0] ?? {};
  const token = stash(updateStore, {
    before,
    after,
    sql: `UPDATE Adoption_Applications SET status='${req.body.status}' WHERE application_id='${req.body.application_id}';`,
    entityName: 'Adoption_Applications',
    recordLabel: req.body.application_id,
    backUrl: '/applications',
  });
  res.redirect(`/update-result?token=${token}`);
}

async function renderApplicationDelete(req, res) {
  const row = (await query(`SELECT aa.*, p.name AS pet_name, ad.first_name || ' ' || ad.last_name AS adopter_name
    FROM Adoption_Applications aa
    JOIN Pets p ON aa.pet_id = p.pet_id
    JOIN Adopters ad ON aa.adopter_id = ad.adopter_id
    WHERE aa.application_id = $1`, [req.query.id])).rows[0];
  if (!row) {
    redirectWithFlash(res, '/applications', flashMessage('warning', 'Application not found.'));
    return;
  }
  page(res, req, {
    title: 'Delete Application',
    pageTitle: 'Delete Application',
    pageSubtitle: 'Remove a single adoption application record.',
    body: card(
      'Confirm deletion',
      `${renderKeyValueTable(row)}${sqlBlock(`DELETE FROM Adoption_Applications WHERE application_id = '${safeHtml(req.query.id)}';`)}`,
      `<form method="post" action="/applications?action=delete&id=${encodeURIComponent(req.query.id)}"><button class="button button--danger" type="submit">Yes, delete</button></form><a class="button button--ghost" href="/applications">Cancel</a>`,
    ),
  });
}

async function handleApplicationDelete(req, res) {
  await query('DELETE FROM Adoption_Applications WHERE application_id = $1', [req.query.id]);
  redirectWithFlash(res, '/applications', flashMessage('success', 'Application deleted.'));
}

async function renderAppointmentsList(req, res) {
  const rows = (await query(`SELECT a.*, p.name AS pet_name, pcp.name AS provider_name
    FROM Appointments a
    JOIN Pets p ON a.pet_id = p.pet_id
    JOIN Pet_Care_Providers pcp ON a.provider_id = pcp.provider_id
    ORDER BY a.appointment_date DESC`)).rows;
  const columns = rows[0] ? Object.keys(rows[0]) : ['appointment_id', 'appointment_date', 'service_type', 'duration_mins', 'notes', 'pet_id', 'provider_id', 'pet_name', 'provider_name'];

  page(res, req, {
    title: 'Appointments',
    pageTitle: 'Appointments',
    pageSubtitle: "Weak entity linking pets and providers. PostgreSQL still blocks inserts for pets already marked 'Adopted'.",
    body: `${actionBar([`<a class="button button--solid" href="/appointments?action=add">New Appointment</a>`])}${card(
      'Appointments',
      dataTable(columns, rows.map((row) => rowToHtml(row, columns)), (row) => `<a class="button button--small button--ghost" href="/appointments?action=edit&id=${encodeURIComponent(row.appointment_id)}">Edit</a><a class="button button--small button--danger" href="/appointments?action=delete&id=${encodeURIComponent(row.appointment_id)}">Delete</a>`),
    )}`,
  });
}

async function renderAppointmentForm(req, res, mode) {
  const row = mode === 'edit' ? (await query('SELECT * FROM Appointments WHERE appointment_id = $1', [req.query.id])).rows[0] ?? {} : {};
  const pets = await getOptions('appointments', 'pet_id');
  const providers = await getOptions('appointments', 'provider_id');
  if (mode === 'edit' && row.pet_id && !pets.some((pet) => pet.value === row.pet_id)) {
    const pet = (await query("SELECT pet_id AS value, pet_id || ' - ' || name || ' (' || adoption_status || ')' AS label FROM Pets WHERE pet_id = $1", [row.pet_id])).rows[0];
    if (pet) pets.unshift(pet);
  }

  const fields = [
    { name: 'appointment_id', label: 'Appointment ID', type: 'text', required: true, readonly: mode === 'edit', value: row.appointment_id ?? '' },
    { name: 'appointment_date', label: 'Appointment Date', type: 'date', required: true, value: row.appointment_date ? String(row.appointment_date).slice(0, 10) : new Date().toISOString().slice(0, 10) },
    { name: 'duration_mins', label: 'Duration (mins)', type: 'number', step: '1', value: row.duration_mins ?? 30 },
    { name: 'service_type', label: 'Service Type', type: 'text', required: true, value: row.service_type ?? '' },
    { name: 'pet_id', label: 'Pet', type: 'select', options: pets, value: row.pet_id ?? '' },
    { name: 'provider_id', label: 'Provider', type: 'select', options: providers, value: row.provider_id ?? '' },
    { name: 'notes', label: 'Notes', type: 'textarea', value: row.notes ?? '' },
  ];

  page(res, req, {
    title: `${mode === 'add' ? 'Add' : 'Edit'} Appointment`,
    pageTitle: `${mode === 'add' ? 'Add' : 'Edit'} Appointment`,
    pageSubtitle: 'The legacy trigger rule is preserved: adopted pets cannot receive new appointments.',
    body: card(
      'Appointment form',
      `<form method="post" class="entity-form">${fields.map(formField).join('')}${sqlBlock(
        mode === 'add'
          ? 'INSERT INTO Appointments (...) VALUES (...); -- trg_check_pet_status fires BEFORE INSERT'
          : `UPDATE Appointments SET ... WHERE appointment_id = '${safeHtml(row.appointment_id ?? '')}';`,
      )}<div class="mini-card"><strong>Trigger note</strong><p><code>trg_check_pet_status</code> still prevents inserts for pets whose adoption_status is <code>Adopted</code>.</p></div><div class="form-actions"><button class="button button--solid" type="submit">Save</button><a class="button button--ghost" href="/appointments">Cancel</a></div></form>`,
    ),
  });
}

async function handleAppointmentMutation(req, res, mode) {
  const values = [req.body.appointment_id, req.body.appointment_date, req.body.service_type, Number(req.body.duration_mins || 0), req.body.notes || null, req.body.pet_id, req.body.provider_id];
  if (mode === 'add') {
    try {
      await query('INSERT INTO Appointments (appointment_id, appointment_date, service_type, duration_mins, notes, pet_id, provider_id) VALUES ($1,$2,$3,$4,$5,$6,$7)', values);
      redirectWithFlash(res, '/appointments', flashMessage('success', 'Appointment added.'));
    } catch (error) {
      redirectWithFlash(res, '/appointments', flashMessage('danger', safeHtml(error.message)));
    }
    return;
  }

  const before = (await query('SELECT * FROM Appointments WHERE appointment_id = $1', [req.body.appointment_id])).rows[0] ?? {};
  await query('UPDATE Appointments SET appointment_date = $2, service_type = $3, duration_mins = $4, notes = $5, pet_id = $6, provider_id = $7 WHERE appointment_id = $1', values);
  const after = (await query('SELECT * FROM Appointments WHERE appointment_id = $1', [req.body.appointment_id])).rows[0] ?? {};
  const token = stash(updateStore, {
    before,
    after,
    sql: `UPDATE Appointments SET service_type='${req.body.service_type}' WHERE appointment_id='${req.body.appointment_id}';`,
    entityName: 'Appointments',
    recordLabel: req.body.appointment_id,
    backUrl: '/appointments',
  });
  res.redirect(`/update-result?token=${token}`);
}

async function renderAppointmentDelete(req, res) {
  const row = (await query('SELECT * FROM Appointments WHERE appointment_id = $1', [req.query.id])).rows[0];
  if (!row) {
    redirectWithFlash(res, '/appointments', flashMessage('warning', 'Appointment not found.'));
    return;
  }
  page(res, req, {
    title: 'Delete Appointment',
    pageTitle: 'Delete Appointment',
    pageSubtitle: 'Deleting an existing appointment does not affect the trigger; it only removes the row.',
    body: card(
      'Confirm deletion',
      `${renderKeyValueTable(row)}${sqlBlock(`DELETE FROM Appointments WHERE appointment_id = '${safeHtml(req.query.id)}';`)}`,
      `<form method="post" action="/appointments?action=delete&id=${encodeURIComponent(req.query.id)}"><button class="button button--danger" type="submit">Yes, delete</button></form><a class="button button--ghost" href="/appointments">Cancel</a>`,
    ),
  });
}

async function handleAppointmentDelete(req, res) {
  await query('DELETE FROM Appointments WHERE appointment_id = $1', [req.query.id]);
  redirectWithFlash(res, '/appointments', flashMessage('success', 'Appointment deleted.'));
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'petadoption', date: new Date().toISOString() });
});

app.get('/api/meta', async (req, res, next) => {
  try {
    res.json(await getApiMeta());
  } catch (error) {
    next(error);
  }
});

app.get('/api/dashboard', async (req, res, next) => {
  try {
    res.json(await getDashboardPayload());
  } catch (error) {
    next(error);
  }
});

app.get('/api/entities', (req, res) => {
  res.json({ entities: listEntitySummaries() });
});

app.get('/api/entities/:key/metadata', (req, res, next) => {
  try {
    res.json(getEntitySpec(req.params.key));
  } catch (error) {
    next(error);
  }
});

app.get(['/api/entities/:key/rows', '/api/entities/:key/records'], async (req, res, next) => {
  try {
    res.json(
      await listEntityRows(req.params.key, {
        search: req.query.search,
        searchVal: req.query.searchVal,
        sort: req.query.sort,
        direction: req.query.direction,
        limit: req.query.limit,
        offset: req.query.offset,
      }),
    );
  } catch (error) {
    next(error);
  }
});

app.get(['/api/entities/:key/record', '/api/entities/:key/record/:id'], async (req, res, next) => {
  try {
    const spec = getEntitySpec(req.params.key);
    const criteria = normalizeRecordCriteria(spec, { ...req.query, ...req.params });
    const record = await getEntityRecord(req.params.key, criteria);
    if (!record) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    res.json({ entity: req.params.key, record });
  } catch (error) {
    next(error);
  }
});

app.post('/api/entities/:key', async (req, res, next) => {
  try {
    res.status(201).json(await createEntityRecord(req.params.key, req.body));
  } catch (error) {
    next(error);
  }
});

app.put(['/api/entities/:key', '/api/entities/:key/record'], async (req, res, next) => {
  try {
    res.json(await updateEntityRecord(req.params.key, req.body));
  } catch (error) {
    next(error);
  }
});

app.patch(['/api/entities/:key', '/api/entities/:key/record'], async (req, res, next) => {
  try {
    res.json(await updateEntityRecord(req.params.key, req.body));
  } catch (error) {
    next(error);
  }
});

app.delete(['/api/entities/:key', '/api/entities/:key/record'], async (req, res, next) => {
  try {
    res.json(await deleteEntityRecord(req.params.key, req.body));
  } catch (error) {
    next(error);
  }
});

app.get('/api/entities/:key/options/:field', async (req, res, next) => {
  try {
    res.json(await listFieldOptions(req.params.key, req.params.field, req.query.search));
  } catch (error) {
    next(error);
  }
});

app.get('/api/entities/:key/options', async (req, res, next) => {
  try {
    res.json(await listFieldOptions(req.params.key, req.query.field, req.query.search));
  } catch (error) {
    next(error);
  }
});

app.get('/api/views', (req, res) => {
  res.json({ views: listViewSummaries() });
});

app.get(['/api/views/:key', '/api/views/:key/data'], async (req, res, next) => {
  try {
    res.json(await listViewRows(req.params.key));
  } catch (error) {
    next(error);
  }
});

app.get('/api/relationships', (req, res) => {
  res.json({ relationships: listRelationshipSummaries() });
});

app.get('/api/triggers', (req, res) => {
  res.json({ triggers: listTriggerSummaries() });
});

function registerEntityRoute(entity) {
  const route = entity.route;
  const aliases = [route];

  for (const alias of aliases) {
    app.get(alias, async (req, res, next) => {
      try {
        if (entity.key === 'pets') {
          if (req.query.action === 'add') return renderPetForm(req, res, 'add');
          if (req.query.action === 'edit') return renderPetForm(req, res, 'edit');
          if (req.query.action === 'delete') return renderPetDelete(req, res);
          return renderPetsList(req, res);
        }

        if (entity.key === 'adopters') {
          if (req.query.action === 'add') return renderAdopterForm(req, res, 'add');
          if (req.query.action === 'edit') return renderAdopterForm(req, res, 'edit');
          if (req.query.action === 'delete') return renderAdopterDelete(req, res);
          return renderAdoptersList(req, res);
        }

        if (entity.key === 'applications') {
          if (req.query.action === 'add') return renderApplicationForm(req, res, 'add');
          if (req.query.action === 'edit') return renderApplicationForm(req, res, 'edit');
          if (req.query.action === 'delete') return renderApplicationDelete(req, res);
          return renderApplicationsList(req, res);
        }

        if (entity.key === 'appointments') {
          if (req.query.action === 'add') return renderAppointmentForm(req, res, 'add');
          if (req.query.action === 'edit') return renderAppointmentForm(req, res, 'edit');
          if (req.query.action === 'delete') return renderAppointmentDelete(req, res);
          return renderAppointmentsList(req, res);
        }

        if (req.query.action === 'add') return renderGenericForm(req, res, entity, 'add');
        if (req.query.action === 'edit') return renderGenericForm(req, res, entity, 'edit');
        if (req.query.action === 'delete') return renderGenericDelete(req, res, entity);
        return renderGenericList(req, res, entity);
      } catch (error) {
        next(error);
      }
    });

    app.post(alias, async (req, res, next) => {
      try {
        if (entity.key === 'pets') {
          if (req.query.action === 'delete') return handlePetDelete(req, res);
          return handlePetMutation(req, res, req.query.action === 'edit' ? 'edit' : 'add');
        }

        if (entity.key === 'adopters') {
          if (req.query.action === 'delete') return handleAdopterDelete(req, res);
          return handleAdopterMutation(req, res, req.query.action === 'edit' ? 'edit' : 'add');
        }

        if (entity.key === 'applications') {
          if (req.query.action === 'delete') return handleApplicationDelete(req, res);
          return handleApplicationMutation(req, res, req.query.action === 'edit' ? 'edit' : 'add');
        }

        if (entity.key === 'appointments') {
          if (req.query.action === 'delete') return handleAppointmentDelete(req, res);
          return handleAppointmentMutation(req, res, req.query.action === 'edit' ? 'edit' : 'add');
        }

        if (req.query.action === 'delete') return handleGenericDelete(req, res, entity);
        return handleGenericMutation(req, res, entity, req.query.action === 'edit' ? 'edit' : 'add');
      } catch (error) {
        next(error);
      }
    });
  }
}

app.get('/', (req, res, next) => renderHome(req, res).catch(next));
app.get('/views', (req, res, next) => renderViewsPage(req, res).catch(next));
app.get('/update-result', (req, res, next) => renderUpdateResult(req, res).catch(next));

for (const entity of entityList) {
  registerEntityRoute(entity);
}

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (req.path.startsWith('/api/')) {
    res.status(error.status ?? 500).json(apiErrorPayload(error));
    return;
  }
  const isDbConnectionError = ['ECONNREFUSED', 'ENOTFOUND', '28P01', '3D000'].includes(error.code);
  const helpBody = isDbConnectionError
    ? `<p>The app shell is running, but PostgreSQL is not reachable with the current environment settings.</p>
       <ul class="help-list">
         <li>Confirm PostgreSQL is running.</li>
         <li>Set <code>PGHOST</code>, <code>PGPORT</code>, <code>PGDATABASE</code>, <code>PGUSER</code>, and <code>PGPASSWORD</code>.</li>
         <li>Load the schema from <code>setup.sql</code> if the database is empty.</li>
       </ul>
       <p><a class="button button--ghost" href="/PROJECT_GUIDE.md">Open Project Guide</a></p>`
    : `<p>${safeHtml(error.message || String(error))}</p>`;
  res.status(500).send(
    shell({
      title: 'Error',
      pageTitle: 'Application Error',
      pageSubtitle: 'The rewrite is running, but this request failed.',
      flash: null,
      currentPath: req.path,
      body: `${card('Error details', `${helpBody}${error.code ? `<p><strong>Code:</strong> ${safeHtml(error.code)}</p>` : ''}`)}`,
    }),
  );
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

export default app;
