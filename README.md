# TheKinetix — Frontend (React + Vite) and Simple Backend

This workspace contains a React + Vite frontend and a small Express-based auth backend used for demo authentication and signup. The backend persists users to `server/data/users.json`.

**Quick Start — Run the app locally**

1. Install dependencies:

```bash
npm install
```

2. Start the backend (auth server):

```bash
npm run server
```

3. Start the frontend dev server:

```bash
npm run dev
```

Open the frontend URL shown by Vite (usually http://localhost:5173) and use the login/signup UI. The backend runs on port 4000 by default and the Vite dev server proxies `/api` requests to it.

**Backend API (dev)**

- POST `/api/auth/signup`
	- Body: `{ id, password, role, name }`
	- Adds the user to `server/data/users.json` (demo persistence)
- POST `/api/auth/login`
	- Body: `{ id, password, role }`
	- Returns `{ ok: true, user, token }` on success

Example curl (signup):

```bash
curl -X POST http://localhost:4000/api/auth/signup \
	-H 'Content-Type: application/json' \
	-d '{"id":"new.user@thekinetix.edu","password":"secret123","role":"student","name":"New User"}'
```

Example curl (login):

```bash
curl -X POST http://localhost:4000/api/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"id":"s.patil@thekinetix.edu","password":"physics2026","role":"student"}'
```

**Data storage (dev only)**

- File: `server/data/users.json`
- Format: JSON object keyed by user `id` (email). Each entry contains `id`, `password`, `role`, `name`, and `created_at`/`createdAt` timestamps.
- Note: For initial version Details have been stored in JSON FORMAT, later SQL will be Added

**Changes in "Commit Frontend + backend"**

- Added `server/index.js` — small Express auth server with `/api/auth/login` and `/api/auth/signup` endpoints.
- Added `server/db.js` — simple JSON-backed user store (writes to `server/data/users.json`).
- Added `server/data/users.json` — seeded demo users.
- Updated frontend `src/components/TheKinetixLogin.jsx`:
	- Signup form now accepts name, email, and password and POSTs to `/api/auth/signup`.
	- Login form uses email (ID) and password; removed name input from sign-in.
	- Added loading and error states for both flows.
- Updated `vite.config.js` to proxy `/api` to the backend at `http://localhost:4000` during dev.
- Updated `package.json` scripts: `server`, `server:dev`, and added server dependencies (`express`, `cors`) and dev tooling (`nodemon`).


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
