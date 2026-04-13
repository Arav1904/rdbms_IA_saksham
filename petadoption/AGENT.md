# AGENT.md — Pet Adoption And Care System

## Project State
This project is now a Node.js + Express + PostgreSQL application with a vanilla HTML/CSS/JS frontend.

There is no PHP runtime, no XAMPP dependency, and no PHP source files in the active codebase.

## Stack
- Server: Node.js + Express
- Database: PostgreSQL
- Frontend: vanilla HTML, CSS, JavaScript
- Data access: `pg`

## Important Files
- `server.js` → app entrypoint
- `src/app.js` → HTML routes and page flows
- `src/api.js` → JSON API and CRUD helpers
- `src/db.js` → PostgreSQL pool
- `src/entities.js` → schema metadata
- `src/render.js` → shared HTML rendering helpers
- `public/styles.css` → design system
- `public/app.js` → client-side enhancement
- `setup.sql` → schema, triggers, views, sample data
- `PROJECT_GUIDE.md` → complete project explanation

## Expectations
- Keep the PostgreSQL schema intact.
- Preserve the CRUD coverage and academic/demo behavior.
- Do not reintroduce PHP or framework dependencies for the frontend.
- Prefer updating the JS route and metadata system instead of duplicating page logic.
