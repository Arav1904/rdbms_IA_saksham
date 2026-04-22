# Pet Adoption and Care System - RDBMS Lab Project

## Project Structure
- `backend/` - Node.js Express server
- `frontend/` - HTML, CSS, and JS files
- `setup.sql` - PostgreSQL schema, triggers, views, and sample data
- `docs/EER_Diagram.md` - EER diagram and specialization notes used for viva/presentation
- `docs/EER_Diagram_Presentation.html` - visual EER sheet for screenshot/export in presentation

## How to Run

1. Open pgAdmin, create a database named `pet_adoption_db`.
2. Open the Query Tool in pgAdmin and run all the SQL in `setup.sql`.
3. Rename `backend/.env.example` to `backend/.env` and enter your PostgreSQL database password.
4. Open the terminal in the main project folder and run:
   ```bash
   npm install
   npm run install:all
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`.
6. Sign in with a user stored in the database. The SQL script seeds one backend user by default:
   - Username: `admin`
   - Password: `admin123`

## Backend-Backed Data Contract

The frontend no longer uses browser-only demo users or mock entity data. The UI reads live application data from the Express backend, and the backend reads or writes that data in PostgreSQL.

## Final Verification Against Requirements

This repository now satisfies the original cleanup requirements:

1. Frontend modules match the SQL schema.
   - Present end-to-end modules: `Dashboard`, `Pets`, `Adopters`, `Applications`, `Appointments`, `Care Providers`, `Staff`, `Authentication`.
   - Removed from live app and schema: `Donations`, `Medical`, `Training`.
2. Frontend data comes from the backend.
   - Entity pages fetch data through `/api/...` routes.
   - Browser `localStorage` is only used to remember the signed-in user session after backend login.
3. Authentication is backend-backed.
   - Users are stored in the `App_Users` table.
   - Login and register go through `/api/auth/login` and `/api/auth/register`.
4. README documents the backend calls and the practical commands needed for viva/demo use.

## Practical Commands For Faculty Demo

Use these exactly if you are asked to show setup, execution, verification, or live operations.

### 1. Start the Project

From the project root:

```bash
npm install
npm run install:all
npm start
```

Open:

```text
http://localhost:3000
```

### 2. Prepare the Database in pgAdmin

1. Create database: `pet_adoption_db`
2. Open Query Tool
3. Run the full contents of `setup.sql`

If faculty asks how to re-run cleanly:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Then run the full `setup.sql` script again.

### 3. Verify the Database Loaded Correctly

Run:

```sql
SELECT * FROM Available_Pets;
SELECT * FROM Pending_Applications_View;
SELECT * FROM Pet_Appointment_History;
```

Check table counts:

```sql
SELECT 'Shelter' AS table_name, COUNT(*) AS rows FROM Shelter
UNION ALL SELECT 'Pets', COUNT(*) FROM Pets
UNION ALL SELECT 'Dog', COUNT(*) FROM Dog
UNION ALL SELECT 'Cat', COUNT(*) FROM Cat
UNION ALL SELECT 'Other_Animal', COUNT(*) FROM Other_Animal
UNION ALL SELECT 'Adopters', COUNT(*) FROM Adopters
UNION ALL SELECT 'Individual', COUNT(*) FROM Individual
UNION ALL SELECT 'Organization', COUNT(*) FROM Organization
UNION ALL SELECT 'Adoption_Applications', COUNT(*) FROM Adoption_Applications
UNION ALL SELECT 'Pet_Care_Providers', COUNT(*) FROM Pet_Care_Providers
UNION ALL SELECT 'Veterinarian', COUNT(*) FROM Veterinarian
UNION ALL SELECT 'Groomer', COUNT(*) FROM Groomer
UNION ALL SELECT 'Appointments', COUNT(*) FROM Appointments
UNION ALL SELECT 'Staff', COUNT(*) FROM Staff
UNION ALL SELECT 'Volunteer', COUNT(*) FROM Volunteer
UNION ALL SELECT 'Employee', COUNT(*) FROM Employee
UNION ALL SELECT 'Staff_Pet', COUNT(*) FROM Staff_Pet
UNION ALL SELECT 'App_Users', COUNT(*) FROM App_Users
ORDER BY table_name;
```

### 4. Verify the Backend Is Connected

In the browser:

```text
http://localhost:3000/api/health
```

Or from terminal:

