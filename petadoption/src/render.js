import { dashboardStats, entityGroups, entityList, relationships } from './entities.js';

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function html(strings, ...values) {
  return strings.reduce((out, part, index) => out + part + (values[index] ?? ''), '');
}

function isActiveRoute(currentPath, route) {
  if (currentPath === route) return true;
  if (route !== '/' && currentPath.startsWith(`${route}?`)) return true;
  if (route !== '/' && currentPath.startsWith(`${route}/`)) return true;
  return false;
}

function navLink(entity, currentPath) {
  const active = isActiveRoute(currentPath, entity.route) ? ' nav-link--active' : '';
  return `<a class="nav-link${active}" href="${entity.route}">${esc(entity.title)}</a>`;
}

function routeGroup(keys, currentPath) {
  return keys
    .map((key) => entityList.find((entry) => entry.key === key))
    .filter(Boolean)
    .map((entity) => navLink(entity, currentPath))
    .join('');
}

function flashMarkup(flash) {
  if (!flash) return '';
  return `<div class="flash flash-${esc(flash.type || 'info')}">${flash.message}</div>`;
}

export function shell({ title, pageTitle, pageSubtitle = '', body, flash = null, scripts = '', currentPath = '/' }) {
  const primaryNav = routeGroup(entityGroups.primary, currentPath);
  const supportNav = routeGroup(entityGroups.support, currentPath);
  const viewsActive = isActiveRoute(currentPath, '/views') ? ' nav-link--active' : '';
  const docsCta = currentPath === '/' ? '' : `<a class="button button--ghost" href="/">Dashboard</a>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} | Pet Adoption System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body data-path="${esc(currentPath)}">
  <div class="app-bg"></div>
  <header class="site-header">
    <div class="site-header__inner">
      <a class="brand" href="/">
        <span class="brand__badge"><i class="bi bi-house-heart"></i></span>
        <span>
          <strong>Pet Adoption</strong>
          <small>Vanilla JS + PostgreSQL</small>
        </span>
      </a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav">
        <i class="bi bi-list"></i>
      </button>
      <nav class="site-nav" id="site-nav">
        <div class="nav-group">
          <span class="nav-group__label">Primary</span>
          <div class="nav-group__links">${primaryNav}</div>
        </div>
        <div class="nav-group">
          <span class="nav-group__label">Support</span>
          <div class="nav-group__links">${supportNav}</div>
        </div>
        <div class="nav-group nav-group--single">
          <a class="nav-link${viewsActive}" href="/views">Views & Triggers</a>
        </div>
      </nav>
    </div>
  </header>

  <main class="page-shell">
    ${flashMarkup(flash)}
    <section class="page-intro">
      <p class="eyebrow">Pet Adoption And Care System</p>
      <h1>${esc(pageTitle)}</h1>
      ${pageSubtitle ? `<p class="page-intro__subtitle">${pageSubtitle}</p>` : ''}
      <div class="page-intro__actions">
        ${docsCta}
        <a class="button button--ghost" href="/views">Views & Triggers</a>
        <a class="button button--ghost" href="/api/meta">API Meta</a>
        <a class="button button--ghost" href="/PROJECT_GUIDE.md">Project Guide</a>
      </div>
      <div class="page-intro__meta">
        <span class="meta-pill">22 tables</span>
        <span class="meta-pill">4 specialization families</span>
        <span class="meta-pill">3 triggers</span>
        <span class="meta-pill">3 views</span>
        <span class="meta-pill">Node + PostgreSQL</span>
      </div>
    </section>
    ${body}
  </main>

  <footer class="site-footer">
    <div>
      <strong>Pet Adoption and Care System</strong>
      <span>22 tables, 4 specialization families, 3 triggers, 3 views</span>
    </div>
    <div>Legacy PHP/XAMPP replaced with Node + vanilla HTML/CSS/JS</div>
  </footer>

  <script src="/app.js" defer></script>
  ${scripts}
</body>
</html>`;
}

export function statCards(stats) {
  return `<section class="stats-grid">${stats
    .map(
      (stat) => `<article class="stat-card stat-card--${esc(stat.accent || 'blue')}">
        <div>
          <p>${esc(stat.label)}</p>
          <strong>${esc(stat.display)}</strong>
        </div>
        <span>${esc(stat.key)}</span>
      </article>`,
    )
    .join('')}</section>`;
}

export function primaryDirectory(items) {
  return `<section class="card-stack">
    <div class="section-heading">
      <h2>Primary Workflow Tables</h2>
      <p>These are the core shelter operations that matter most in daily use and in the project demo flow.</p>
    </div>
    <div class="card-grid">${items
      .map(
        (item) => `<article class="directory-card">
        <div>
          <p class="directory-card__title">${esc(item.title)}</p>
          <p class="directory-card__description">${esc(item.subtitle || '')}</p>
          <p class="directory-card__meta">${esc(item.count)} record(s)</p>
        </div>
        <a class="button button--solid" href="${item.route}">Manage</a>
      </article>`,
      )
      .join('')}</div>
  </section>`;
}

export function supportDirectory(items) {
  return `<section class="card-stack">
    <div class="section-heading">
      <h2>Schema Table Directory</h2>
      <p>These pages complete the full EER implementation with subclass tables, junction tables, audit rows, and support entities.</p>
    </div>
    <div class="card-grid card-grid--support">${items
      .map(
        (item) => `<article class="directory-card directory-card--compact">
        <div>
          <p class="directory-card__title">${esc(item.title)}</p>
          <p class="directory-card__description">${esc(item.subtitle || '')}</p>
          <p class="directory-card__meta">${esc(item.count)} record(s)</p>
        </div>
        <a class="button button--ghost" href="${item.route}">Open</a>
      </article>`,
      )
      .join('')}</div>
  </section>`;
}

