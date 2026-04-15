# Pet Adoption And Care System

## Executive Summary
This project is a complete runtime rewrite of a pet adoption coursework application. The old implementation depended on PHP and XAMPP. The current implementation runs entirely on Node.js, Express, vanilla HTML, vanilla CSS, vanilla JavaScript, and PostgreSQL.

The rewrite does not change the data model. It preserves the same PostgreSQL schema, the same triggers, the same views, the same specialization tables, and the same CRUD-oriented workflow. What changed is the runtime, the frontend structure, and the overall usability.

## Project Goals
- Keep the original database model intact.
- Keep the original CRUD and demo behavior intact.
- Remove the PHP/XAMPP dependency chain.
- Improve the presentation quality for users, demos, and viva explanation.
- Make the system easier to run, inspect, and extend.

## What The System Does
At a product level, the app manages a pet shelter workflow:
- pets and their subclass types
- adopters and their subclass types
- adoption applications
- provider appointments
- medical records
- staff and staff assignments
- donations
- training programs
- support tables, audit rows, views, and trigger behavior

At an academic level, the app demonstrates:
- strong entities
- weak entities
- specialization / generalization
- many-to-many relationships
- identifying relationships
- PostgreSQL triggers
- PostgreSQL views

## Rewrite Scope
### Preserved
- database schema names
- table semantics
- trigger behavior
- view behavior
- CRUD routes and page coverage
- before/after update comparison flow
- dashboard and relationship explanation

### Improved
- app runtime
- deployment simplicity
- visual hierarchy
- navigation clarity
- form readability
- documentation quality
- project structure

## Technology Stack
- Runtime: Node.js
- Server: Express
- Database: PostgreSQL
- Frontend: vanilla HTML, CSS, JavaScript
- DB client: `pg`

## Architecture
### High-level flow
1. A request hits an HTML route such as `/pets` or `/applications`.
2. The Express app loads entity metadata and runs PostgreSQL queries.
3. The server renders HTML using shared view helpers.
4. CSS and lightweight client-side JavaScript improve the interaction layer.
5. The same backend also exposes JSON endpoints for structured access.

### Why this architecture
This architecture keeps the simplicity of a server-rendered CRUD system while removing PHP/XAMPP. It also avoids introducing a frontend framework where the problem does not need one.

The result is:
- easier local setup
- fewer moving parts
- less duplicated page logic
- clearer separation between data metadata, rendering helpers, and route logic

## File Guide
### Runtime entrypoint
- [server.js](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/server.js)
  Starts the Express application and binds it to the configured port.

### Server layer
- [src/app.js](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/src/app.js)
  Main route controller for HTML pages. Handles page rendering, CRUD flow orchestration, dashboard, view pages, flash messages, update comparison pages, and runtime error pages.

- [src/api.js](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/src/api.js)
  Structured data layer for metadata-aware CRUD operations and JSON API responses. This file is the main abstraction over entity configuration and query behavior.

- [src/db.js](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/src/db.js)
  PostgreSQL connection pool and shared query helpers.

- [src/entities.js](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/src/entities.js)
  Declarative metadata for dashboard stats, entity groups, relationships, triggers, and views. This file is the main source of truth for what the app exposes.

- [src/options.js](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/src/options.js)
  SQL lookup definitions for form select inputs.

- [src/render.js](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/src/render.js)
  Shared rendering primitives for shell layout, cards, data tables, action bars, forms, and dashboard composition.

### Frontend layer
- [public/styles.css](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/public/styles.css)
  Custom design system and responsive layout rules.

- [public/app.js](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/public/app.js)
  Small progressive enhancement layer for mobile nav and conditional form panels.

- [public/index.html](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/public/index.html)
  Static shell asset retained with the frontend layer. The main runtime is route-driven through Express.

### Database and configuration
- [setup.sql](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/setup.sql)
  Schema creation, triggers, views, sample data, and verification query.

- [.env.example](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/.env.example)
  Environment variable template.

### Documentation
- [README.txt](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/README.txt)
  Quick-start instructions.

- [DESIGN.md](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/DESIGN.md)
  Design direction and visual rules.

- [PROJECT_GUIDE.md](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/PROJECT_GUIDE.md)
  Full project explanation.

## Route Map
### Main HTML routes
- `/`
- `/pets`
- `/adopters`
- `/applications`
- `/appointments`
- `/providers`
- `/medical`
- `/staff`
- `/donations`
- `/training`
- `/views`
- `/shelters`
- `/dogs`
- `/cats`
- `/other-animals`
- `/pet-photos`
- `/individuals`
- `/organizations`
- `/references`
- `/veterinarians`
- `/groomers`
- `/availability`
- `/volunteers`
- `/employees`
- `/staff-pet`
- `/dog-training`
- `/audit-log`
- `/update-result`