```bash
curl http://localhost:3000/api/health
```

Expected result:
- `status: ok`
- `database: connected`

### 5. Test Backend Authentication

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Register a new user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Faculty Demo","email":"faculty@example.com","username":"faculty_demo","password":"faculty123","role":"Staff"}'
```

### 6. Show Live API Reads

Pets:

```bash
curl http://localhost:3000/api/pets
curl http://localhost:3000/api/pets/P001
```

Adopters:

```bash
curl http://localhost:3000/api/adopters
curl http://localhost:3000/api/adopters/AD001
```

Applications:

```bash
curl http://localhost:3000/api/applications
```

Appointments:

```bash
curl http://localhost:3000/api/appointments
```

Dashboard:

```bash
curl http://localhost:3000/api/dashboard/stats
curl http://localhost:3000/api/dashboard/breed-distribution
curl http://localhost:3000/api/dashboard/monthly-intakes
curl http://localhost:3000/api/dashboard/recent-activity
```

### 7. Show Live API Writes

Create a pet:

```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -d '{
    "pet_id":"P999",
    "name":"DemoPet",
    "breed":"Indie",
    "age":2,
    "gender":"Male",
    "weight_kg":10.5,
    "intake_date":"2026-04-17",
    "is_vaccinated":true,
    "shelter_id":"SH001",
    "type":"Dog",
    "size":"Medium",
    "is_trained":false
  }'
```

Update a pet:

```bash
curl -X PUT http://localhost:3000/api/pets/P999 \
  -H "Content-Type: application/json" \
  -d '{
    "name":"DemoPetUpdated",
    "breed":"Indie Mix",
    "age":3,
    "weight_kg":11.0,
    "adoption_status":"Available",
    "is_vaccinated":true
  }'
```

Delete a pet:

```bash
curl -X DELETE http://localhost:3000/api/pets/P999
```

Create an application:

```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "application_id":"A999",
    "application_date":"2026-04-17",
    "adopter_id":"AD001",
    "pet_id":"P001",
    "notes":"Faculty demo application"
  }'
```

Approve an application:

```bash
curl -X PATCH http://localhost:3000/api/applications/A999/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Approved"}'
```

After approval, verify the trigger worked:

```sql
SELECT pet_id, name, adoption_status
FROM Pets
WHERE pet_id = 'P001';
```

### 8. Demonstrate Trigger Protection

Try to create an appointment for an adopted pet:

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id":"APT999",
    "appointment_date":"2026-04-18",
    "service_type":"Checkup",
    "duration_mins":30,
    "notes":"Should fail for adopted pet",
    "pet_id":"P002",
    "provider_id":"PR001"
  }'
```

Expected result:
- PostgreSQL trigger rejects the insert if the pet is already adopted.

### 9. Show That Audit Logging Works

After inserting an application, run:

```sql
SELECT *
FROM Application_Audit
ORDER BY logged_at DESC;
```

### 10. Show Search / Pagination Practically

Pets search:

```bash
curl "http://localhost:3000/api/pets?search=Buddy&page=1&limit=12"
```

Adopters search:

```bash
curl "http://localhost:3000/api/adopters?search=Riya&page=1&limit=10"
```

Applications filter:

```bash
curl "http://localhost:3000/api/applications?status=Pending&page=1&limit=10"
```

### 11. Show How to Add a New Column Live

If faculty asks for schema modification, example:

```sql
ALTER TABLE Pets ADD COLUMN pet_nickname VARCHAR(100);
```

Then confirm:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pets'
ORDER BY ordinal_position;
```

### 12. Show Existing Triggers Practically

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('adoption_applications', 'appointments')
ORDER BY event_object_table, trigger_name;
```

### 13. Show Existing Views Practically

```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Example Commands Cheat Sheet

These are short practical commands you can quickly run during the demo.

### Quick Startup

```bash
npm install
npm run install:all
npm start
```

### Quick Health Check

```bash
curl http://localhost:3000/api/health
```

### Quick Login Test

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Quick Dashboard Test

```bash
curl http://localhost:3000/api/dashboard/stats
curl http://localhost:3000/api/dashboard/recent-activity
```

### Quick CRUD Test

Create:

```bash
curl -X POST http://localhost:3000/api/adopters \
  -H "Content-Type: application/json" \
  -d '{"adopter_id":"AD999","first_name":"Demo","last_name":"User","email":"demo@example.com","phone":"9999999999","address":"Mumbai","type":"Individual","occupation":"Tester"}'
