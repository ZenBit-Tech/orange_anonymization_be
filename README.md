# Clinical Data De-Identification & Synthetic Data Studio



---

## Architecture Overview

```
┌─────────────────────────┐     HTTP/JSON     ┌──────────────────────┐
│   React 18 Frontend     │ ──────────────── │  NestJS 10 Backend   │
│   Vite + TypeScript      │  :5173 → :3000   │  TypeScript + TypeORM│
│   Redux Toolkit          │                   │  MySQL 8 (Docker)    │
│   MUI + react-i18next    │                   │  Swagger /api/docs   │
└─────────────────────────┘                   └──────────┬───────────┘
                                                         │ HTTP
                                              ┌──────────┴───────────┐
                                              │  Presidio Services    │
                                              │  (Docker containers)  │
                                              │  analyzer   :5001     │
                                              │  anonymizer :5002     │
                                              └──────────┬────────────┘
                                                         │
                                              ┌──────────┴───────────┐
                                              │  MySQL :3307 (host)   │
                                              │  :3306 (container)    │
                                              └───────────────────────┘
```

## Project Structure

```
study-presido/
├── frontend/                      # React 18 + Vite + TypeScript
│   └── src/
│       ├── components/            # Shared UI components
│       ├── hooks/                 # Custom hooks (useAuth, ...)
│       ├── pages/                 # Route-level page components
│       ├── store/slices/          # Redux Toolkit slices
│       ├── locales/en/            # i18n translation strings
│       └── routes/                # React Router + protected routes
├── backend/                       # NestJS 10 + TypeORM + MySQL
│   └── src/
│       ├── modules/
│       │   ├── auth/              # Magic link auth + JWT strategy
│       │   ├── users/             # Users CRUD
│       │   ├── de-identification/ # Presidio analyze + anonymize
│       │   ├── synthetic-data/    # Fake PHI generation
│       │   └── dashboard/         # Aggregated stats
│       ├── common/                # Guards, decorators, filters
│       ├── config/                # ConfigService configuration
│       └── database/
│           ├── data-source.ts     # TypeORM CLI data source
│           ├── migrations/        # SQL migrations (run in prod)
│           └── seeds/             # Initial data (admin user)
├── docker-compose.yml             # MySQL + Presidio containers
├── .github/
│   └── pull_request_template.md
└── README.md
```

---

## Quick Start

### 1. Prerequisites

- Node.js 20+
- Docker + Docker Compose

### 2. Start infrastructure (MySQL + Presidio)

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your settings, then:
docker compose up -d
```

Wait for containers to be healthy (Presidio loads ML models, takes ~30 s on first start):

```bash
docker compose ps
```

### 3. Start the backend

```bash
cd backend
npm install
npm run start:dev
# API:     http://localhost:3000
# Swagger: http://localhost:3000/api/docs
```

### 4. (Optional) Run migrations + seed

```bash
# Apply schema migrations (required when DB_SYNCHRONIZE=false in prod):
npm run migration:run

# Create the first admin user:
npm run db:seed
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

---

## Testing

### Unit tests (Jest — mocked repository/service layer)

```bash
cd backend
npm test              # run all *.spec.ts
npm run test:cov      # with coverage report
```

### Smoke tests (real HTTP against running server)

Requires the backend and Docker stack to be running:

```bash
cd backend
npm run test:smoke
```

The smoke test:
1. Calls `POST /api/auth/magic-link`
2. Reads the magic link token directly from MySQL via `docker exec`
3. Calls `POST /api/auth/verify` → gets a JWT
4. Hits every protected endpoint and asserts 200/201/204

---

## Authentication Flow (Magic Link)

