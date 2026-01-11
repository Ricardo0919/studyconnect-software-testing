# Project Setup – StudyConnect

## Team Members
- Annabel Heberle  
- Artur Hoxha  
- Ricardo Sierra Roa  

---

## Repository & Access
- **Repository:** [https://github.com/Ricardo0919/studyconnect-software-testing](https://github.com/Ricardo0919/studyconnect-software-testing)
- **Forked from:** [https://github.com/dgrewe-hse/studyconnect](https://github.com/dgrewe-hse/studyconnect)

All members have collaborator access.  
Branching strategy:
- `main` → stable branch  
- `feature/*` → development branches  
- Pull Requests required for merges

---

## Folder Structure
```
studyconnect-software-testing/
├── apps/
│   ├── study-connect/   # Next.js frontend
│   ├── api/             # NestJS backend
├── assets/
├── doc/
├── docker-compose.yml
├── docs/
├── LICENSE
└── README.md
```

---

## Local Development Setup

### 1. Prerequisites
- Node.js **v20+**
- Docker Desktop
- Git

### 2. Clone Repository
```bash
git clone https://github.com/Ricardo0919/studyconnect-software-testing.git
cd studyconnect-software-testing
```

### 3. Frontend Setup
```bash
cd apps/study-connect
npm install
npm run dev
```
Frontend runs at **http://localhost:3000**

### 4. Backend Setup
```bash
cd apps/api
npm install
npm run start:dev
```
Backend runs at **http://localhost:3001**

---

## Environment Variables
Backend `.env` file (`apps/api/.env`):
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

---

## Docker Setup
`docker-compose.yml` (PostgreSQL + pgAdmin):
```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15
    container_name: studyconnect_db
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: studyconnect
    volumes:
      - pgdata:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin
    restart: always
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@studyconnect.com
      PGADMIN_DEFAULT_PASSWORD: admin
    depends_on:
      - postgres

volumes:
  pgdata:
```

Start containers:
```bash
docker compose up -d
```

---

## Testing
| Layer | Framework | Command |
|-------|------------|----------|
| Backend | Jest + Supertest | `npm run test` |
| Frontend | Vitest + RTL | `npm run test` |
| E2E | Playwright | `npm run e2e` |

---

*Prepared by:*  
**Annabel Heberle**, **Artur Hoxha**, **Ricardo Sierra Roa**  
Esslingen University of Applied Sciences – *Software Testing (Winter 2025/26)*
