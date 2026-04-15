# AGENT.md — Pet Adoption and Care System CRUD Application

## Project Overview
This is a PHP + PostgreSQL CRUD web application for the Pet Adoption and Care System.
It runs on XAMPP (Apache + PHP) and connects to PostgreSQL managed via pgAdmin.
It implements all tables from the full expanded EER diagram.

## Technology Stack
- **Front-end:** HTML5, Bootstrap 5.3, Bootstrap Icons — served through XAMPP Apache
- **Back-end:** PHP 8.x using native `pg_connect()` / `pg_query()` (no PDO)
- **Database:** PostgreSQL 15+ managed through pgAdmin 4
- **Local server:** XAMPP (Apache only — PostgreSQL runs separately, NOT through XAMPP)

## File Structure
```
petadoption/               ← Copy this entire folder to C:\xampp\htdocs\
├── db.php                 ← Database connection config — UPDATE PASSWORD HERE
├── header.php             ← Shared HTML header, navbar, Bootstrap, CSS
├── footer.php             ← Shared HTML footer
├── index.php              ← Dashboard — stats, all table counts, relationship table
├── pets.php               ← Full CRUD — Pets table + Dog/Cat/Other_Animal subclasses
├── adopters.php           ← Full CRUD — Adopters + Individual/Organization subclasses
├── applications.php       ← CRUD — Adoption_Applications + trigger demo
├── appointments.php       ← CRUD — Appointments + BEFORE trigger demo
├── providers.php          ← CRUD — Pet_Care_Providers + Vet/Groomer subclasses
├── staff.php              ← CRUD — Staff + Volunteer/Employee + Staff_Pet M:N
├── donations.php          ← CRUD — Donation table
├── medical.php            ← CRUD — Medical_Records table
├── training.php           ← CRUD — Training_Programs + Dog_Training M:N
├── views.php              ← Shows all 3 live SQL views + trigger audit log
├── update_result.php      ← Before/after comparison page after every UPDATE
├── setup.sql              ← Run this in pgAdmin — creates ALL tables + inserts data
└── README.txt             ← Setup instructions
```

## Database Schema (22 tables — matches expanded EER diagram)

### Strong/Regular Entities
| Table | Primary Key | Foreign Keys | Notes |
|---|---|---|---|
| Shelter | shelter_id | — | Independent |
| Pets | pet_id | shelter_id → Shelter | Superclass for Dog/Cat/Other |
| Adopters | adopter_id | — | Superclass for Individual/Org |
| Pet_Care_Providers | provider_id | — | Superclass for Vet/Groomer |
| Staff | staff_id | — | Superclass for Volunteer/Employee |
| Donation | donation_id | adopter_id → Adopters | |
| Training_Programs | program_id | — | |

### Weak Entities
| Table | Primary Key | Parent FK | Cascade |
|---|---|---|---|
| Adoption_Applications | application_id | adopter_id, pet_id | ON DELETE CASCADE |
| Appointments | appointment_id | pet_id, provider_id | CASCADE + RESTRICT |
| Medical_Records | record_id (SERIAL) | pet_id, provider_id(Vet) | CASCADE + SET NULL |
| References_Table | ref_id (SERIAL) | adopter_id | CASCADE |

### Specialization Subclass Tables
| Table | PK/FK | Superclass | Type | Extra Attributes |
|---|---|---|---|---|
| Dog | pet_id | Pets | Disjoint (d) | size, is_trained |
| Cat | pet_id | Pets | Disjoint (d) | is_indoor, fur_length |
| Other_Animal | pet_id | Pets | Disjoint (d) | species_name |
| Individual | adopter_id | Adopters | Overlapping (o) | occupation |
| Organization | adopter_id | Adopters | Overlapping (o) | org_reg_no |
| Veterinarian | provider_id | Pet_Care_Providers | Disjoint (d) | vet_license_no, specialization |
| Groomer | provider_id | Pet_Care_Providers | Disjoint (d) | tools_used, grooming_styles |
| Volunteer | staff_id | Staff | Disjoint (d) | hours_per_week |
| Employee | staff_id | Staff | Disjoint (d) | salary, emp_id |

### M:N Junction Tables
| Table | Composite PK | Implements |
|---|---|---|
| Staff_Pet | (staff_id, pet_id) | Staff CARES FOR Pets |
| Dog_Training | (pet_id, program_id) | Dog ENROLLS IN Training_Programs |
| Pet_Photos | photo_id SERIAL | Multi-valued attribute of Pets |
| Provider_Availability | avail_id SERIAL | Multi-valued attribute of Providers |
| Application_Audit | audit_id SERIAL | Auto-filled by trigger |

