# AGENTS.md — ClinicFlow (instructions for Codex)

You are building **ClinicFlow**, a PERN (PostgreSQL, Express, React, Node) app for a small clinic.
This is a **junior-level technical test**: correctness, clarity and clean structure matter more than extra features.

## Read first (in this order)
1. `docs/01-architecture.md` — folder structure, stack, conventions, API contract
2. `docs/02-database.md` — DB design and justification
3. `backend/db/migrations/001_init.sql` — the exact schema (source of truth, do not change without asking)
4. `docs/03-roadmap.md` — the phases. **Work one phase at a time.**

## Working rules
- Do ONE roadmap phase per task. Stop at the end of the phase, run its checks, and summarize what was done.
- Do not start the next phase unless asked.
- Never invent endpoints, tables or columns that are not in the docs. If something is missing, ask or note it in `docs/DECISIONS.md`.
- Keep code simple and readable. No over-engineering (no microservices, no ORMs, no Redux).
- Use ES modules (`"type": "module"`) in the backend.
- Use raw SQL with the `pg` library and **parameterized queries only** (`$1, $2`). Never concatenate user input into SQL.
- Layering is strict: `routes -> controllers -> services -> db`. Controllers handle HTTP only; services hold business logic and SQL.
- Validate every request body/query/params with **Zod** (middleware `validate`).
- Passwords: **bcrypt** hash (cost 10+). Never return `password_hash` in any response or log.
- Auth: JWT in `Authorization: Bearer <token>`. Secrets come from `.env`, never hardcoded.
- All errors go through one central error handler and use the format defined in `docs/01-architecture.md`.
- Commit-sized changes, English code/identifiers, conventional commits (`feat:`, `fix:`, `chore:`, `docs:`).

## Definition of done (every phase)
- App starts without errors (`npm run dev`)
- Phase acceptance checks in `docs/03-roadmap.md` pass
- No unused files, no `console.log` leftovers, no secrets committed
- README updated if commands/env changed
