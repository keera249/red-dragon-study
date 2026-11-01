# Red Dragon Study (التنين الأحمر للدراسة في الصين)
**China University Admissions, Scholarship Discovery & Educational Consultancy Platform**

![Red Dragon Study Logo](public/logo.jpeg)

Red Dragon Study is a complete, database-driven bilingual (**Arabic RTL default** and **English LTR**) web platform built for an international educational consultancy specializing in admissions to accredited Chinese universities.

---

## 1. Architecture & Technology Stack

- **Frontend & Backend Framework**: Next.js 15 (App Router) with React 19 and TypeScript
- **Styling & RTL/LTR Design System**: Tailwind CSS configured with logical properties (`start`/`end`, `ps`/`pe`, `ms`/`me`) and the Red Dragon crimson/gold palette derived from the official Red Dragon Study logo (`/logo.jpeg`).
- **Database & ORM**: Prisma ORM (`@prisma/client`).
  - **Local Development & Automated Testing**: Configured out of the box with **SQLite** (`file:./dev.db`) so the application, migrations, seeding, and test suite run immediately on machines without requiring a local PostgreSQL service or Docker daemon.
  - **Production Deployment**: Fully compatible with **PostgreSQL** by changing `provider = "postgresql"` in `prisma/schema.prisma` and setting `DATABASE_URL="postgresql://..."` in `.env`.
- **Authentication & Security**:
  - `bcryptjs` password hashing (never storing plaintext passwords)
  - `jose` HTTP-only signed JWT sessions with `sessionVersion` support for immediate server-side session revocation
  - Granular server-enforced Role-Based Access Control (`ADMINISTRATOR`, `CONTENT_EDITOR`, `INQUIRY_OFFICER`, plus custom roles)
  - Anti-spam honeypot & IP rate limiting on authentication and public inquiry endpoints
  - Sanitized administrative audit logging (`AuditLog`) that automatically redacts sensitive fields

---

## 2. Local Installation Instructions

### Prerequisites
- Node.js `v20+` (tested on `v24.19.0`)
- npm `v10+`

### Step-by-Step Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` (already initialized for local development):
   ```bash
   cp .env.example .env
   ```

3. **Run Database Migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Seed Initial Data & Administrator Account**:
   ```bash
   npm run db:seed
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 3. Initial Employee & Role Accounts

The database seed (`prisma/seed.ts`) creates the initial roles, permissions, and employee accounts (configurable via `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` in `.env`):

| Role | Email | Default Password | Permissions Summary |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@reddragonstudy.com` | `Admin@RedDragon2026!` | Full control over all content, universities, requirements, inquiries, employees, roles, system settings, and backups. |
| **Content Editor** | `editor@reddragonstudy.com` | `Editor@RedDragon2026!` | Create/edit universities, programs, scholarships, requirements, and media galleries. Cannot manage employees, delete universities, or view private student inquiries. |
| **Inquiry Officer** | `officer@reddragonstudy.com` | `Officer@RedDragon2026!` | View and update assigned student inquiries, add internal notes, and manage follow-up reminders. Cannot access unassigned student records or delete universities. |

Sign in at: `http://localhost:3000/admin/login`

---

## 4. Automatic Content Visibility Rules (Section 5)

Implemented centrally in [`src/lib/visibility.ts`](src/lib/visibility.ts) and [`src/lib/public-data.ts`](src/lib/public-data.ts):

1. Only `PUBLISHED` and enabled records appear on public student pages.
2. `DRAFT`, `UNPUBLISHED`, `DISABLED`, `ARCHIVED`, and `DELETED` records are strictly excluded from public pages, search APIs, and XML sitemaps.
3. Empty campus or accommodation photo galleries (or galleries whose images are all removed/unpublished) disappear completely without rendering empty headings, empty grids, counters, or placeholders.
4. Scholarship sections with zero published scholarships are automatically hidden.
5. Missing or invalid official website URLs never produce broken buttons.
6. Missing geographic coordinates and map URLs automatically hide the map section without inventing coordinates.
7. Missing deadlines never fabricate dates and remain hidden unless `showNotAnnounced` is explicitly enabled.
8. Missing or disabled WhatsApp settings hide WhatsApp buttons completely.
9. Empty requirement sections and empty optional fields (without labels) are hidden automatically.
10. Internal administrative notes (`internalNotes`) on universities, programs, scholarships, verification records, and inquiries are stripped on the server and never exposed publicly.

---

## 5. Production Deployment Instructions

1. **Provision a PostgreSQL Database** (e.g., managed PostgreSQL on Google Cloud SQL, AWS RDS, Supabase, or Neon).
2. **Update Database Provider**:
   In `prisma/schema.prisma`, set:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. **Set Production Environment Variables**:
   - `DATABASE_URL="postgresql://user:password@host:5432/red_dragon_study?schema=public"`
   - `JWT_SECRET="<strong-64-byte-random-secret>"`
   - `NEXT_PUBLIC_SITE_URL="https://your-production-domain.com"`
   - `INITIAL_ADMIN_EMAIL="admin@your-domain.com"`
   - `INITIAL_ADMIN_PASSWORD="<strong-initial-password>"`
4. **Apply Migrations & Build**:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   npm run build
   npm run start
   ```

---

## 6. Database Backup & Restoration Instructions

### A. Dashboard JSON Snapshot Export
Administrators can export a full JSON snapshot of all universities, programs, fees, scholarships, global requirements, deadlines, pages, and settings directly from:
- **Admin Dashboard → System & Audit → Export Database Backup (JSON)** (`/api/admin/settings?backup=json`).

### B. SQLite File Backup & Restore (Local / Single-Node Deployment)
- **Backup**:
  ```bash
  cp prisma/dev.db backups/red-dragon-backup-$(date +%F).db
  ```
- **Restore**:
  ```bash
  cp backups/red-dragon-backup-YYYY-MM-DD.db prisma/dev.db
  ```

### C. PostgreSQL Backup & Restore (Production)
- **Backup**:
  ```bash
  pg_dump "$DATABASE_URL" --format=custom --file=red_dragon_backup.dump
  ```
- **Restore**:
  ```bash
  pg_restore --clean --no-owner --dbname="$DATABASE_URL" red_dragon_backup.dump
  ```

---

## 7. Running Automated Tests

Run the automated test suite covering University Management, Automatic Visibility Rules, Shared Requirements & Isolated Overrides, Deadlines & Timezones, WhatsApp Template Rendering, Student Inquiries, RBAC Permissions, and Security:

```bash
npm test
```
