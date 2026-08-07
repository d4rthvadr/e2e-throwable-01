# Todos App (React + Browser SQLite)

Simple local-first todos app for UI automation practice.

## Goal

- No backend.
- Browser SQLite persistence.
- Login required before dashboard.
- Todos are always tied to a user id.
- Keep architecture simple and review-friendly for future Playwright tests.

## Tech

- React + TypeScript + Vite
- sql.js (SQLite compiled to WebAssembly)
- IndexedDB for persistent database bytes

## Data Model

Three tables are created automatically:

- users
  - id (TEXT PK)
  - username (TEXT UNIQUE)
  - password_hash (TEXT)
  - created_at (INTEGER)
- tasks
  - id (TEXT PK)
  - user_id (TEXT FK -> users.id)
  - title (TEXT)
  - description (TEXT)
  - completed (INTEGER 0/1)
  - created_at (INTEGER)
  - updated_at (INTEGER)
- user_preferences
  - id (TEXT PK)
  - user_id (TEXT UNIQUE FK -> users.id)
  - theme (TEXT)
  - notifications_enabled (INTEGER 0/1)
  - created_at (INTEGER)

## Features Included

- Sign up
- Log in
- Session persistence in localStorage
- Logout
- Create task
- Edit task
- Toggle complete/incomplete
- Delete task
- Per-user task isolation
- Demo seed button for deterministic test data

## Run

```bash
npm install
npm run dev
```

Open the dev URL shown by Vite.

## Run the Playwright test

Install Playwright once:

```bash
npm install
npx playwright install
```

Run the generated Playwright tests:

```bash
npm run test:e2e
```

Run it in headed mode if you want to watch the browser:

```bash
npm run test:e2e:headed
```

Current Playwright coverage:

- `login and signup with persistence`
- `access dashboard and perform CRUD operations`

Run just one test by title:

```bash
npx playwright test --grep "login and signup with persistence"
```

```bash
npx playwright test --grep "access dashboard and perform CRUD operations"
```

The Playwright config starts the Vite app automatically on `http://127.0.0.1:5173`.

## Build Check

```bash
npm run build
```

## Demo User Seed

On the auth screen, click:

- Seed demo user (demo / demo1234)

Then log in with:

- username: demo
- password: demo1234

## File Map

- src/auth/AuthContext.tsx: auth/session logic
- src/features/auth/AuthPage.tsx: login/signup UI
- src/features/dashboard/DashboardPage.tsx: main todos dashboard
- src/db/database.ts: SQLite bootstrap and persistence
- src/db/usersRepo.ts: users/auth data access
- src/db/tasksRepo.ts: task CRUD data access
- src/dev/seed.ts: deterministic seed helper

## Scope Notes

- Password hashing is client-side and intended for learning only.
- This is not a production security model.
- Data is local to the browser profile.

## Review Checklist

- Unauthenticated users only see auth page.
- After login, dashboard is visible.
- Refresh keeps logged-in session.
- Two users cannot see each other tasks.
- Task create/edit/toggle/delete persists after refresh.
- Duplicate usernames are rejected.
- Demo seed produces stable credentials and starter tasks.
