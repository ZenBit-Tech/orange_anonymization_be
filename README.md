# Backend Template (NestJS + MySQL)

This repository contains a basic backend template built with **NestJS** and **MySQL**.  
It is intended to be used as a starting point for backend services.

---

# Tech Stack

- NestJS
- TypeScript
- MySQL
- TypeORM
- ESLint (Airbnb rules)
- Husky (pre-commit hooks)

---

# Project Structure

src/
common/
migrations/
modules/
auth/
dto/
auth.controller.ts
auth.module.ts
auth.service.ts
jwt.strategy.ts

app.controller.ts
app.module.ts
app.service.ts
main.ts

### Folder description

| Folder       | Description                     |
| ------------ | ------------------------------- |
| common       | Shared utilities and helpers    |
| migrations   | Database migrations             |
| modules      | Application modules             |
| modules/auth | Example module used as template |
| dto          | Data Transfer Objects           |

---

# Installation

Clone the repository:

git clone <repository-url>

Install dependencies:

npm install

---

# Environment Variables

Create a `.env` file in the root directory.

Example:

PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=nestjs_template

---

# Database Setup

Create database in MySQL:

CREATE DATABASE nestjs_template;

---

# Running the Application

Development mode:

npm run start:dev

Production build:

npm run build
npm run start:prod

Server will start on:

http://localhost:5000

---

# Linting

Run ESLint:

npm run lint

ESLint uses **Airbnb configuration**.

---

# Git Hooks

The project uses **Husky**.

Before every commit:

- ESLint runs automatically
- Code is automatically fixed when possible

---

# Example Module

The project contains an example **Auth module** which demonstrates:

- module structure
- controller
- service
- DTO folder
- strategy example

This module should be used as a reference when creating new modules.

---

# QueryBuilder Example

The project includes an example of using **TypeORM QueryBuilder**.

Example:

return this.userRepository
.createQueryBuilder('user')
.where('user.email = :email', { email })
.getOne();

---

# API Design Rules

Backend follows several rules:

- REST API naming conventions
- UUID primary keys
- minimal database queries
- use of transactions when modifying multiple tables
- use ConfigService instead of process.env

---

# Useful Commands

Run tests:

npm run test

Run lint:

npm run lint

Format code:

npm run format

---

# Notes

This repository is intended to serve as a **backend template** for future services.

New modules should follow the structure demonstrated in the example module.