```

Read:

```bash
curl http://localhost:3000/api/adopters/AD999
```

Delete:

```bash
curl -X DELETE http://localhost:3000/api/adopters/AD999
```

### Quick Trigger Test

Approve application:

```bash
curl -X PATCH http://localhost:3000/api/applications/A001/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Approved"}'
```

Verify pet status in SQL:

```sql
SELECT pet_id, adoption_status
FROM Pets
WHERE pet_id = 'P001';
```

### Quick Audit Test

```sql
SELECT *
FROM Application_Audit
ORDER BY logged_at DESC;
```

## Easy Viva

### 1. What is the aim of this project?
This project manages pet adoption and care operations using a PostgreSQL database, an Express backend, and a frontend built with HTML, CSS, and JavaScript.

### 2. What are the main modules in the current project?
The current live modules are `Authentication`, `Dashboard`, `Pets`, `Adopters`, `Applications`, `Appointments`, `Care Providers`, and `Staff`.

### 3. Which parts are database related?
The database stores shelters, pets, adopters, adoption applications, care providers, appointments, staff, staff-pet assignments, application audit logs, and app users.

### 4. How does the application use the database?
The frontend sends HTTP requests to the backend. The backend runs SQL queries on PostgreSQL and returns JSON back to the frontend.

### 5. What technology stack is used?
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: PostgreSQL

### 6. Why did you use PostgreSQL?
Because it supports strong relational constraints, joins, triggers, views, and transaction handling, which fit this RDBMS project well.

### 7. What are the main entity tables?
`Shelter`, `Pets`, `Adopters`, `Adoption_Applications`, `Pet_Care_Providers`, `Appointments`, `Staff`, and `App_Users`.

### 8. What are the subclass tables?
`Dog`, `Cat`, `Other_Animal`, `Individual`, `Organization`, `Veterinarian`, `Groomer`, `Volunteer`, and `Employee`.

### 9. What are the current views?
`Available_Pets`, `Pending_Applications_View`, and `Pet_Appointment_History`.

### 10. What is the purpose of the backend?
The backend is the middle layer between the frontend and the database. It receives requests, runs SQL safely, and returns results to the UI.

## Medium Viva

### 1. Why did you use subclasses like `Dog`, `Cat`, and `Other_Animal`?
They represent specialization. Shared attributes stay in `Pets`, while type-specific attributes stay in subtype tables. This reduces null values and keeps the schema clean.

### 2. Why is `Adoption_Applications` an associative or weak entity?
Because it exists to connect `Adopters` and `Pets` and depends on them for meaning.

### 3. Why is `Staff_Pet` a junction table?
Because staff and pets have a many-to-many relationship.

### 4. How does the dashboard use the database?
The dashboard frontend calls backend routes like `/api/dashboard/stats`, `/api/dashboard/breed-distribution`, `/api/dashboard/monthly-intakes`, and `/api/dashboard/recent-activity`. Those routes run SQL queries using aggregation, joins, and grouping.

### 5. How is CRUD implemented in the application?
- Create: frontend forms call `POST /api/...`
- Read: pages call `GET /api/...`
- Update: forms or action buttons call `PUT` or `PATCH`
- Delete: buttons call `DELETE`

### 6. How do you prevent invalid data?
Using primary keys, foreign keys, `CHECK` constraints, parameterized queries, triggers, and transactions.

### 7. What happens when an application is approved?
The backend updates the application status, then the database trigger changes the related pet status to `Adopted`.

### 8. Why can’t adopted pets be assigned new appointments?
Because the database trigger `trg_check_pet_status` blocks inserts into `Appointments` for pets whose `adoption_status` is `Adopted`.

### 9. How is authentication handled now?
Users are stored in `App_Users`. The frontend calls `/api/auth/login` and `/api/auth/register`. The backend validates credentials against PostgreSQL.

### 10. Why were donations, medical, and training removed?
Because they were not fully aligned across schema, backend routes, and frontend UI. The project was reduced to the features that are implemented end to end.

## Tough Viva

### 1. Why did you choose specialization tables instead of one large `Pets` table?
One large table would contain many irrelevant nullable fields. Specialization is more normalized and models inheritance properly in a relational system.

### 2. What normalization ideas are visible in this schema?
Entity separation, subtype decomposition, junction tables for many-to-many relationships, and the reduction of repeated data through foreign keys.

### 3. Is this schema normalized?
It is largely normalized around core entities and relationships. Shared and specialized attributes are separated, many-to-many mappings are isolated, and redundant data is minimized.

### 4. Why use triggers instead of only frontend validation?
Frontend validation can be bypassed. Database triggers enforce business rules at the data layer for every client.

### 5. Why are parameterized queries important?
They prevent SQL injection by separating query structure from user input values.

### 6. What is the difference between a view and a table here?
A table physically stores data. A view stores a query definition and shows derived results when queried.

### 7. Why use `ON DELETE CASCADE` in some relationships?
It removes dependent child rows automatically and avoids orphan records.

### 8. Why use transactions in some routes?
Because some operations affect multiple related tables. Transactions ensure all related inserts happen together or all fail together.

### 9. Why is backend-backed auth better than browser-only auth?
Browser-only auth is not a real system of record. Backend-backed auth stores users in PostgreSQL and validates them on the server.

### 10. How would you improve this project further?
Add secure session handling or JWTs, stronger validation, role-based authorization, automated tests, and deployment configuration.

## Live Practical Tasks

These are practical tasks faculty may ask you to perform live.

### 1. Run the application

```bash
npm install
npm run install:all
npm start
```

### 2. Show backend connectivity

```bash
curl http://localhost:3000/api/health
```

### 3. Show login works using backend data

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 4. Show a dashboard query

```bash
curl http://localhost:3000/api/dashboard/stats
```

### 5. Show pet listing

```bash
curl http://localhost:3000/api/pets
```

### 6. Show filtered search

```bash
curl "http://localhost:3000/api/pets?search=Buddy&page=1&limit=12"
curl "http://localhost:3000/api/applications?status=Pending&page=1&limit=10"
```

### 7. Create a new adopter

```bash
curl -X POST http://localhost:3000/api/adopters \
  -H "Content-Type: application/json" \
  -d '{"adopter_id":"AD999","first_name":"Demo","last_name":"User","email":"demo@example.com","phone":"9999999999","address":"Mumbai","type":"Individual","occupation":"Tester"}'
