# Orange Anonymization BE

Backend template built with NestJS, TypeORM, and MySQL.

## 🚀 Quick Start

### 1. Clone repository

```bash
git clone <repo_url>
cd orange_anonymization_be
2. Install dependencies
npm install
3. Setup environment variables
Copy .env.example to .env and fill in your values:
cp .env.example .env
4. Run database migrations
npm run migration:run
5. Start the server
npm run start:dev

Server will run on the port specified in .env (default 5000).

6. API Documentation

Swagger UI available at:

http://localhost:<PORT>/api
🛠 Project Structure
src/
│
├── modules/
│   └── auth/                 # Auth module (users)
├── migrations/               # TypeORM migrations
├── app.module.ts             # Root module
├── main.ts                   # App entry point
└── common/constants/         # Shared constants

⚡ Scripts
npm run start:dev – run server in dev mode with hot reload
npm run build – compile TypeScript
npm run migration:run – execute pending migrations
npm run migration:generate – generate new migration
npm run migration:revert – rollback last migration

📝 Notes
Validation globally enabled via ValidationPipe
User entity & DTO implemented
Migrations automatically create users table
```
