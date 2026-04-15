# 🐾 Paws Shelter — Pet Adoption & Care System
## Complete Setup Guide (College Project)

---

## 📁 Project Structure

```
paws-shelter/
├── backend/
│   ├── server.js           ← Express entry point
│   ├── db.js               ← PostgreSQL connection pool
│   ├── package.json
│   ├── .env                ← Your DB credentials (edit this!)
│   └── routes/
│       ├── dashboard.js    ← Stats + chart data
│       ├── pets.js         ← CRUD for pets
│       ├── adopters.js     ← CRUD for adopters
│       ├── applications.js ← Adoption applications + status
│       ├── appointments.js ← Scheduling
│       ├── providers.js    ← Vets & groomers
│       ├── staff.js        ← Staff management
│       ├── donations.js    ← Donation tracking
│       ├── medical.js      ← Medical records
│       └── training.js     ← Dog training programs
│
└── frontend/
    ├── index.html          ← Dashboard
    ├── pets.html           ← Pet registry
    ├── adopters.html       ← Adopter registry
    ├── applications.html   ← Adoption applications
    ├── appointments.html   ← Appointment scheduler
    ├── medical.html        ← Medical records
    ├── providers.html      ← Care providers
    ├── staff.html          ← Staff management
    ├── donations.html      ← Donations tracker
    ├── training.html       ← Training programs
    ├── css/
    │   └── main.css        ← All styles
    └── js/
        └── api.js          ← API utility + helpers
```

---

## 🛠️ Tools Required (All Free)

| Tool | Purpose | Download |
|------|---------|----------|
| **PostgreSQL 15+** | Database | https://www.postgresql.org/download/ |
| **pgAdmin 4** | DB GUI | https://www.pgadmin.org/ |
| **Node.js 18+** | Backend runtime | https://nodejs.org/ |
| **VS Code** | Code editor | https://code.visualstudio.com/ |
| **Live Server** (VS Code ext.) | Serve frontend | Search in VS Code Extensions |

---

## ✅ Step-by-Step Setup

### Step 1 — Install PostgreSQL & pgAdmin

1. Download PostgreSQL from https://www.postgresql.org/download/
2. During installation, set a **password** for the `postgres` user (remember it!)
3. pgAdmin is usually bundled — if not, download from https://www.pgadmin.org/

### Step 2 — Create the Database

1. Open **pgAdmin 4**
2. Right-click **Servers → Connect**
3. Right-click **Databases → Create → Database**
4. Name it: `pet_adoption` → Click Save
5. Click on `pet_adoption` database
6. Click **Tools → Query Tool**
7. **Paste the entire SQL script** (the one you already have) into the Query Tool
8. Click **▶ Execute / Run (F5)**
9. You should see all tables created + sample data inserted

### Step 3 — Install Node.js

1. Download Node.js LTS from https://nodejs.org/
2. Install it with default settings
3. Verify: open Terminal/Command Prompt and run:
   ```
   node --version
   npm --version
   ```

### Step 4 — Configure the Backend