```

### 8. Create a new pet

```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -d '{
    "pet_id":"P999",
    "name":"DemoPet",
    "breed":"Indie",
    "age":2,
    "gender":"Male",
    "weight_kg":10.5,
    "intake_date":"2026-04-17",
    "is_vaccinated":true,
    "shelter_id":"SH001",
    "type":"Dog",
    "size":"Medium",
    "is_trained":false
  }'
```

### 9. Create and approve an application

```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "application_id":"A999",
    "application_date":"2026-04-17",
    "adopter_id":"AD001",
    "pet_id":"P001",
    "notes":"Faculty demo application"
  }'
```

```bash
curl -X PATCH http://localhost:3000/api/applications/A999/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Approved"}'
```

Verify trigger result:

```sql
SELECT pet_id, name, adoption_status
FROM Pets
WHERE pet_id = 'P001';
```

### 10. Show audit logging

```sql
SELECT *
FROM Application_Audit
ORDER BY logged_at DESC;
```

### 11. Show trigger protection

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id":"APT999",
    "appointment_date":"2026-04-18",
    "service_type":"Checkup",
    "duration_mins":30,
    "notes":"Should fail for adopted pet",
    "pet_id":"P002",
    "provider_id":"PR001"
  }'
```

### 12. Show views practically

```sql
SELECT * FROM Available_Pets;
SELECT * FROM Pending_Applications_View;
SELECT * FROM Pet_Appointment_History;
```

### 13. Show live schema modification

```sql
ALTER TABLE Pets ADD COLUMN pet_nickname VARCHAR(100);
```

