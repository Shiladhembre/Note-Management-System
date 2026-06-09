# Smart Notes Management System

Production-grade notes app built with **Node.js, Express, MongoDB (Mongoose), EJS, Tailwind CSS, Alpine.js, Socket.io**.

## Features

- 🔐 Auth: register / login / logout, bcrypt hashing, JWT **and** session, remember-me, forgot/reset password via email
- 👤 Profile: avatar upload (Cloudinary), edit profile, change password
- 📝 Notes: create / edit / delete, soft-delete + trash + restore, pin, archive, favorite, color, labels, markdown
- 🔎 Search, filter (label / archived / trashed), sort, pagination
- 🎨 Modern UI: responsive dashboard, sidebar, navbar, dark/light mode, toasts, modals, animations (Tailwind + Alpine.js)
- 🛡️ Security: Helmet, rate-limiting, mongo-sanitize, xss-clean, CSRF, secure cookies, env vars, validation
- 🔌 REST API at `/api/*` with JSON + proper status codes
- ⚡ Realtime updates via Socket.io
- 📎 File uploads (Cloudinary)
- 🤖 AI hooks (summarizer / title generator) — wire any provider in `services/aiService.js`
- 📤 Export notes to PDF / TXT
- 🚀 Deployment-ready (env-driven, error handling, production scripts)

## Getting started

```bash
cp .env.example .env       # fill in MONGO_URI + secrets
npm install
npm run dev                # http://localhost:3000
```

You need a running MongoDB (local or Atlas). Tailwind & Alpine.js are loaded via CDN in `views/partials/head.ejs` so there is no front-end build step.

## Project structure

```
config/        db, cloudinary, passport-like helpers
controllers/   request handlers (MVC)
middleware/    auth, validation, error, csrf, rate-limit
models/        Mongoose schemas (User, Note)
routes/        web + REST routes
services/      mailer, ai, export
sockets/       Socket.io handlers
utils/         helpers (catchAsync, AppError, token)
views/         EJS templates (partials, auth, notes, profile)
public/        css, js, uploads
app.js         Express app (middleware + routes)
server.js      HTTP + Socket.io bootstrap
```

## Testing features

| Feature | How to test |
|---|---|
| Register/Login | `/auth/register` then `/auth/login` |
| Forgot password | `/auth/forgot` — check Mailtrap inbox |
| Notes CRUD | Dashboard at `/notes` |
| Trash / restore | Toggle on a note then visit `/notes?filter=trash` |
| REST API | `curl -H "Authorization: Bearer <jwt>" http://localhost:3000/api/notes` |
| Realtime | Open dashboard in two tabs, edit a note in one |
| Export PDF | `/notes/:id/export?format=pdf` |
| Avatar upload | `/profile` (requires Cloudinary creds) |

## Deployment

- Set `NODE_ENV=production` and all `.env` values on your host (Render, Railway, Fly, VPS, etc.)
- Use a managed MongoDB (Atlas) and Cloudinary account
- `npm start` runs `node server.js`

---

Built as a placement-ready full-stack reference project. Extend freely.
