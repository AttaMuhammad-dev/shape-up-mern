Latest workflow release and configuration: [FINALIZATION.md](FINALIZATION.md).

# Shape Up

A MERN fitness portfolio project with a React interface, cookie-based sign-in, workout and daily logs, water tracking, calculators, reviews, and an optional Gemini assistant.

## Local development

Requires Node.js 22 or newer and a dedicated MongoDB database containing demo data only.

1. Run `npm ci` in `backend/` and `frontend/`.
2. Copy `backend/.env.example` to `backend/.env`; configure `MONGO_URI` and a strong random `JWT_SECRET` locally.
3. In `backend/`, run `npm start`. In `frontend/`, run `npm start` for HTTP development at localhost:3000. Vite proxies same-origin API requests to localhost:9000.

## Vercel deployment

The current portfolio demo uses free Vercel hosting. The included `render.yaml` is an alternative, not the active deployment route. Use `MONGO_URI` with the dedicated `shape_up_demo` database and a private random `JWT_SECRET`. In-memory limits, model cooldowns and caches apply per server instance and reset on restart; a shared store is needed for global limits across instances.

Import the repository with the repository root as Root Directory. The root `vercel.json` installs both applications, builds the frontend, and sends `/api/*` to the backend in the same deployment. Do not select the legacy frontend-only or backend-only configuration.

Set `NODE_ENV=production`, `MONGO_URI`, and `JWT_SECRET` in Vercel Environment Variables. Support email can be enabled after configuring and verifying its private Gmail settings; see FINALIZATION.md. Enable coaching with `AI_ENABLED=true` and a private server-only `GEMINI_API_KEY`; never use a `REACT_APP_*` value. Use a separate Google project from other demos to separate project-level quota. The public AI route is independent of the database and authentication configuration.

The 20 October reliability update adds a bounded three-model ladder, per-call timeouts with a 22-second generation budget, cancellation, transient-error backoff, model cooldowns for rate limits, bounded complete-answer caching, a local greeting and explicit API failure messages. The chat keeps up to six bounded history turns, prevents duplicate submissions and times out client requests. Empty, blocked and truncated provider output is not presented as successful AI output. Models and API availability can change; retain periodic live checks.

Profile saves preserve unchanged password hashes and use the backend's actual image field. The legacy water component reads the current signed-in day's server record, validates positive amounts and only displays saved updates. Account deletion now requires the current password and exact confirmation, and removes owned data in a transaction. Frontend regression tests cover API failure messages, follow-up context, duplicate sends and failed water saves. The frontend now builds with Vite and runs component tests with Vitest.

The first food logged on a new day now contributes its calories immediately. Backend runtime dependencies were updated within compatible ranges, the unused legacy AI SDK/proxy/React Query dependencies were removed, and the unused backend Babel/Jest stack was replaced by native Node tests. Development reload uses Node's built-in watch mode. Nodemailer uses bounded Gmail connections and authenticated support requests; real delivery must be verified for each deployment configuration.

Reminders use a dedicated Reminder model rather than the review collection, and retain their date, time, category and priority. Invalid model fields return a validation response instead of a generic server failure. Existing reviews are preserved; no review records are migrated or deleted.

Before sharing a demo link, verify registration, login, refresh, logout, saving a workout, nutrition/water logs, and a direct visit to `/dashboard` using a fresh browser session. `/api/health` tests the HTTP service; it does not establish that MongoDB is reachable.

## Validation

From the root: `npm run test:deployment` and `npm run build`.

This is a portfolio project. Do not enter real health information. API, AI and sign-in attempts have per-instance request limits. Add a shared limiter before scaling across instances. Email depends on configured Gmail delivery; AI depends on the external provider's availability and quota, with no uninterrupted-service guarantee. Live coaching with the supplied separate key was confirmed on 20 October 2026; see the saved release evidence for the exact tested scope.
# Reminder sound update

In Alerts, open **Library**, preview a track and choose **Use sound** to save it on this device. **Test selected sound** plays the same track used by scheduled reminders. Normal alerts repeat three times; high-priority alerts repeat until dismissed, for up to two minutes. Use **Stop & dismiss** to stop an active reminder. If the browser blocks audio, tap **Play sound** on the active alert. Keep the app open; sound/background delivery depends on browser and operating-system support.

The 24 October sound follow-up passes 27 frontend checks. See [RELEASE-20261024.md](RELEASE-20261024.md) for the precise tested scope and limits.

---