### API routes
- `GET /api/health`
- `GET /api/meta`
- `GET /api/dashboard`
- `GET /api/entities`
- `GET /api/entities/:key/metadata`
- `GET /api/entities/:key/rows`
- `GET /api/entities/:key/records`
- `GET /api/entities/:key/record`
- `GET /api/entities/:key/record/:id`
- `POST /api/entities/:key`
- `PUT /api/entities/:key`
- `PATCH /api/entities/:key`
- `DELETE /api/entities/:key`
- `GET /api/entities/:key/options/:field`
- `GET /api/entities/:key/options?field=...`
- `GET /api/views`
- `GET /api/views/:key`
- `GET /api/views/:key/data`
- `GET /api/relationships`
- `GET /api/triggers`

## Database Coverage
### Core entities
- `Shelter`
- `Pets`
- `Adopters`
- `Pet_Care_Providers`
- `Staff`
- `Donation`
- `Training_Programs`

### Weak / dependent entities
- `Adoption_Applications`
- `Appointments`
- `Medical_Records`
- `References_Table`

### Specialization tables
- `Dog`
- `Cat`
- `Other_Animal`
- `Individual`
- `Organization`
- `Veterinarian`
- `Groomer`
- `Volunteer`
- `Employee`

### Support and junction tables
- `Pet_Photos`
- `Provider_Availability`
- `Staff_Pet`
- `Dog_Training`
- `Application_Audit`

## Business Rules Preserved
### Trigger rules
- `trg_approval_status`
  When an adoption application becomes `Approved`, the related pet is marked `Adopted`.

- `trg_check_pet_status`
  Appointment creation is blocked for pets that are already adopted.

- `trg_log_application`
  Each new adoption application creates an audit log row.

### View rules
- `Available_Pets`
  Shows only pets whose adoption status is `Available`.

- `Pending_Applications_View`
  Shows pending applications joined with pet and adopter context.

- `Pet_Appointment_History`
  Shows appointment history joined with pet and provider context.

## Major User Flows
### Dashboard flow
The dashboard is the orientation page. It summarizes counts, highlights the main workflow tables, exposes the support table directory, and shows the relationship map of the schema.

### Pet flow
Users can create, edit, delete, filter, and inspect pets. The pet flow also handles specialization into Dog, Cat, or Other Animal without breaking the main pet table workflow.

### Adopter flow
Users can manage adopters while also assigning overlapping specialization into Individual and Organization.

### Application flow
Users can manage adoption applications and directly demonstrate trigger behavior by approving an application and observing the pet status update.

### Appointment flow
Users can manage appointments and demonstrate trigger enforcement when an adopted pet is blocked from receiving a new appointment.

### Views and audit flow
Users can inspect all views, trigger descriptions, and recent audit rows from a single page.

### Update comparison flow
After an edit, the app can show a before/after snapshot to support academic explanation and demo clarity.

## UI / UX Direction
The UI is intentionally not a generic enterprise admin dashboard. It uses a warmer editorial look designed to make a dense schema-driven app easier to scan and easier to present.

### Visual decisions
- warm paper-toned surfaces
- strong typography and section framing
- grouped sticky navigation
- clear status pills
- softer gradients instead of flat blocks
- responsive cards and tables

### UX decisions
- dashboard explains the system instead of only listing tables
- primary and support routes are separated
- entity cards include context, not just names
- action buttons are consistent across the app
- form sections are grouped and easier to scan
- DB failure states explain what to fix instead of just crashing

## Setup
### 1. Create the database
Create a PostgreSQL database named `pet_adoption_db`.

### 2. Load the schema
Run [setup.sql](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/setup.sql) in pgAdmin or another PostgreSQL client.

### 3. Set environment variables
Use [.env.example](/Users/sakshamtyagi/Downloads/files%20(1)/petadoption/.env.example) as the template.

Required values:
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`

Optional:
- `PORT`

### 4. Start the app
From the workspace root:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

Verification:

```bash
npm run check
```

## Error Model
If PostgreSQL is not reachable:
- the Node process still starts
- HTML pages render a useful runtime error page
- API endpoints return structured error JSON

This choice keeps the app debuggable and demo-friendly.

## Verification Status
### Verified in code
- JS-only codebase
- no PHP files remain
- syntax checks pass
- health endpoint responds
- project guide is served by the app

### Still best verified with a live database
- CRUD operations on real data
- trigger effects after mutations
- view results against actual rows
- full page-level parity against your intended PostgreSQL instance

## Demo Script
1. Open `/`
2. Explain the system summary and relationship table
3. Open `/pets`
4. Create or edit a pet
5. Open `/adopters`
6. Open `/applications`
7. Approve an application
8. Return to `/pets` and show adopted state
9. Open `/appointments` and explain appointment restrictions
10. Open `/views`
11. Show `/update-result`

## Final Summary
This project is now a cleaner and easier-to-run version of the same underlying system. The database story stays the same. The runtime, UI, and documentation are what changed. That makes the project better for demos, coursework explanation, and future extension without sacrificing the original schema-driven scope.
