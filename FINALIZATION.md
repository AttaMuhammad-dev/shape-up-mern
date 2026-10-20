# Workflow finalization — 20 October 2026

This release finishes the implemented account, fitness, coaching and support workflows. It is a student portfolio application using sample data, not a medical service or a paid subscription product.

## Features

- Email/password accounts, validated profiles and password changes. Password changes invalidate previous sessions. Malformed credentials are rejected before database access.
- Full owner-only JSON export: profile, daily logs, workouts, diet profile, meal plans, water entries, reminders and reviews. Password hashes and session secrets are excluded.
- Password-confirmed permanent account deletion. All seven owned data collections and the account are deleted in one database transaction. A failure aborts the transaction; the cookie is cleared only after success. Atlas supports the transaction; a standalone local MongoDB needs replica-set configuration.
- Authenticated support email to the server-configured owner inbox. Sender identity comes from the account, not a supplied address. Gmail transport has bounded timeouts, five requests/hour/account, no debug credentials, and honest accepted/failure states. Message text remains in the form on failure.
- Daily logs reject impossible dates, negative and malformed values. Food additions/removals use atomic aggregation updates; parallel additions preserve food entries and totals. Changing steps does not resend stale calorie/water values.
- Meal plan fields can be cleared. Workouts use UTC calendar-day boundaries for the visitor-selected date. Reminders use their exact local date/minute and fire once per open session. Browser notification permission is requested only from an explicit Settings action. Reminder sound/in-app preferences work on this device.
- Theme state is shared between Header and Settings. Logout/user changes clear the API cache; expired sessions are cleared on authentication failures. Malformed saved profile JSON does not break startup.
- Dead social-auth controls, paid-plan/store-download claims and unsupported integrations removed from the visible UI. Privacy/data notice is available before registration. No payment is required.

## Tooling

Node 24.x; frontend uses Vite and Vitest instead of the unmaintained Create React App build stack. JSX files use .jsx extensions. React Router, Axios and jsPDF dependencies are updated. Route-level and PDF code loading avoid downloading the entire dashboard/export stack on the homepage. Existing Vercel output remains frontend/build with same-origin API routing.

Run `npm ci` in backend and frontend, `npm --prefix frontend run build`, `npm --prefix backend test`, and `npm --prefix frontend test`. For local work use backend/.env (NODE_ENV=development), `npm --prefix backend start`, and `npm --prefix frontend start`; Vite proxies /api to localhost:9000. No HTTPS or separate CORS configuration is needed for this local proxy.

## Private configuration

MONGO_URI, JWT_SECRET, GEMINI_API_KEY are server-only. Set AI_ENABLED=true only after provider checks. Optional Gmail support uses EMAIL_ENABLED=true, EMAIL_USER, EMAIL_PASS (a newly generated app password), and optional SUPPORT_EMAIL; absent SUPPORT_EMAIL means the sender's own inbox. Never place credentials in frontend variables, source or screenshots. /api/health reports whether configuration is present, not actual delivery/database/provider health.

## Operational limits

Gemini quotas/outages and Gmail/hosting/network availability remain external dependencies. Caches/limits are per process, not global across serverless instances. Browser reminders require the application to remain open and the device awake; wearable syncing, OAuth, background push, email password recovery, native store apps and paid plans are not advertised as implemented. Food/calculator results are estimates. Keep periodic provider, dependency and backup checks. Account deletion cannot promise removal from provider backups outside the application database.

Exact automated/live verification and source/deployment identities are recorded separately in the owner's release evidence. Do not interpret a health endpoint or a zero-advisory audit as proof of every workflow or absolute security.