## All Relationships (11 total — from EER diagram)
1. Shelter HOUSES Pets — 1:N
2. Pets RECEIVES Adoption_Applications — 1:N (identifying)
3. Adopters SUBMITS Adoption_Applications — 1:N (total participation)
4. Pets SCHEDULES Appointments — 1:N (identifying)
5. Pet_Care_Providers HANDLES Appointments — 1:N
6. Pets HAS Medical_Records — 1:N (identifying)
7. Veterinarian CREATES Medical_Records — 1:N (subclass relationship)
8. Adopters HAS References_Table — 1:N (identifying)
9. Staff CARES FOR Pets — M:N → Staff_Pet junction table
10. Adopters MAKES Donation — 1:N
11. Dog ENROLLS IN Training_Programs — M:N → Dog_Training junction table

## Triggers (3 total — defined in setup.sql)
```sql
-- Trigger 1: Auto-set adoption_status = 'Adopted' when application approved
trg_approval_status  → AFTER UPDATE ON Adoption_Applications

-- Trigger 2: Block appointments for already-adopted pets
trg_check_pet_status → BEFORE INSERT ON Appointments

-- Trigger 3: Write audit log for every new application
trg_log_application  → AFTER INSERT ON Adoption_Applications → Application_Audit
```

## Views (3 total — defined in setup.sql)
```sql
Available_Pets             -- Simple view on Pets WHERE adoption_status = 'Available'
Pending_Applications_View  -- 3-table JOIN: Applications + Pets + Adopters
Pet_Appointment_History    -- 3-table JOIN: Appointments + Pets + Pet_Care_Providers
```

## CRUD Implementation Pattern

Every entity page follows this pattern — all in a single PHP file using `$_GET['action']`:

```
GET  /pets.php              → list (READ) — table + search/filter
GET  /pets.php?action=add   → show add form (CREATE form)
POST /pets.php?action=add   → execute INSERT, flash message, redirect to list
GET  /pets.php?action=edit&id=X  → show pre-filled edit form (UPDATE form)
POST /pets.php?action=edit&id=X  → execute UPDATE, store before/after in session
                                 → redirect to update_result.php
GET  /pets.php?action=delete&id=X → show confirmation page with full record (DELETE confirm)
POST /pets.php?action=delete&id=X → execute DELETE, flash message, redirect to list
```

## Database Connection Pattern (db.php)
```php
// Uses native pg_connect() — requires extension=pgsql in php.ini
function getDB() {
    $conn = pg_connect("host=localhost port=5432 dbname=pet_adoption_db user=postgres password=YOUR_PASS");
    if (!$conn) die("Connection failed");
    return $conn;
}

function esc($conn, $val) {
    return pg_escape_string($conn, trim($val));
}
```

## Session-based Flash Messages Pattern
```php
// Set message (before redirect):
$_SESSION['msg']      = "Record saved successfully.";
$_SESSION['msg_type'] = 'success'; // 'success' | 'danger' | 'warning'
header('Location: pets.php'); exit;

// Display message (in header.php):
if (isset($_SESSION['msg'])) {
    echo "<div class='alert alert-{$_SESSION['msg_type']}'>{$_SESSION['msg']}</div>";
    unset($_SESSION['msg'], $_SESSION['msg_type']);
}
```

## Before/After Update Display Pattern (update_result.php)
```php
// In edit POST handler — before running UPDATE:
$before_r = pg_query($conn, "SELECT * FROM Pets WHERE pet_id='$pid'");
$before   = pg_fetch_assoc($before_r);

// Run UPDATE...

// After UPDATE — fetch new state:
$after_r = pg_query($conn, "SELECT * FROM Pets WHERE pet_id='$pid'");
$after   = pg_fetch_assoc($after_r);

// Store in session and redirect:
$_SESSION['before'] = $before;
$_SESSION['after']  = $after;
$_SESSION['sql']    = "UPDATE Pets SET ... WHERE pet_id='$pid';";
header('Location: update_result.php'); exit;
```

## CSS Color Scheme
```css
/* CRUD button classes */
.btn-create { background:#198754; }   /* Green  — CREATE */
.btn-read   { background:#0d6efd; }   /* Blue   — READ   */
.btn-update { background:#fd7e14; }   /* Orange — UPDATE */
.btn-delete { background:#dc3545; }   /* Red    — DELETE */

/* Navbar + page headers */
background: linear-gradient(135deg, #1a3a5c, #2e75b6);

/* SQL code display box */
.sql-box { background:#2b2b2b; color:#f8f8f2; font-family:monospace; }
```

