# Pet Adoption System Design

## Direction
The rewrite keeps the app's academic CRUD scope and schema visibility, but moves the frontend away from Bootstrap-admin styling into a warmer editorial dashboard. The interface should feel like an operations notebook for a shelter team: tactile cards, strong section labels, high-density data tables, and forms that are easier to scan on desktop and mobile.

## Principles
- Preserve every legacy page and workflow.
- Keep database transparency visible: show views, triggers, relationships, and SQL summaries.
- Make dense relational data feel navigable through better hierarchy, grouping, and whitespace.
- Avoid framework lock-in: plain HTML, CSS, and vanilla JavaScript only.

## Visual System
- Typography:
  - Headings: `"Plus Jakarta Sans", sans-serif`
  - Body/UI: `"Be Vietnam Pro", sans-serif`
- Color tokens:
  - `--bg`: `#f6f0e0`
  - `--surface`: `#fffaf0`
  - `--surface-strong`: `#fffdf7`
  - `--ink`: `#2d2a21`
  - `--muted`: `#6d6655`
  - `--line`: `rgba(92, 66, 30, 0.14)`
  - `--brand`: `#8f4e3b`
  - `--brand-strong`: `#6f3b2e`
  - `--teal`: `#2f6b66`
  - `--blue`: `#3867b7`
  - `--amber`: `#cb8b34`
  - `--red`: `#b84b55`
  - `--shadow`: `0 20px 50px rgba(73, 52, 27, 0.14)`
- Surfaces:
  - Rounded cards with soft paper tones
  - Layered radial and linear background gradients
  - Strong table headers and chip-based status indicators

## Layout
- Sticky navigation with grouped primary/support routes
- Hero header on dashboard and page intro cards on content screens
- Two-column and three-column grids on wide screens, single-column collapse on mobile
- Consistent page structure:
  1. intro header
  2. contextual actions
  3. main table/form card
  4. related records and schema context

## Interaction
- Flash messages for save/delete/error feedback
- Context-aware form reveals for subclass fields
- Expand/collapse mobile navigation
- Sticky action bars only where helpful; no distracting animation loops

## Content Rules
- Keep SQL examples visible on mutation screens
- Preserve relationship and trigger explanations
- Keep naming aligned with the PostgreSQL schema so the app remains viva/demo friendly
