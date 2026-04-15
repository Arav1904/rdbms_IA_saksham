const API_BASE = window.__API_BASE__ || '/api';

// ── Auth guard ────────────────────────────────────────────────
function requireAuth() {
  const auth = getAuth();
  if (!auth?.loggedIn) { window.location.href = 'login.html'; return null; }
  return auth;
}
function getAuth() {
  try { return JSON.parse(localStorage.getItem('shelter_auth') || 'null'); }
  catch { return null; }
}
function logout() {
  localStorage.removeItem('shelter_auth');
  window.location.href = 'login.html';
}

// ── API fetch ─────────────────────────────────────────────────
async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error || `HTTP ${res.status}`); }
  return res.json();
}
const API = {
  get:    p      => api(p),
  post:   (p,b)  => api(p, { method:'POST',   body: JSON.stringify(b) }),
  put:    (p,b)  => api(p, { method:'PUT',    body: JSON.stringify(b) }),
  patch:  (p,b)  => api(p, { method:'PATCH',  body: JSON.stringify(b) }),
  delete: p      => api(p, { method:'DELETE' }),
};

// ── SVG Icons ─────────────────────────────────────────────────
const Icons = {
  check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  info:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  search:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  eye:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  heart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  dog:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2 .336-3.5 2.112-3.5 4v3h1l1 1H3l.5 4L6 17l.5 2h11l.5-2 2.5-2 .5-4h-2l1-1h1V7c0-1.888-1.5-3.664-3.5-4-1.923-.321-3.5.782-3.5 2.172V5h-4v.172z"/></svg>`,
  cat:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5z"/></svg>`,
  paw:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="13" r="4"/><circle cx="5" cy="9" r="2"/><circle cx="19" cy="9" r="2"/><circle cx="8" cy="5" r="2"/><circle cx="16" cy="5" r="2"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  users:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  clipboard:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  stethoscope:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
  dollar:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  award:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  shield:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  logout:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  bar:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  trending: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  bell:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  chevronR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
};

// ── Sidebar builder ───────────────────────────────────────────
function buildSidebar(activePage) {
  const auth = getAuth();
  if (!auth) return;
  const nav = [
    { section:'Overview' },
    { href:'index.html',        icon:Icons.bar,         label:'Dashboard' },
    { section:'Animals' },
    { href:'pets.html',         icon:Icons.paw,         label:'All Pets' },
    { href:'training.html',     icon:Icons.award,       label:'Training' },
    { section:'Adoption' },
    { href:'adopters.html',     icon:Icons.users,       label:'Adopters' },
    { href:'applications.html', icon:Icons.clipboard,   label:'Applications' },
    { section:'Care' },
    { href:'appointments.html', icon:Icons.calendar,    label:'Appointments' },
    { href:'medical.html',      icon:Icons.stethoscope, label:'Medical Records' },
    { href:'providers.html',    icon:Icons.shield,      label:'Care Providers' },
    { section:'Admin' },
    { href:'staff.html',        icon:Icons.users,       label:'Staff' },
    { href:'donations.html',    icon:Icons.dollar,      label:'Donations' },
  ];
  const initials = auth.name ? auth.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U';
  const html = `
    <div class="sidebar-logo">
      <div class="logo-box">${Icons.heart}</div>
      <div class="logo-text"><h2><span>Paws</span> Shelter</h2><p>Management System</p></div>
    </div>
    <nav class="sidebar-nav">
      ${nav.map(item => item.section
        ? `<div class="nav-section-label">${item.section}</div>`
        : `<a href="${item.href}" class="nav-item ${item.href===activePage?'active':''}">${item.icon}<span>${item.label}</span></a>`
      ).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="user-pill" onclick="logout()" title="Sign out">
        <div class="user-avatar">${initials}</div>
        <div class="user-info"><div class="uname">${auth.name||auth.username}</div><div class="urole">${auth.role}</div></div>
        <span class="logout-icon">${Icons.logout}</span>
      </div>
    </div>
  `;
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.innerHTML = html;
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const icn = type==='success' ? Icons.check : type==='error' ? Icons.x : Icons.info;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${icn}<span>${message}</span>`;
  c.appendChild(t);
  setTimeout(() => t.style.opacity='0', 3200);
  setTimeout(() => t.remove(), 3500);
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(id)  { const e=document.getElementById(id); if(e) e.classList.add('open'); }
function closeModal(id) { const e=document.getElementById(id); if(e) e.classList.remove('open'); }
function closeAllModals(){ document.querySelectorAll('.modal-overlay').forEach(m=>m.classList.remove('open')); }
document.addEventListener('click', e => { if(e.target.classList.contains('modal-overlay')) closeAllModals(); });

// ── Formatters ────────────────────────────────────────────────
function formatDate(d) { if(!d) return '—'; return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
function formatCurrency(n) { if(n===null||n===undefined) return '—'; return '₹'+Number(n).toLocaleString('en-IN',{minimumFractionDigits:2}); }

function statusBadge(status) {
  const map = {
    'Available': `<span class="badge-available pet-status-badge">${status}</span>`,
    'Adopted':   `<span class="badge-adopted pet-status-badge">${status}</span>`,
    'Reserved':  `<span class="badge-reserved pet-status-badge">${status}</span>`,
    'Pending':   `<span class="chip chip-amber">${status}</span>`,
    'Approved':  `<span class="chip chip-green">${status}</span>`,
    'Rejected':  `<span class="chip chip-red">${status}</span>`,
  };
  return map[status] || `<span class="chip chip-gray">${status}</span>`;
}

function petIcon(p) {
  if (p.size !== undefined || p.is_trained !== undefined) return `<div class="pet-card-img dog">${Icons.dog}</div>`;
  if (p.fur_length !== undefined || p.is_indoor !== undefined) return `<div class="pet-card-img cat">${Icons.cat}</div>`;
  return `<div class="pet-card-img other">${Icons.paw}</div>`;
}

function genId(prefix) { return prefix + Math.random().toString(36).substr(2,5).toUpperCase(); }

// ── Init on every page ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page !== 'login.html') {
    const auth = requireAuth();
    if (!auth) return;
    buildSidebar(page);
  }
});