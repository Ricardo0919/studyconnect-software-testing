# Project Setup and Environment Configuration

How to run and test the **StudyConnect API** backend located in `apps/api/`.

## Requirements
- Node.js ≥ 18
- npm ≥ 9
- Docker & Docker Compose
- Git

> Additionally, you must have **NestJS CLI** installed globally and TypeScript/Jest dependencies configured.

### Install NestJS and essential tooling
> Linux, macOS, and Windows (with PowerShell).

```bash
# Install NestJS CLI globally
npm i -g @nestjs/cli

# If TypeScript or Jest dependencies are missing, install them
npm i -D typescript ts-node @types/node
npm i -D jest ts-jest @types/jest tsconfig-paths
```

## Setup

```bash
# Clone repo
git clone https://github.com/Ricardo0919/studyconnect-software-testing.git
cd studyconnect-software-testing

# Start DB containers (Postgres + pgAdmin)
docker compose up -d

# Go to backend and install dependencies
cd apps/api
npm install
```

Create a `.env` file in `apps/api/`:
```
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=studyconnect_app_db
DATABASE_PASSWORD=super_secure_password_123
DATABASE_NAME=studyconnect
DB_SYNC=true
DB_LOGGING=true
```

## Run the API
```bash
cd apps/api
npm start
```
App: [http://localhost:3000](http://localhost:3000)  
Health checks: `/health` and `/health/ready`

## Testing
```bash
# Unit tests
cd apps/api
npm test

# End-to-end tests
npm run test:e2e
```

## Stop services
```bash
docker compose down
```