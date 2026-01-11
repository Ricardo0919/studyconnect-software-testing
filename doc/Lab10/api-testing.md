# Lab 10: API Testing Documentation

## Exercise 10.1: API Endpoints

### Base URL
```
http://localhost:3000
```

### Key Endpoints (Users & Tasks)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Register new user |
| POST | `/users/login` | Login user |
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id` | Update user profile |
| POST | `/tasks` | Create task |
| GET | `/tasks` | List all tasks |
| GET | `/tasks/:id` | Get task by ID |
| PATCH | `/tasks/:id` | Update task |
| PATCH | `/tasks/:id/status` | Change task status |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/health` | Health check |

### Request/Response Formats

**Register User:**
```json
POST /users/register
{
  "email": "user@example.com",
  "displayName": "User Name",
  "password": "Password123!"
}
// Response: { "id": "uuid", "email": "...", "displayName": "..." }
```

**Create Task:**
```json
POST /tasks
{
  "title": "Task Title",
  "notes": "Optional notes",
  "priority": "HIGH|MEDIUM|LOW",
  "dueDate": "2030-05-10T12:00:00Z",
  "creatorId": "user-uuid"
}
// Response: { "id": "uuid", "title": "...", "status": "OPEN", ... }
```

---

## Exercise 10.2: Manual API Testing (curl)

### Start Backend
```bash
cd apps/api
npm run start:dev
```

### Successful Requests

**1. Health Check:**
```bash
curl http://localhost:3000/health
# Response: {"ok":true}
```

**2. Register User:**
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@uni.de","displayName":"Test User","password":"Password123!"}'
```

**3. Create Task:**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Study for exam","priority":"HIGH","creatorId":"<user-id>"}'
```

### Error Handling Requests

**1. Missing Required Field:**
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@uni.de"}'
# Response: 400 Bad Request - validation error
```

**2. Duplicate Email:**
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@uni.de","displayName":"Another","password":"Password123!"}'
# Response: 409 Conflict - Email already registered
```

**3. Invalid Password:**
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@uni.de","displayName":"New","password":"weak"}'
# Response: 400 Bad Request - Password requirements not met
```

---

## Exercise 10.3: Automated API Tests

Tests located in: `apps/api/test/`

### Run Tests
```bash
cd apps/api
npm run test:e2e    # E2E tests with Jest + SuperTest
npm run test        # Unit tests
npm run bdd         # BDD tests with Cucumber
```

### Test Coverage
- `core-flow.e2e-spec.ts` - Full API flow (register, create group, create task, etc.)
- Unit tests in `src/**/*.spec.ts`
- BDD tests in `test/features/*.feature`

---

## Exercise 10.4: Load & Performance Testing

### Using k6 (recommended)

**Install k6:**
```bash
# Windows (winget)
winget install k6

# Mac (brew)

brew install k6

# Or download from https://k6.io/docs/getting-started/installation/
```

**Test Script:** `apps/api/test/load/k6-load-test.js`

**Run Tests:**
```bash
cd apps/api
k6 run test/load/k6-load-test.js
```

### Test Profiles
1. **Constant Load:** 10 VUs for 30 seconds
2. **Ramp-up:** 0→20 VUs over 30s, hold 30s, ramp down

### Key Metrics
- Response time (avg, p95, p99)
- Throughput (requests/second)
- Error rate

---

## Exercise 10.5: CI Integration

API tests integrated in `.github/workflows/ci.yml`:
- Unit tests run on push
- E2E tests run in CI with test database

```yaml
- name: Run API tests
  run: |
    cd apps/api
    npm run test
    npm run test:e2e
```