## How to Set Up (Agent Steps)

### Step 1 — pgAdmin database setup
1. Create database: `pet_adoption_db`
2. Open Query Tool on that database
3. Run entire contents of `setup.sql`
4. Verify: final SELECT should show 22 tables all with row counts > 0

### Step 2 — XAMPP PHP configuration
1. Open XAMPP → Config → PHP (php.ini)
2. Find `;extension=pgsql` → remove semicolon → `extension=pgsql`
3. Find `;extension=pdo_pgsql` → remove semicolon → `extension=pdo_pgsql`
4. Save php.ini → Restart Apache

### Step 3 — Deploy files
1. Copy entire `petadoption/` folder to `C:\xampp\htdocs\petadoption\`
2. Open `db.php` → update `DB_PASS` to actual PostgreSQL password

### Step 4 — Verify
1. Start Apache in XAMPP
2. Open browser → `http://localhost/petadoption/`
3. Dashboard should show all counts > 0

## Modification Demo (3 marks requirement)

### Live demo modification — adding weight_kg column if not present:
```sql
-- Run in pgAdmin Query Tool:
ALTER TABLE Pets ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2);
```

### Update PHP form (add to pets.php add/edit form):
```html
<div class="col-md-3">
  <label class="form-label fw-semibold">Weight (kg)</label>
  <input name="weight_kg" type="number" step="0.1" class="form-control"
         value="<?= $pet['weight_kg'] ?? '' ?>" placeholder="e.g. 12.5"/>
</div>
```

### Update INSERT query in pets.php:
```php
// Add to query:
$wt = (float)($_POST['weight_kg'] ?? 0);
// In INSERT: add weight_kg column and $wt value
```

Note: `weight_kg` is already included in the schema — this demo shows the ability
to add any NEW column (e.g. `coat_color VARCHAR(30)`) live during the viva.

## Key SQL Queries for Viva Explanation

### CREATE
```sql
INSERT INTO Pets (pet_id, name, breed, age, gender, weight_kg,
                  intake_date, adoption_status, microchip_id, is_vaccinated, shelter_id)
VALUES ('P007', 'Bruno', 'Dachshund', 3, 'Male', 8.5,
        '2024-03-01', 'Available', 'MC007', TRUE, 'SH001');
```

### READ with filter
```sql
SELECT p.*, s.shelter_name FROM Pets p
LEFT JOIN Shelter s ON p.shelter_id = s.shelter_id
WHERE p.adoption_status ILIKE '%Available%'
ORDER BY p.pet_id;
```

### UPDATE
```sql
UPDATE Pets
SET name = 'Brownie', breed = 'Dachshund', age = 4,
    adoption_status = 'Reserved', is_vaccinated = TRUE
WHERE pet_id = 'P007';
```

### DELETE
```sql
DELETE FROM Pets WHERE pet_id = 'P007';
-- Cascades to: Dog/Cat/Other_Animal, Pet_Photos,
--              Adoption_Applications, Appointments, Medical_Records, Staff_Pet
```

### Trigger fire example
```sql
-- This UPDATE fires trg_approval_status:
UPDATE Adoption_Applications
SET status = 'Approved'
WHERE application_id = 'A001';
-- Result: Pets table automatically updates P001 adoption_status → 'Adopted'
```

## Pages to Demo During Viva (in order)
1. `index.php` — show dashboard with all counts and relationship table
2. `pets.php` — show READ table with search filter
3. `pets.php?action=add` — show CREATE form, fill it, submit, show success
4. `pets.php?action=edit&id=P001` — show UPDATE form, change a field, show before/after
5. `pets.php?action=delete&id=P007` — show DELETE confirmation page, confirm
6. `applications.php?action=edit&id=A003` — change status to Approved → show trigger firing
7. `views.php` — show all 3 live views + audit log from trigger
8. Modification: add a column live in pgAdmin, update pets.php to include it

## Notes for Agent
- All PHP pages use `session_start()` at the top — required for flash messages
- All SQL values are escaped using `esc($conn, $val)` which calls `pg_escape_string()`
- The `providers.php` file is copied to `staff.php`, `donations.php`, `medical.php`,
  `training.php` — they all use `basename($_SERVER['PHP_SELF'])` to detect which
  entity to show, driven by the `$configs` array in that file
- `update_result.php` is shared across all entities — it reads from `$_SESSION`
- `header.php` includes all CSS, Bootstrap, navbar, and flash message display
- `footer.php` closes all HTML tags and loads Bootstrap JS