export function relationshipsTable() {
  return card(
    'EER Relationships Implemented',
    `<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Relationship</th><th>Entities</th><th>Type</th><th>Feature</th></tr></thead>
      <tbody>
        ${relationships
          .map(
            ([name, entities, type, feature]) =>
              `<tr><td><strong>${esc(name)}</strong></td><td>${esc(entities)}</td><td>${esc(type)}</td><td>${esc(feature)}</td></tr>`,
          )
          .join('')}
      </tbody>
    </table></div>`,
  );
}

export function card(title, body, actions = '') {
  return `<section class="panel">
    <div class="panel__header">
      <div><h2>${esc(title)}</h2></div>
      ${actions ? `<div class="panel__actions">${actions}</div>` : ''}
    </div>
    <div class="panel__body">${body}</div>
  </section>`;
}

export function dataTable(columns, rows, actions = null) {
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr>${columns.map((column) => `<th>${esc(column)}</th>`).join('')}${actions ? '<th>Actions</th>' : ''}</tr></thead>
    <tbody>
      ${
        rows.length
          ? rows
              .map((row) => `<tr>${columns.map((column) => `<td>${row[column] ?? '—'}</td>`).join('')}${actions ? `<td class="cell-actions">${actions(row)}</td>` : ''}</tr>`)
              .join('')
          : `<tr><td colspan="${columns.length + (actions ? 1 : 0)}" class="table-empty">No rows found.</td></tr>`
      }
    </tbody>
  </table></div>`;
}

export function formField(field) {
  const { name, label, type = 'text', value = '', required = false, readonly = false, options = [], note = '', checked = false } = field;
  const requiredAttr = required ? 'required' : '';
  const readonlyAttr = readonly ? 'readonly' : '';

  if (type === 'textarea') {
    return `<label class="field">
      <span>${esc(label)}</span>
      <textarea name="${esc(name)}" rows="4" ${requiredAttr} ${readonlyAttr}>${esc(value)}</textarea>
      ${note ? `<small>${esc(note)}</small>` : ''}
    </label>`;
  }

  if (type === 'checkbox') {
    return `<label class="field field--checkbox">
      <input type="checkbox" name="${esc(name)}" ${checked ? 'checked' : ''} />
      <span>${esc(label)}</span>
      ${note ? `<small>${esc(note)}</small>` : ''}
    </label>`;
  }

  if (type === 'select') {
    return `<label class="field">
      <span>${esc(label)}</span>
      <select name="${esc(name)}" ${requiredAttr} ${readonly ? 'disabled' : ''}>
        <option value="">Select...</option>
        ${options
          .map((option) => `<option value="${esc(option.value)}" ${String(option.value) === String(value) ? 'selected' : ''}>${esc(option.label)}</option>`)
          .join('')}
      </select>
      ${readonly ? `<input type="hidden" name="${esc(name)}" value="${esc(value)}" />` : ''}
      ${note ? `<small>${esc(note)}</small>` : ''}
    </label>`;
  }

  const inputType = type === 'number' || type === 'int' ? 'number' : type;
  const stepAttr = inputType === 'number' ? `step="${field.step ?? '0.01'}"` : '';
  return `<label class="field">
    <span>${esc(label)}</span>
    <input type="${esc(inputType)}" name="${esc(name)}" value="${esc(value)}" ${requiredAttr} ${readonlyAttr} ${stepAttr} />
    ${note ? `<small>${esc(note)}</small>` : ''}
  </label>`;
}

export function sqlBlock(sql) {
  return `<pre class="sql-block"><code>${esc(sql)}</code></pre>`;
}

export function actionBar(items) {
  return `<div class="action-bar">${items.join('')}</div>`;
}

export function flashMessage(type, message) {
  return { type, message };
}

export function renderDashboard(counts) {
  const stats = dashboardStats.map((stat) => {
    const raw = counts[stat.key] ?? 0;
    return {
      ...stat,
      display: stat.money ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(raw)) : raw,
    };
  });

  const primaryItems = entityGroups.primary.map((key) => {
    const entity = entityList.find((entry) => entry.key === key);
    return { title: entity.title, route: entity.route, count: counts[entity.key] ?? 0, subtitle: entity.subtitle };
  });

  const supportItems = entityGroups.support.map((key) => {
    const entity = entityList.find((entry) => entry.key === key);
    return { title: entity.title, route: entity.route, count: counts[entity.key] ?? 0, subtitle: entity.subtitle };
  });

  const projectSummary = card(
    'System Snapshot',
    `<div class="summary-grid">
      <article class="summary-card">
        <h3>Operational Scope</h3>
        <p>The app covers pet intake, adopter management, applications, appointments, medical records, provider coordination, staff assignment, donations, and training programs.</p>
      </article>
      <article class="summary-card">
        <h3>Academic Scope</h3>
        <p>The schema still exposes strong entities, weak entities, subclass tables, junction tables, triggers, and views so the system remains useful for coursework explanation and viva review.</p>
      </article>
      <article class="summary-card">
        <h3>Runtime Shape</h3>
        <p>The interface is rendered by Node, styled with a custom design system, and backed by the same PostgreSQL model, so the project is simpler to run without changing the underlying database story.</p>
      </article>
    </div>`,
  );

  return `${statCards(stats)}${projectSummary}${primaryDirectory(primaryItems)}${supportDirectory(supportItems)}${relationshipsTable()}`;
}

export function renderKeyValueTable(record) {
  return `<div class="kv-table">${Object.entries(record)
    .map(
      ([key, value]) => `<div class="kv-row"><div class="kv-row__key">${esc(key)}</div><div class="kv-row__value">${esc(value ?? '—')}</div></div>`,
    )
    .join('')}</div>`;
}
