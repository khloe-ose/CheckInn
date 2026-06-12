# CheckInn

CheckInn is a full-stack event registration and QR attendance management system for student organizations, workshops, and conferences. It includes organizer authentication, event CRUD, public participant registration, QR code generation, attendance check-in, CSV/PDF reporting, role-based dashboards, and MySQL-backed analytics.

## Features

- Organizer registration and login with JWT authentication
- Password hashing with bcrypt
- Role-based access for Admin and Organizer
- Protected dashboard routes
- Event CRUD with draft, published, completed, and cancelled statuses
- Public mobile-friendly event registration form
- Participant registration with stored QR code data
- QR attendance check-in and manual check-in
- Participant search and attended/not attended filters
- CSV attendance exports
- PDF certificate generation for attended participants
- Dashboard cards and charts for registrations, attendees, attendance rate, and most attended events
- Admin user management
- Responsive white and blue dashboard UI

## Tech Stack

- Frontend: React.js with Vite
- Styling: Tailwind CSS
- Backend: Node.js with Express.js
- Database: MySQL
- Authentication: JWT
- Passwords: bcrypt
- QR Codes: qrcode
- PDF Generation: pdfkit
- Charts: Recharts
- Icons: Lucide React

## Screenshots

Add screenshots here after running the app:

- Dashboard overview
- Event management table
- Public registration form
- QR check-in screen
- Reports page

## Project Structure

```text
CheckInn/
  client/                 React + Vite frontend
  server/                 Express API
    database/schema.sql   MySQL schema
    database/seed.sql     Sample data
```

## Environment Variables

Create `server/.env`:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=checkinn_db

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

Example files are included as `server/.env.example` and `client/.env.example`.

## MySQL Setup

1. Start MySQL locally.
2. Import the schema:

```bash
mysql -u root -p < server/database/schema.sql
```

3. Import sample data:

```bash
mysql -u root -p checkinn_db < server/database/seed.sql
```

Seed credentials:

- Admin: `admin@checkinn.test` / `Admin@123`
- Organizer: `organizer@checkinn.test` / `Organizer@123`

## Installation

Install dependencies for both apps:

```bash
npm run install:all
```

Or install separately:

```bash
cd client
npm install
```

```bash
cd server
npm install
```

## Run Locally

The easiest local deployment uses an isolated MySQL server on port `3308` in `.local-mysql/` plus detached `screen` sessions for MySQL, the API, and the Vite client:

```bash
npm run local:start
```

Check status:

```bash
npm run local:status
```

Stop everything:

```bash
npm run local:stop
```

Start the backend:

```bash
npm run dev:server
```

Start the frontend:

```bash
npm run dev:client
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001/api`
- Health check: `http://localhost:5001/api/health`

## REST API Overview

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Users:

- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

Events:

- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/events/public/:slug`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

Participants:

- `POST /api/participants/public/:slug`
- `GET /api/participants/event/:eventId`
- `GET /api/participants/:id`
- `DELETE /api/participants/:id`

Attendance:

- `POST /api/attendance/qr`
- `POST /api/attendance/manual`
- `GET /api/attendance/event/:eventId/logs`

Reports and certificates:

- `GET /api/reports/events/:eventId/summary`
- `GET /api/reports/events/:eventId/attendance.csv`
- `GET /api/certificates/participants/:participantId`

Analytics:

- `GET /api/analytics/overview`
- `GET /api/analytics/events/:eventId`

## Deployment Guide

### Frontend on Vercel

1. Create a Vercel project from this repository.
2. Set the root directory to `client`.
3. Add `VITE_API_URL` with the deployed backend API URL.
4. Use the default Vite build command: `npm run build`.
5. Use the output directory: `dist`.

### Backend on Render or Railway

1. Create a Node.js service with root directory `server`.
2. Set the start command to `npm start`.
3. Add all server environment variables.
4. Provision a MySQL database or connect an external MySQL instance.
5. Run `server/database/schema.sql` and `server/database/seed.sql` against the production database if sample data is needed.
6. Set `CLIENT_URL` to the deployed Vercel frontend URL.

## Future Improvements

- Camera-based QR scanning with a browser QR reader
- Email delivery for QR tickets and certificates
- Certificate template editor
- Event waitlists when capacity is reached
- Audit trail for admin user changes
- Multi-organization support with branded public pages
- Automated tests for API authorization and attendance workflows
