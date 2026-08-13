# Copilot Instructions for This Repo

## Project Purpose

- This repo is a small local-first todos app used to practice Playwright end-to-end testing.
- Favor simple, review-friendly code over abstraction-heavy designs.
- Preserve deterministic UI flows so Playwright scenarios stay stable and easy to extend.

## Stack and Architecture

- Frontend: React 18 + TypeScript + Vite.
- Routing/auth state is lightweight and client-only. There is no backend.
- Persistence uses `sql.js` in the browser, with database bytes stored in IndexedDB.
- Session state is persisted in `localStorage`.
- Main app surfaces live under `src/features`, shared auth state under `src/auth`, and persistence code under `src/db`.

## Coding Preferences

- Keep components straightforward and colocate behavior with the page or feature unless extraction clearly improves readability.
- Match the existing TypeScript style: explicit prop types, small helper functions, and clear async error handling.
- Prefer minimal dependencies. Do not add libraries unless the existing stack is clearly insufficient.
- Keep the app local-first. Do not introduce server calls, backend assumptions, or remote auth flows.
- When changing persistence behavior, preserve per-user isolation for tasks and preferences.

## Database and State Rules

- Changes to task or user data should flow through the repo functions in `src/db`.
- Keep SQL schema changes incremental and consistent with the current `sql.js` bootstrap flow in `src/db/database.ts`.
- Preserve `persistDatabase()` after mutating SQL operations.
- Maintain the current mapping pattern between snake_case database rows and camelCase app models.
- Avoid breaking the current session hydration flow in `src/auth/AuthContext.tsx`.

## UI and Testing Rules

- Preserve existing `data-testid` attributes. They are part of the public testing surface for Playwright.
- When adding new interactive UI, add stable `data-testid` values that are descriptive and deterministic.
- Prefer accessible queries and visible text that support both manual use and Playwright assertions.
- Keep auth and dashboard flows stable: login/signup, session persistence, CRUD operations, logout, and seeded demo behavior.

## Validation Expectations

- For app changes, prefer these checks when relevant:
  - `npm run build`
  - `npm run lint`
  - `npm run test:e2e`
- If a change touches authentication, dashboard flows, or selectors, consider Playwright impact first.

## Scope Guardrails

- This project is intentionally not production-grade security. Do not over-engineer client-side auth or hashing.
- Optimize for clarity, determinism, and easy test authoring.
- Avoid broad refactors unless they are required to complete the task.