```
1. POST /api/auth/magic-link  { email }
   → Creates/finds user, generates UUID token, logs magic link URL to console

2. [dev] Open link: http://localhost:5173/auth/verify?token=<uuid>
   → Frontend reads ?token= from URL, calls POST /api/auth/verify

3. POST /api/auth/verify  { token }
   → Validates token + expiry, clears token (one-time use), returns JWT

4. Frontend stores JWT in Redux + localStorage
   → All subsequent requests: Authorization: Bearer <jwt>
```

---

## De-Identification Flow

```
1. POST /api/de-identification/analyze
   Body: { text, language, entities[] }
   → NestJS proxies to presidio-analyzer (port 5001)
   → Returns: [{ entity_type, start, end, score }]

2. POST /api/de-identification/anonymize
   Body: { text, analyzerResults[], strategy }
   → NestJS proxies to presidio-anonymizer (port 5002)
   → Returns: { text: "<anonymized>", items: [...] }
   → Saves document to MySQL for audit trail
```

Available anonymization strategies: `replace` · `redact` · `hash` · `mask`

---

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all required variables.

Key backend variables:

| Variable | Default | Notes |
|---|---|---|
| `DB_SYNCHRONIZE` | `true` | Set `false` in prod; use `npm run migration:run` instead |
| `JWT_SECRET` | — | Must be a long random string in production |
| `PRESIDIO_ANALYZER_URL` | `http://localhost:5001` | |
| `PRESIDIO_ANONYMIZER_URL` | `http://localhost:5002` | |
| `SEED_ADMIN_EMAIL` | `admin@clinical-studio.local` | Used by `npm run db:seed` |

---

## API Documentation

Once the backend is running:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

---

## Key Learning Concepts

### Frontend

| Concept | Where to look |
|---|---|
| Redux Toolkit slices | `frontend/src/store/slices/` |
| Async thunks (API calls) | `authSlice.ts` → `requestMagicLink` thunk |
| React Hook Form + Yup validation | `Auth.tsx`, `SyntheticData.tsx` |
| MUI theming | `src/styles/theme.ts` |
| i18n with react-i18next | `src/i18n.ts`, `src/locales/en/translation.json` |
| Protected routes | `src/routes/ProtectedRoute.tsx` |
| Custom hooks | `src/hooks/useAuth.ts` |
| ErrorBoundary (class component) | `src/components/ErrorBoundary/` |
| Recharts | `Dashboard.tsx` |
| Lazy loading routes | `src/routes/index.tsx` |

### Backend

| Concept | Where to look |
|---|---|
| NestJS module system | `app.module.ts` |
| ConfigService (never `process.env`) | `config/configuration.ts`, any service |
| class-validator DTOs | `de-identification/dto/analyze-text.dto.ts` |
| TypeORM entity with UUID PK | `users/entities/user.entity.ts` |
| Magic link auth | `auth/auth.service.ts` |
| JWT strategy (Passport) | `auth/strategies/jwt.strategy.ts` |
| Custom param decorator | `common/decorators/current-user.decorator.ts` |
| Global exception filter | `common/filters/http-exception.filter.ts` |
| Presidio HTTP proxy | `de-identification/presidio.service.ts` |
| TypeORM migrations | `database/migrations/` + `npm run migration:run` |
| Database seed | `database/seeds/seed.ts` + `npm run db:seed` |
| Swagger decorators | Any controller file |
| Unit tests (Jest) | `**/*.spec.ts` files |
| Smoke tests | `test/smoke.ts` + `npm run test:smoke` |

---

## Code Quality Rules

- **No `any` types** — enforced by TypeScript `strict: true` + ESLint
- **No hardcoded strings in React** — all text via `t('key')` (react-i18next)
- **No `process.env` directly in backend** — use `ConfigService`
- **UUID primary keys** on all entities (prevents enumeration attacks)
- **`@Index` on lookup columns** — email, userId, magicLinkToken
- **Magic link tokens excluded from default SELECT** — `select: false` on `magicLinkToken`
- **Prettier** enforces consistent formatting (`npm run format`)
- **Conventional Commits** for all commit messages
