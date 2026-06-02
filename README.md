# De-ID Data Studio

Backend service for Clinical Data De-Identification & Synthetic Data Studio.
Built with **NestJS 10 + TypeORM + MySQL + Microsoft Presidio**.

---

## Architecture

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│   React 19       │────>│   NestJS 10 API   │────>│  Presidio        │
│   (separate repo)│<────│   TypeORM + MySQL │<─── │  analyzer :5001  │
│                  │     │  Swagger /api/docs|     │  anonymizer:5002 │
└──────────────────┘     └───────────────────┘     └──────────────────┘
     Frontend                  This repo               Docker services
```

---

## Tech Stack

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Framework     | NestJS 10 + TypeScript (strict mode) |
| ORM           | TypeORM with MySQL 8                 |
| Auth          | Magic Link + JWT (Passport)          |
| Validation    | class-validator + class-transformer  |
| Docs          | Swagger / OpenAPI                    |
| Config        | @nestjs/config (ConfigService)       |
| PII Detection | Microsoft Presidio (Docker)          |
| Testing       | Jest                                 |

---

## Quick Start

### Prerequisites

- Node.js 20+
- Docker + Docker Compose

### 1. Infrastructure

```powershell
# From the backend folder
copy .env.example .env
# Edit .env with your settings (DB, JWT secret, Presidio URLs)

docker compose up mysql presidio-analyzer presidio-anonymizer -d
```

Wait for containers to be healthy (~30s for Presidio to load ML models):

```bash
docker compose ps
```

### 2. Backend

```powershell
npm install
npm run start:dev
```

- API base: http://localhost:3000
- Swagger (dev): http://localhost:3000/api/docs

### 3. Migrations & Seeds

```bash
# Apply schema (when DB_SYNCHRONIZE=false):
npm run migration:run

# Create admin user:
npm run db:seed
```

---

## Project Structure (concise)

```text
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/                 # typed config (DB, JWT, Presidio)
│   ├── modules/                # feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── jobs/
│   │   ├── dashboard/
│   │   ├── synthetic-data/
│   │   ├── email/
│   │   └── health/
│   └── database/               # data-source, migrations, seeds
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── tsconfig.json
└── package.json
```

---

## API Endpoints

| Method | Endpoint                         | Description             | Auth |
| ------ | -------------------------------- | ----------------------- | ---- |
| POST   | /api/auth/login                  | Request magic link      | No   |
| GET    | /api/auth/verify?token=...       | Verify token, return JWT| No   |
| GET    | /api/users/me                    | Current user profile    | JWT  |
| POST   | /api/de-identification/analyze   | Analyze text for PII    | JWT  |
| POST   | /api/de-identification/anonymize | Anonymize text          | JWT  |
| GET    | /api/de-identification/documents | User documents          | JWT  |
| POST   | /api/synthetic-data/generate     | Generate synthetic data | JWT  |
| GET    | /api/app/dashboard/overview      | Dashboard overview      | JWT  |
| GET    | /api/app/analyses                | Recent analyses (pag)   | JWT  |
| POST   | /api/jobs                        | Create job draft        | JWT  |
| GET    | /api/jobs/latest-draft           | Get last draft          | JWT  |
| PATCH  | /api/jobs/:id                    | Update job              | JWT  |
| POST   | /api/jobs/:id/run                | Start job processing    | JWT  |
| POST   | /api/jobs/:id/upload             | Upload file for job     | JWT  |
| PATCH  | /api/jobs/:id/entities/:entityId/toggle | Toggle entity inclusion | JWT |
| GET    | /api/jobs/:id                    | Get job details         | JWT  |

Full documentation with request/response schemas: http://localhost:3000/api/docs

---

## Authentication Flow

```
1. POST /api/auth/login  { email }
   → Creates/finds user, sends magic link email with a one-time token (expires ~15 min)

2. User opens the link (frontend receives token) and the frontend calls:
   GET /api/auth/verify?token=<uuid>

3. Backend validates token (one-time use) and returns a JWT session token.
   → JWT lifetime: controlled by `JWT_EXPIRES_IN` (default `1h`)

```

---

## Testing

```bash
npm test              # Unit tests (Jest)
npm run test:cov      # With coverage
npm run test:smoke    # Integration (requires running server + Docker)
```

---

## Docker

```bash
# Start all services
docker compose up -d

# Only infrastructure (without backend container)
docker compose up mysql presidio-analyzer presidio-anonymizer -d

# Check status
docker compose ps

# View logs
docker compose logs -f mysql
```

---

## Scripts

| Command                      | Description                            |
| ---------------------------- | -------------------------------------- |
| `npm run start:dev`          | Development with hot-reload            |
| `npm run build`              | Production build                       |
| `npm run start:prod`         | Run production build                   |
| `npm run lint`               | ESLint check                           |
| `npm run format`             | Prettier format                        |
| `npm test`                   | Run unit tests                         |
| `npm run test:cov`           | Tests with coverage                    |
| `npm run migration:run`      | Apply migrations                       |
| `npm run migration:generate` | Generate migration from entity changes |
| `npm run db:seed`            | Seed admin user                        |