Verify:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pets'
ORDER BY ordinal_position;
```

## How SQL And Application Are Connected

This is the key explanation for both database and application questions.

### 1. Frontend Layer
The frontend pages collect input and display data. They do not directly talk to PostgreSQL.

### 2. Backend Layer
The backend exposes routes such as:
- `/api/pets`
- `/api/adopters`
- `/api/applications`
- `/api/appointments`
- `/api/providers`
- `/api/staff`
- `/api/dashboard/...`
- `/api/auth/...`

Each route runs SQL queries through the `pg` driver.

### 3. Database Layer
PostgreSQL stores the actual data, enforces constraints, executes triggers, and serves views.

### 4. Full Flow Example
If a user submits a new application in the browser:
1. Frontend sends `POST /api/applications`
2. Backend inserts into `Adoption_Applications`
3. Trigger logs the insert in `Application_Audit`
4. If status is later changed to `Approved`, another trigger updates the matching pet to `Adopted`
5. Frontend refreshes and shows updated data

## Run And Deploy

### Local Run

1. Set up PostgreSQL and run `setup.sql`
2. Create `backend/.env` from `backend/.env.example`
3. Start the app:

```bash
npm install
npm run install:all
npm start
```

4. Open:

```text
http://localhost:3000
```

### Environment Variables

The backend uses:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pet_adoption_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
PORT=3000
```

### Simple Deployment Idea

For a basic deployment:
1. Host PostgreSQL on a server or managed database
2. Copy the project to the deployment machine
3. Set `backend/.env` with production database values
4. Run:

```bash
npm install
npm run install:all
npm start
```

5. Put the Node.js server behind a reverse proxy like Nginx if needed

### Important Deployment Note

This project is suitable for academic demonstration and local deployment. For production-grade deployment, you would still add:
- secure session handling
- HTTPS
- stronger password policy
- input validation hardening
- logging and monitoring
- process manager such as PM2 or Docker

### Authentication
- `POST /api/auth/login`
  - Used by: `frontend/login.html`
  - Reads from: `App_Users`
- `POST /api/auth/register`
  - Used by: `frontend/login.html`
  - Writes to: `App_Users`

### Dashboard
- `GET /api/dashboard/stats`
  - Used by: `frontend/index.html`, `frontend/login.html`
  - Reads from: `Pets`, `Adopters`, `Adoption_Applications`, `Appointments`
- `GET /api/dashboard/breed-distribution`
  - Used by: `frontend/index.html`
  - Reads from: `Pets`
- `GET /api/dashboard/monthly-intakes`
  - Used by: `frontend/index.html`
  - Reads from: `Pets`
- `GET /api/dashboard/recent-activity`
  - Used by: `frontend/index.html`
  - Reads from: `Adoption_Applications`, `Adopters`, `Pets`, `Appointments`, `Pet_Care_Providers`

### Pets
- `GET /api/pets`
  - Used by: `frontend/pets.html`
  - Reads from: `Pets`, `Dog`, `Cat`, `Other_Animal`, `Shelter`
- `GET /api/pets/:id`
  - Used by: `frontend/pets.html`
  - Reads from: `Pets`, `Dog`, `Cat`, `Other_Animal`, `Shelter`, `Appointments`, `Pet_Care_Providers`
- `POST /api/pets`
  - Used by: `frontend/pets.html`
  - Writes to: `Pets` and one of `Dog`, `Cat`, or `Other_Animal`
- `PUT /api/pets/:id`
  - Used by: `frontend/pets.html`
  - Writes to: `Pets`
- `DELETE /api/pets/:id`
  - Used by: `frontend/pets.html`
  - Deletes from: `Pets`

### Adopters
- `GET /api/adopters`
  - Used by: `frontend/adopters.html`
  - Reads from: `Adopters`, `Individual`, `Organization`, `Adoption_Applications`
- `GET /api/adopters/:id`
  - Used by: `frontend/adopters.html`
  - Reads from: `Adopters`, `Individual`, `Organization`, `Adoption_Applications`, `Pets`
- `POST /api/adopters`
  - Used by: `frontend/adopters.html`
  - Writes to: `Adopters` and one of `Individual` or `Organization`
- `DELETE /api/adopters/:id`
  - Used by: `frontend/adopters.html`
  - Deletes from: `Adopters`

### Applications
- `GET /api/applications`
  - Used by: `frontend/applications.html`
  - Reads from: `Adoption_Applications`, `Pets`, `Adopters`
- `POST /api/applications`
  - Used by: `frontend/applications.html`
  - Writes to: `Adoption_Applications`
  - Trigger side effect: inserts into `Application_Audit`
- `PATCH /api/applications/:id/status`
  - Used by: `frontend/applications.html`
  - Writes to: `Adoption_Applications`
  - Trigger side effect: may update `Pets.adoption_status` to `Adopted`
- `DELETE /api/applications/:id`
  - Used by: `frontend/applications.html`
  - Deletes from: `Adoption_Applications`