1. Open the `backend/` folder
2. Open `.env` and update your credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pet_adoption
   DB_USER=postgres
   DB_PASSWORD=your_actual_password_here
   PORT=3000
   ```

### Step 5 — Install Backend Dependencies

Open Terminal in the `backend/` folder:
```bash
cd paws-shelter/backend
npm install
```

This installs: `express`, `pg`, `cors`, `dotenv`

### Step 6 — Start the Backend Server

```bash
npm start
```

You should see:
```
🐾  Paws Shelter API running on http://localhost:3000
```

Test it works: open browser → http://localhost:3000/api/health
You should see: `{"status":"ok","timestamp":"..."}`

### Step 7 — Run the Frontend

**Option A — VS Code Live Server (Recommended)**
1. Open VS Code
2. Install extension: **Live Server** (by Ritwick Dey)
3. Open the `frontend/` folder in VS Code
4. Right-click `index.html` → **Open with Live Server**
5. Browser opens at http://127.0.0.1:5500

**Option B — Simple Python server**
```bash
cd paws-shelter/frontend
python -m http.server 8080
```
Then open: http://localhost:8080

---

## 🔌 API Endpoints Reference

### Dashboard
- `GET /api/dashboard/stats` — Summary numbers (pets, adopters, donations)
- `GET /api/dashboard/breed-distribution` — For pie chart
- `GET /api/dashboard/donation-breakdown` — For bar chart
- `GET /api/dashboard/recent-activity` — Activity feed

### Pets
- `GET    /api/pets?status=Available&gender=Male&search=buddy&page=1` — List with filters
- `GET    /api/pets/:id` — Pet detail with medical + appointments
- `POST   /api/pets` — Add new pet (handles Dog/Cat/Other subclass)
- `PUT    /api/pets/:id` — Update pet
- `DELETE /api/pets/:id` — Delete pet (cascades to subclass tables)

### Adopters
- `GET    /api/adopters?search=riya&page=1`
- `GET    /api/adopters/:id` — With references, applications, donations
- `POST   /api/adopters` — Register (Individual or Organization)
- `PUT    /api/adopters/:id`
- `DELETE /api/adopters/:id`

### Applications
- `GET    /api/applications?status=Pending&page=1`
- `POST   /api/applications` — Submit new application
- `PATCH  /api/applications/:id/status` — Approve/Reject (triggers DB trigger!)
- `DELETE /api/applications/:id`

### Appointments
- `GET    /api/appointments?page=1`
- `POST   /api/appointments` — Schedule (DB trigger blocks adopted pets!)
- `DELETE /api/appointments/:id`

### Providers
- `GET  /api/providers`
- `POST /api/providers`

### Staff
- `GET  /api/staff`
- `POST /api/staff`

### Donations
- `GET  /api/donations`
- `POST /api/donations`

### Medical Records
- `GET  /api/medical`
- `POST /api/medical`

### Training
- `GET /api/training`
- `GET /api/training/:id/dogs`

---

## 🗄️ Database Triggers (Auto-enforced)

These run automatically in the database — no manual code needed:

| Trigger | What it does |
|---------|-------------|
| `trg_approval_status` | When application → **Approved**, pet status auto-updates to **Adopted** |
| `trg_check_pet_status` | Blocks scheduling appointments for **Adopted** pets |
| `trg_log_application` | Every new application is logged to `Application_Audit` table |

**To verify triggers work:**
1. Go to Applications page → Approve an application
2. Check the pet's status on the Pets page — it's now "Adopted"!
3. Try scheduling an appointment for that pet — it will be blocked with an error

---

## 🎨 Features Demonstrated

### Frontend–Backend–Database Coordination
- **Filtering**: URL query params → API → SQL WHERE clauses → rendered cards
- **Pagination**: Page/limit params handled at every layer
- **Transactions**: Adding a pet with subclass (Dog/Cat) uses `BEGIN...COMMIT`
- **Triggers**: Approve application → DB trigger fires → Pet status updates → UI reflects it
- **Joins**: Pet details page fetches from 6+ tables in one optimized query
- **Aggregates**: Dashboard stats use `COUNT`, `SUM`, `FILTER` in SQL

### Pages & Features
| Page | Key Features |
|------|-------------|
| Dashboard | 4 live stat cards, doughnut chart, bar chart, pie chart, activity feed |
| Pets | Grid view, filter by status/gender/search, add/edit/delete, detail modal with medical history |
| Adopters | Table view, search, profile modal with references + applications + donations |
| Applications | Status workflow (Pending→Approved/Rejected), DB trigger demonstration |
| Appointments | Schedule form with trigger protection message, service-type colored chips |
| Medical Records | Full records table, cost summary, follow-up tracking |
| Providers | Card grid with availability days, type-specific fields (Vet/Groomer) |
| Staff | Summary stats, volunteer vs employee cards with shift info |
| Donations | Charts by purpose + mode, donation table |
| Training | Program cards with enrolled dogs list |

---

## 🐛 Troubleshooting

**"Cannot connect to database"**
- Check `.env` password matches your pgAdmin password
- Make sure PostgreSQL service is running (check Services on Windows)

**"CORS error" in browser console**
- Make sure backend is running on port 3000
- The `cors()` middleware handles this automatically

**"relation does not exist"**
- You haven't run the SQL script in pgAdmin yet — run it first

**Frontend shows "Error loading"**
- Backend not running → run `npm start` in backend folder
- Wrong port → check `js/api.js` line: `const API_BASE = 'http://localhost:3000/api'`

**Port 3000 already in use**
- Change PORT in `.env` to `3001` and update `API_BASE` in `frontend/js/api.js`

---

## 📊 For College Presentation

Demonstrate these live:
1. **Add a new pet** (Dog with training data)
2. **Register an adopter** and submit an application
3. **Approve the application** → show pet status changed to "Adopted"
4. **Try to book appointment** for adopted pet → show DB trigger blocking it
5. **Dashboard charts** updating with new data
6. **Medical records** — add a record and view it on Pet detail page

---

*Built with Node.js + Express + PostgreSQL + Vanilla JS*