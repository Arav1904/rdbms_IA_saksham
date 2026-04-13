================================================================
PET ADOPTION AND CARE SYSTEM — VANILLA JS / HTML REWRITE
RDBMS Lab CA Activity 1
Technology: Node.js + Express + PostgreSQL
================================================================

This project runs entirely on Node.js with vanilla HTML, CSS, and JavaScript.
There is no PHP runtime and no XAMPP dependency.

WHAT THIS PROJECT IS
================================================================

This is a shelter-management CRUD application backed by PostgreSQL.
It keeps the same academic database scope as the original coursework system:

- 22 tables
- 11 relationship patterns
- 4 specialization families
- 3 triggers
- 3 views

The rewrite keeps the same database story while making the app easier to run,
easier to present, and easier to extend.

QUICK START
================================================================

1. Create a PostgreSQL database named `pet_adoption_db`
2. Run `setup.sql`
3. Set:
   `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
4. Start the app:

   `npm start`

5. Open:

   `http://localhost:3000/`

Optional commands:

- `npm run dev` → watch mode
- `npm run check` → syntax verification

KEY ROUTES
================================================================

- `/` → dashboard
- `/pets` → pet CRUD and species specialization
- `/adopters` → adopter CRUD and overlapping specialization
- `/applications` → adoption workflow and trigger behavior
- `/appointments` → appointment CRUD and trigger enforcement
- `/providers` → providers plus subclass context
- `/medical` → medical record CRUD
- `/staff` → staff plus subclass and assignment context
- `/donations` → donation CRUD
- `/training` → training CRUD and dog-program mapping
- `/views` → database views, trigger summaries, audit rows

PROJECT FILES
================================================================

- `server.js` → app entrypoint
- `src/app.js` → HTML route handling and page flows
- `src/api.js` → JSON API and metadata-aware CRUD helpers
- `src/db.js` → PostgreSQL connection pool
- `src/entities.js` → entity metadata, stats, relationships, views, triggers
- `src/render.js` → shared rendering helpers
- `src/options.js` → select field option queries
- `public/styles.css` → design system and responsive styling
- `public/app.js` → small client-side interaction helpers
- `setup.sql` → schema, views, triggers, sample data

DOCUMENTATION
================================================================

- `DESIGN.md` → visual direction and UI rules
- `PROJECT_GUIDE.md` → full architecture, flows, and system explanation

NOTES
================================================================

- PostgreSQL must be running for data pages to work.
- If credentials are wrong, the app still starts and shows a runtime error page.
- The app also exposes JSON routes such as `/api/health`, `/api/meta`, and `/api/dashboard`.
