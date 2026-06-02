# Clinical Data Studio — Backend Template

Backend service for Clinical Data De-Identification & Synthetic Data Studio.
Built with **NestJS 10 + TypeORM + MySQL + Microsoft Presidio**.

---

## Architecture

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│   React 19       │────>│   NestJS 10 API   │────>│  Presidio        │
│   (separate repo)│<────│   TypeORM + MySQL  │<────│  analyzer :5001  │
│                  │     │   Swagger /api/docs│     │  anonymizer:5002 │
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

## Project Structure

```
backend/
├── src/
│   ├── main.ts                          # Bootstrap, CORS, Swagger, ValidationPipe
│   ├── app.module.ts                    # Root module, TypeORM + Config setup
│   ├── config/
│   │   └── configuration.ts             # Typed config (db, jwt, presidio, etc.)
│   ├── common/
│   │   └── guards/
│   │       └── auth.guard.ts            # JWT auth guard
│   ├── modules/
│   │   ├── auth/                        # Magic link + JWT authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── strategies/jwt.strategy.ts
│   │   │   └── dto/
│   │   ├── users/                       # User CRUD
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/user.entity.ts  # UUID PK, @Index on email
│   │   │   └── dto/
│   │   ├── de-identification/           # Presidio integration
│   │   │   ├── de-identification.controller.ts
│   │   │   ├── de-identification.service.ts
│   │   │   ├── presidio.service.ts      # HTTP client for Presidio
│   │   │   ├── entities/document.entity.ts
│   │   │   └── dto/
│   │   ├── synthetic-data/              # Synthetic data generation
│   │   │   ├── synthetic-data.controller.ts
│   │   │   ├── synthetic-data.service.ts
│   │   │   ├── entities/synthetic-record.entity.ts
│   │   │   └── dto/
│   │   └── dashboard/                   # Aggregated metrics
│   │       ├── dashboard.controller.ts
│   │       └── dashboard.service.ts
│   └── database/
│       ├── data-source.ts               # TypeORM CLI data source
│       ├── migrations/                  # SQL schema migrations
│       └── seeds/                       # Initial data
├── docker-compose.yml                   # MySQL + Presidio containers
├── Dockerfile                           # Production build (node:20-alpine)
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
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

4. All subsequent API requests must include: `Authorization: Bearer <jwt>`
```

---

## Environment Variables

| Variable                | Default               | Required | Description                      |
| ----------------------- | --------------------- | -------- | -------------------------------- |
| NODE_ENV                | development           |          | Environment                      |
| PORT                    | 3000                  |          | Server port                      |
| DB_HOST                 | localhost             | Yes      | MySQL host                       |
| DB_PORT                 | 3306                  | Yes      | MySQL port                       |
| DB_USERNAME             | clinical_user         | Yes      | MySQL user                       |
| DB_PASSWORD             |                       | Yes      | MySQL password                   |
| DB_NAME                 | clinical_studio       | Yes      | Database name                    |
| DB_SYNCHRONIZE          | true                  |          | Auto-sync schema (false in prod) |
| JWT_SECRET              |                       | Yes      | JWT signing secret (64+ chars)   |
| JWT_EXPIRES_IN          | 1h                    |          | JWT token lifetime               |
| MAGIC_LINK_EXPIRES_IN   | 900                   |          | Magic link TTL in seconds        |
| ENCRYPTION_KEY          |                       | Yes      | AES-128 key (16 chars)           |
| PRESIDIO_ANALYZER_URL   | http://localhost:5001 |          | Presidio analyzer                |
| PRESIDIO_ANONYMIZER_URL | http://localhost:5002 |          | Presidio anonymizer              |
| CORS_ORIGIN             | http://localhost:5173 |          | Frontend URL                     |

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

### Where to place the frontend build

Place the production build output (typically the contents of the frontend's `dist/` folder) into `frontend-dist/`:

```bash
# Example: copy from the frontend repo build output
cp -r ../orange_anonymization_fe/dist/* frontend-dist/
```

### Local validation

```bash
# 1. Place a frontend build into frontend-dist/
cp -r ../orange_anonymization_fe/dist/* frontend-dist/

# 2. Start the backend
npm run start:dev

# 3. Verify:
#    - http://localhost:3000/         → SPA index.html
#    - http://localhost:3000/some/route → SPA index.html (client-side routing)
#    - http://localhost:3000/api/auth/login → API responds (POST)
#    - http://localhost:3000/api/docs  → Swagger UI
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