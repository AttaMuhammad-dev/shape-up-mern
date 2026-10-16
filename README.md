# Shape Up

A MERN fitness portfolio project with a React interface, cookie-based sign-in, workout and daily logs, water tracking, calculators, reviews, and an optional Gemini assistant.

## Local development

Requires Node.js 22 or newer and a dedicated MongoDB database containing demo data only.

1. Run `npm ci` in `backend/` and `frontend/`.
2. Copy `backend/.env.example` to `backend/.env`; configure `MONGO_URI` and a strong random `JWT_SECRET` locally.
3. In `backend/`, run `npm start`. In `frontend/`, run `npx react-scripts start` for HTTP development at localhost:3000. The existing HTTPS start script is a separate optional development setup.

## Vercel deployment

For the current free portfolio launch, prefer the included `render.yaml`: it serves the React build and API together and lets Atlas allow only the service's outbound network ranges. Free Render services sleep when idle; local uploads are not durable. Use `MONGO_URI` with the dedicated `shape_up_demo` database and let Render generate `JWT_SECRET`. Keep AI and email disabled. The configured in-memory request limits apply to this single service instance and reset on restart; a shared store is needed before scaling across instances.

Import the repository with the repository root as Root Directory. The root `vercel.json` installs both applications, builds the frontend, and sends `/api/*` to the backend in the same deployment. Do not select the legacy frontend-only or backend-only configuration.

Set `NODE_ENV=production`, `MONGO_URI`, and `JWT_SECRET` in Vercel Environment Variables. Keep email disabled (`EMAIL_ENABLED=false`). Set `GEMINI_API_KEY` only on the server if enabling AI; never put it in a `REACT_APP_*` value. Configure a model supported by that key before presenting AI as working. No live AI call was validated during preparation.

Before sharing a demo link, verify registration, login, refresh, logout, saving a workout, nutrition/water logs, and a direct visit to `/dashboard` using a fresh browser session. `/api/health` tests the HTTP service; it does not establish that MongoDB is reachable.

## Validation

From the root: `npm run test:deployment` and `npm run build`.

This is a portfolio project. Do not enter real health information. API and sign-in attempts have per-instance request limits. Add a shared limiter before scaling across instances. AI service/API access and email are unavailable in this demo. Repairing the older AI provider integration is deferred; enabling it later still requires provider timeouts and quota controls.
