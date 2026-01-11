# Lab 12: Final Presentation – StudyConnect

**Team Members:** Annabel Heberle, Artur Hoxha, Ricardo Sierra Roa  
**Course:** Software Testing – HSE Esslingen  
**Presentation Duration:** 10–15 minutes

---

## 1. Implementation Overview

### 1.1 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js (TypeScript) | Modern React framework with App Router |
| **Backend** | NestJS (TypeScript) | Modular REST API with layered architecture |
| **Database** | PostgreSQL + TypeORM | Relational data model with ORM support |
| **Styling** | TailwindCSS, shadcn/ui | Responsive UI components |
| **Containerization** | Docker, Docker Compose | Local development environment |

### 1.2 Key Implementation Specifics

- **REST API:** NestJS controllers with clear separation (Controllers → Services → Repositories)
- **Data Model:** Users, Groups, Tasks, Categories, Comments, Gamification (Achievements/Badges)
- **Authentication:** User registration with password hashing (bcrypt), login endpoint
- **Validation:** DTOs with class-validator for input validation
- **State Management:** Server-side state via API, TypeORM entities with relations

### 1.3 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                      │
│                    http://localhost:3000                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ REST API (HTTP/JSON)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend (NestJS)                        │
│                    http://localhost:3001                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Users   │  │  Tasks   │  │  Groups  │  │  Gamification    │ │
│  │Controller│  │Controller│  │Controller│  │  Controller      │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                 │           │
│  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────────▼─────────┐ │
│  │  Users   │  │  Tasks   │  │  Groups  │  │  Gamification    │ │
│  │ Service  │  │ Service  │  │ Service  │  │    Service       │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       └─────────────┴─────────────┴────────────────┘           │
│                             │                                   │
│                      TypeORM Repositories                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│                    localhost:5432                               │
│  Tables: user, task, group, category, comment, user_achievement │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Tools & Services Integrated

| Category | Tools |
|----------|-------|
| **CI/CD** | GitHub Actions (ci.yml) |
| **Code Quality** | ESLint, Prettier, SonarQube |
| **Testing** | Jest, SuperTest, Cucumber (BDD), k6 (Load Testing) |
| **Database** | PostgreSQL (Docker), pgAdmin |
| **Version Control** | Git, GitHub |
| **Documentation** | Markdown in `/doc` folder |

---

## 2. Requirements Recap

### 2.1 Initial Functional Requirements

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Create tasks with title, deadlines, priorities, notes | ✅ Implemented |
| 2 | Organize tasks into thematic groups | ✅ Implemented |
| 3 | Track progress state of each task | ✅ Implemented (OPEN, IN_PROGRESS, COMPLETED) |
| 4 | Organize tasks into thematic categories | ✅ Implemented |
| 5 | Define progress states (open, in progress, completed) | ✅ Implemented |
| 6 | Create or join study groups | ✅ Implemented |
| 7 | Group admins can invite/remove members | ✅ Implemented |
| 8 | Group admins can assign tasks to members | ✅ Implemented |
| 9 | Group admins can moderate group activities | ⚠️ Partially (basic moderation) |
| 10 | Built-in commenting/messaging function | ✅ Implemented (Comments) |
| 11 | Link tasks to specific dates | ✅ Implemented (dueDate field) |
| 12 | Supportive reminders/notifications | ❌ Not implemented |
| 13 | Identify overdue tasks | ✅ Implemented (evaluate-overdue endpoint) |
| 14 | Progress points and badges | ✅ Implemented (Gamification module) |
| 15 | Export plans as PDF/ICS | ❌ Not implemented |

### 2.2 Non-Functional Requirements

| Requirement | Status |
|-------------|--------|
| Available across web, mobile, desktop | ⚠️ Web only (responsive design) |
| Clear and manageable architecture | ✅ 3-tier architecture |
| Modular design | ✅ NestJS modules |

### 2.3 Postponed/Dropped Requirements

| Requirement | Reason |
|-------------|--------|
| Notifications/Reminders | Time constraints, would require WebSocket/Push implementation |
| PDF/ICS Export | Lower priority, focused on core functionality first |
| Mobile/Desktop apps | Web-first approach, responsive design as alternative |

### 2.4 UI/UX Factors Considered

Based on our UX analysis (Lab 3), we prioritized:

1. **Trust/Credibility** – Secure password hashing, reliable API responses
2. **Helpfulness/Usefulness** – Task management solves real student needs
3. **Learnability/Clarity** – Simple API design, clear endpoint structure
4. **Efficiency** – Fast API responses, minimal required fields
5. **Simplicity** – Clean data model, sensible defaults (e.g., task status = OPEN)

---

## 3. Retrospective & Lessons Learned

### 3.1 Team Organization

