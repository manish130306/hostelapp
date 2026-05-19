# Namakkal Medical College Hostel Management System

Government-style hostel administration dashboard for room allocation, student registration, vacancy tracking, reports, PDF letters, and audit records.

## Local Development

```bash
npm install
npm run dev
```

Client: `http://localhost:5173`

API: `http://localhost:4000/api/health`

The Vite dev server proxies `/api` to Express, so frontend actions use the same API paths in development and production.

## Production Build

```bash
npm run build
npm start
```

The Express server serves the built frontend from `dist` and exposes API routes under `/api`.

## Required Production Environment Variables

Copy `.env.example` into your hosting provider settings and replace the values:

```bash
JWT_SECRET=replace-with-a-long-random-production-secret
ADMIN_USER=admin
ADMIN_PASSWORD=replace-with-a-strong-admin-password
MONGODB_URI=mongodb+srv://user:password@cluster/dbname
PORT=4000
```

Do not use the demo password for a public deployment.

When `MONGODB_URI` is not set, the API runs with in-memory demo data so the ERP can still be reviewed locally. With MongoDB enabled, the server seeds hostels, rooms, admin user, sample students, admission/vacating history, and audit logs.

## Included ERP Modules

- Dashboard statistics, occupancy charts, notifications, dark/light theme, and responsive sidebar layout
- Student registration with automatic or manual room allocation, photo upload, registration letter PDF, QR verification payload, and printable ID card
- Student vacating workflow with vacancy updates, vacating history, and vacating letter PDF
- Hostel overview for UG hostels, CRRI hostels, resident quarters, staff quarters, and nurses hostel
- Occupied/vacant/student/hostel-wise/monthly reports with PDF and Excel export
- Admin audit log, JSON backup export, and restore endpoint

MongoDB collection details are documented in `database/mongodb-schema.md`.

## Deployment Options

For a Node host such as Render, Railway, Fly.io, or a VPS:

```bash
npm install
npm run build
npm start
```

For Docker-compatible hosting:

```bash
docker build -t hostel-app .
docker run -p 4000:4000 --env-file .env hostel-app
```

The public URL will be provided by your hosting platform after deployment.