### Appointments
- `GET /api/appointments`
  - Used by: `frontend/appointments.html`
  - Reads from: `Appointments`, `Pets`, `Pet_Care_Providers`
- `POST /api/appointments`
  - Used by: `frontend/appointments.html`
  - Writes to: `Appointments`
  - Trigger side effect: blocked for adopted pets
- `DELETE /api/appointments/:id`
  - Used by: `frontend/appointments.html`
  - Deletes from: `Appointments`

### Care Providers
- `GET /api/providers`
  - Used by: `frontend/providers.html`
  - Reads from: `Pet_Care_Providers`, `Veterinarian`, `Groomer`, `Appointments`
- `POST /api/providers`
  - Used by: `frontend/providers.html`
  - Writes to: `Pet_Care_Providers` and one of `Veterinarian` or `Groomer`

### Staff
- `GET /api/staff`
  - Used by: `frontend/staff.html`
  - Reads from: `Staff`, `Volunteer`, `Employee`, `Staff_Pet`
- `POST /api/staff`
  - Used by: `frontend/staff.html`
  - Writes to: `Staff` and one of `Volunteer` or `Employee`

## Project Details: Questions & Explanations

### 1. What does this database model?
This project models a Pet Adoption and Care System. It handles the shelter workflows that are actually present in the current app:
- **Shelter & Staff Management**: Tracking employees, volunteers, and the shelter details.
- **Pet Management**: Storing details for pets (Dogs, Cats, Other Animals), mapping subclasses to handle species-specific traits.
- **Pet Care**: Matching care providers (Veterinarians, Groomers) with pets through appointments.
- **Adoptions**: Recording adopters alongside adoption applications.
- **Dashboard Reporting**: Summarizing pet counts, application counts, recent activity, breed mix, and monthly intake trends.

### 2. How did you structure the entity-relationships?
- **Specialization/Subclasses**: We used specialization for `Pets` (subclassed into `Dog`, `Cat`, `Other_Animal`) and for `Adopters` (`Individual`, `Organization`). Care Providers are also subclassed into `Veterinarian` and `Groomer`. This limits null values and organizes specific attributes efficiently.
- **M:N (Many-to-Many) Relationships**: `Staff_Pet` handles the many-to-many relationship where many staff members can care for many pets.
- **Weak Entities**: `Adoption_Applications` act as a weak mapping between `Pets` and `Adopters`. `Appointments` serve to map `Pets` with `Pet_Care_Providers`.

### 3. How does the application ensure data integrity?
We enforce data integrity using multiple constraints and PostgreSQL functions:
- **Foreign Keys**: Ensure child entities rely on valid parents (e.g., you cannot adopt an invalid `pet_id`). They cascade gracefully (e.g., deleting a pet removes its species subclass mapped rows automatically).
- **Check Constraints**: Control data logic strictly at the schema layer (e.g., `age >= 0`, `status IN ('Available','Adopted','Reserved')`).
- **Triggers**:
  - We use a trigger to auto-update a Pet's status to `Adopted` whenever an application is moved to `Approved`.
  - We actively prevent appointments from being created for pets that have been `Adopted` using a `BEFORE INSERT` trigger in the Appointments table. 
  - We log every newly created adoption application into `Application_Audit`.

### 4. What CRUD capabilities are in the application layer?
- **Create**: The current frontend creates pets, adopters, applications, appointments, providers, and staff records.
- **Read**: The dashboard and entity pages use joined API responses with search, filters, and pagination where implemented.
- **Update**: The current frontend supports pet updates and application status changes.
- **Delete**: The current frontend supports deleting pets, adopters, applications, and appointments. Cascades in the schema clean up related rows where required.

### 5. Why was the schema streamlined (removing Donations and Medical Records)?
The current codebase is intentionally scoped to the shelter flows that are implemented end to end. Donations, medical records, and training modules are not part of the live schema or the frontend routes anymore.

**Recent Complexity Reductions:**
1. **Removed Non-Essential Modules**: `Donations`, `Medical`, and `Training` were removed so the frontend, backend, and SQL stay aligned.
2. **Kept Only Implemented CRUD**: Every major table in `setup.sql` maps to either a visible frontend page or a dashboard query.
3. **Optimized Integrity**: The streamlined design enforces the core application lifecycle cleanly: shelter intake -> pet care -> application processing -> adoption status updates.