| Role | Team Member | Responsibilities |
|------|-------------|------------------|
| Backend Lead | Ricardo | NestJS API, Database design, CI/CD |
| Frontend Lead | Annabel | Next.js UI, Component design |
| Testing Lead | Artur | Test strategy, BDD scenarios, Reviews |

**Collaboration Style:**
- Weekly sync meetings
- Flexible task assignment based on availability
- Code reviews via GitHub Pull Requests

### 3.2 Biggest Challenges

1. **OneDrive Sync Issues** – Project in cloud folder caused file locking errors (`EPERM: operation not permitted`)
   - *Solution:* Pause OneDrive during development or move project locally

2. **BDD Test Setup** – Cucumber integration with NestJS required significant configuration
   - *Solution:* Custom hooks for database cleanup, proper test isolation

3. **Password Hashing Integration** – Tests failed when switching from plain `/users` to `/users/register`
   - *Solution:* Updated all test files to use correct endpoint with password field

4. **Port Configuration** – Confusion between `.env` port (3001) and default port (3000)
   - *Solution:* Consistent configuration across all test files

### 3.3 What Worked Well

- ✅ **Modular NestJS Architecture** – Easy to add new features (Categories, Comments, Gamification)
- ✅ **TypeORM Entities** – Clear data model with relations
- ✅ **GitHub Actions CI** – Automated tests on every push
- ✅ **Jest + SuperTest** – Reliable E2E testing
- ✅ **Docker for PostgreSQL** – Consistent database environment

### 3.4 What Didn't Work Well

- ❌ **Time Management** – Review meetings often postponed (Lab 6)
- ❌ **Scope Creep** – Some features added without proper planning
- ❌ **Documentation Timing** – Documentation often written after implementation

### 3.5 Most Helpful/Interesting Exercises

| Exercise | Why It Was Valuable |
|----------|---------------------|
| **Lab 4: Unit Testing** | Foundation for all other testing work |
| **Lab 5: BDD** | Helped think about features from user perspective |
| **Lab 8: Code Coverage** | Made test gaps visible |
| **Lab 9: CI/CD** | Automated quality checks, professional workflow |

### 3.6 What We Would Do Differently

1. **Move project out of OneDrive** from the start
2. **Define API contracts first** before implementing
3. **Write tests alongside features**, not after
4. **More frequent, shorter sync meetings**
5. **Better documentation of setup steps** for new team members

### 3.7 Suggestions for the Course

- More time for Lab 5 (BDD) – Setup is complex for beginners
- Provide example Cucumber configurations for NestJS
- Earlier introduction to Docker setup

---

## 4. Additional Aspects (Optional)

### 4.1 Testing Overview

| Test Type | Tool | Location |
|-----------|------|----------|
| Unit Tests | Jest | `apps/api/src/**/*.spec.ts` |
| E2E Tests | Jest + SuperTest | `apps/api/test/*.e2e-spec.ts` |
| BDD Tests | Cucumber | `apps/api/test/features/*.feature` |
| Load Tests | k6 | `apps/api/test/load/k6-load-test.js` |

**BDD Scenarios Implemented:**
- Create Task
- Change Task Status
- Assign Task to Group Member

### 4.2 Test Coverage & CI Reports

- **Coverage Tool:** Jest with `--coverage` flag
- **Coverage Threshold:** 80% (statements, branches, functions, lines)
- **Coverage Reports:** `apps/api/coverage/` (HTML, LCOV)
- **SonarQube Integration:** Static analysis, code duplication detection

### 4.3 Load Testing Results (k6)

```
Scenarios:
1. Constant Load: 10 VUs for 30 seconds
2. Ramp-up: 0→20 VUs over 30s, hold 30s, ramp down

Endpoints Tested:
- GET /health
- POST /users/register
- GET /users
```

### 4.4 Deployment Status

| Environment | Status |
|-------------|--------|
| Local Development | ✅ Docker Compose |
| Cloud Deployment | ❌ Not deployed (local only) |

### 4.5 Documentation

- All lab exercises documented in `/doc/Lab1` through `/doc/Lab12`
- API endpoints documented in `/doc/Lab10/api-testing.md`
- README.md with setup instructions

---

## 5. Demo (Optional)

### Live Demo Checklist

1. ✅ Start Docker containers (`docker-compose up -d`)
2. ✅ Start backend (`cd apps/api && npm start`)
3. ✅ Health check (`curl http://localhost:3001/health`)
4. ✅ Register user
5. ✅ Create task
6. ✅ Show test execution (`npm test`)

---

## Summary

**StudyConnect** is a functional prototype demonstrating:
- Modern 3-tier architecture (Next.js + NestJS + PostgreSQL)
- Comprehensive testing strategy (Unit, E2E, BDD, Load)
- CI/CD integration with GitHub Actions and SonarQube
- Practical application of software testing principles

**Key Takeaway:** Testing is not just about finding bugs – it's about building confidence in your code and enabling continuous improvement.
