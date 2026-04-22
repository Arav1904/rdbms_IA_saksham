# Pet Adoption Database — Viva & Implementation Guide

This document is your master sheet. It breaks down the project from **first principles** so you can confidently answer any professor's questions during your lab evaluation, defend how the web app connects to the database, and run live SQL modifications if asked.

---

## 1. Project Architecture (From First Principles)
If asked *"How does your frontend talk to the database?"*, you should explain a **3-Tier Architecture**:

1. **Client / Browser (Frontend)**
   - **Tech:** HTML, Vanilla JavaScript, CSS.
   - **Role:** Handles the graphical interface. When you submit a form (e.g., adding a pet), the JavaScript `fetch` API catches the data, packages it up as a JSON object, and sends an HTTP Request (GET, POST, PUT, DELETE) out to your backend server.
   
2. **Web Server / Routing Layer (Backend)**
   - **Tech:** Node.js using the Express.js framework.
   - **Role:** Acts as the middleman protecting the database. It listens on port 3000 by default. When it catches the HTTP Request from your frontend, it validates the data, opens a connection to the PostgreSQL database, and crafts the SQL query.

3. **Database (Storage)**
   - **Tech:** PostgreSQL (managed visually using pgAdmin).
   - **Role:** Safely stores structured data. The backend connects to Postgres using a library called `pg`. The queries rely on **Parameterized execution** (`$1, $2, $3...`) which firmly prevents SQL Injection hacking attempts. It receives the query from the Node server, executes the read/write operation, and sends the raw target data directly back to Node.js.

---

## 2. Database Schema (The 18 Tables + 3 Views)
The current database demonstrates a relational structure focused on **Subclassing (ISA inheritance)** and core shelter workflows:

- **The Main Superclass tables** (`Pets`, `Adopters`, `Pet_Care_Providers`, `Staff`) act as the central anchors where generic shared data exists.
- **The Child Subclasses** split off specific details. For instance, the `Pets` table stores ID, age, and weight. The branching `Dog` table uses the same ID as a Primary Key/Foreign key combination to specifically store `size` and `is_trained`. The `Cat` table stores `is_indoor` and `fur_length`. 
- **Associative / Junction Tables** handle Many-To-Many relationships (e.g., `Staff_Pet` assigning multiple caretakers to multiple pets).
- **Audit + Views**: `Application_Audit` logs inserts, while the views support availability, pending applications, and appointment-history reporting.

### The 3 Core Database Triggers (Business Logic Automation)
Database triggers execute functions automatically before/after an event:
1. `trg_approval_status`: When an application in `Adoption_Applications` is updated to 'Approved', this trigger fires off and actively updates the master `Pets.adoption_status` to 'Adopted'.
2. `trg_check_pet_status`: A `BEFORE INSERT` trigger preventing any user from mistakenly inserting new appointments to `Appointments` if the target pet has already been adopted.
3. `trg_log_application`: An audit/logging trigger. As soon as a user applies for a pet, it quietly inserts a tracking payload into the `Application_Audit` table strictly logging history.

---

## 3. Operations: How the CRUD Works Under the Hood
*This is exactly how the 4 actions map out.*

**CREATE (Current App Scope)**
- **SQL:** `INSERT INTO Pets ...`, `INSERT INTO Adopters ...`, `INSERT INTO Adoption_Applications ...`, `INSERT INTO Appointments ...`
- **Flow:** User submits a form -> frontend JS sends JSON to `/api/...` -> Express route runs parameterized SQL -> PostgreSQL stores the row.

**READ (Dashboard & Entity Pages)**
- **SQL:** joined `SELECT` queries from `Pets`, `Adopters`, `Adoption_Applications`, `Appointments`, `Pet_Care_Providers`, and `Staff`
- **Flow:** When a page loads -> JS sends `GET /api/...` -> Node.js returns JSON -> JS renders cards, tables, charts, and counters.

**UPDATE (Current App Scope)**
- **SQL:** `UPDATE Pets SET ... WHERE pet_id=$1` and `UPDATE Adoption_Applications SET status=$1 WHERE application_id=$2`
- **Flow:** Pets support before/after comparison in the UI. Applications support status transitions, and the database trigger then updates the pet to `Adopted` when needed.

**DELETE (Current App Scope)**
- **SQL:** `DELETE FROM Pets WHERE pet_id=$1` plus similar deletes for adopters, applications, and appointments
- **Flow:** JS runs a confirmation warning, Node executes the query, and PostgreSQL cascade rules clean dependent rows where defined.

---

## 4. Live Modification Defense (How to alter the table via SQL)

If the professor asks: *"Add a 'Pet_Nickname' column to the Pets table right now and show that we can save it."*

Remain completely calm and execute these first principle steps exactly:

### Step 1: Open pgAdmin and Modify Structure via SQL
Open your pgAdmin Query Tool pointing at `pet_adoption_db` and run this SQL:
```sql
ALTER TABLE Pets ADD COLUMN pet_nickname VARCHAR(100);
```
*(You have now altered the schema).*

### Step 2: Add to the HTML Frontend
1. Open `frontend/pets.html` in VSCode.
2. In the "**Add Pet Modal**" block, add a new input:
```html
<div class="form-group">
  <label class="form-label">Nickname</label>
  <input class="form-input" id="ap-nickname" placeholder="e.g. Buddy">
</div>
```
3. Update the Javascript `addPet()` payload constructor at the bottom of the file directly capturing your input ID:
```javascript
pet_nickname: document.getElementById('ap-nickname').value,
```

### Step 3: Update the Backend Node.js Database Route
1. Open `backend/routes/pets.js`.
2. Locate the `POST /` block (around Line 18).
3. Find where variables are pulled from `req.body`:
```javascript
const { ..., species_name, pet_nickname } = req.body;
```
4. Find the `INSERT INTO Pets` query inside the `try` block, and add your new column to the syntax array mapping and `$1, $2..` positional arrays:
```javascript
await pool.query(`
  INSERT INTO Pets (pet_id, name, breed, age, gender, weight_kg, intake_date, adoption_status, is_vaccinated, shelter_id, pet_nickname) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
`, [pet_id, name, breed, age, gender, weight_kg, intake_date, adoption_status, is_vaccinated, shelter_id, pet_nickname]);
```

### Step 4: Validate
Refresh your browser window (`http://localhost:3000/pets`). Click Add Pet, type a nickname, hit save. It will securely route through Node.js straight into your new `pet_nickname` Postgres table column seamlessly.

*(If asked to add it to the Update query, follow exactly Step 2 & 3 but pointing at `ep-nickname`, appending `pet_nickname=$X` to the `UPDATE Pets SET ...` block).*

---

## 5. Current Truth of the Live App

These are the modules that currently exist end to end:

- Dashboard
- Pets
- Adopters
- Applications
- Appointments
- Care Providers
- Staff

These modules do **not** exist in the current frontend, backend routes, or `setup.sql`:

- Donations
- Medical records
- Training programs

If asked why, the clean answer is: the project was narrowed so every visible page has a matching SQL model and matching API routes, with no dead modules left behind.
