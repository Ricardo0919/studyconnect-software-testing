# Exercise 6 – Model, Service, Repository & API Testing Documentation

## Exercise 6.1 – Review of our Unit Tests of Models

### Goal
Document how the existing entity unit tests inside `apps/api/src` were evaluated for coverage quality using black-box testing techniques ( specifically: Equivalence Class Partitioning (ECP), Boundary Value Analysis (BVA), Decision Tables (DT)).

---

### Approach

1. **Inventory & grouping**  
   Identify all `*.entity.ts` and corresponding `*.entity.spec.ts` files under `apps/api/src/**`.

2. **Review entity.spec.ts files**
    Check which unit tests were implemented for each entity and find out which cases are not taken into account.

3. **Technique application**  
   - **Equivalence Class Partitioning (ECP):** Differentiated valid/invalid inputs (valid vs invalid emails, allowed enum roles, boolean flags, etc.).  
   - **Boundary Value Analysis (BVA):** Applied where limits exist (name lengths, date boundaries, password constraints once implemented).  
   - **Decision Tables (DT):** Used for mutually exclusive invariants (e.g., comment target rules, forbidden state transitions).

4. **Document current test coverage and missing/added test cases**  
   Extracted all uncovered equivalence classes, boundary cases, and rule combinations. Missing test scenarios are documented for future implementation.

---

### Current Coverage vs. Missing test cases

| Entity | Current Test Coverage | Missing / Weak Spots (Techniques) |
| --- | --- | --- |
| **User** | Simple checks for email containing `@` and non-empty display name. | No tests for role defaults, uniqueness/normalization, password validation (future). Add ECP for email validity and BVA for password rules. |
| **Category** | Smoke tests for name/description assignment. | Missing ECP for required name, empty string handling, and optional description. |
| **Group** | Tests owner assignment and simple member add/remove. | Missing duplicate-member prevention, member count boundaries, validation of mandatory owner. Requires ECP + decision tables. |
| **Task** | Covers default creation, allowed transitions, one invalid transition, overdue helper. | Missing full forbidden-transition matrix, due-date boundaries, priority enum validation. Requires decision tables + BVA. |
| **TaskAssignment** | Tests default `active=true` and timestamp behavior. | Missing required task/user references and active-toggle behavior. Requires ECP. |
| **Comment** | Happy-path tests for linking to either task or group. | Missing enforcement of “exactly one target”, missing empty content validation. Requires decision tables + BVA. |
| **UserAchievement** | Tests badge-user binding and default points. | Missing tests for duplicate badges, invalid badge enums, point accumulation. Requires ECP/BVA. |

---

### Result
The analysis outlines which black-box scenarios are currently covered and where gaps remain.

Test again with:
```bash 
npm run test
```
---

# Exercise 6.2 – Service Testing

- A password-aware `UsersService` was implemented, supporting:
  - user registration  
  - login with credential validation  
  - password rules (uppercase, lowercase, digit, special character)  
  - role changes and profile updates  

- DTO-based endpoints were added in `users.controller.ts`:
  - `POST /users/register`
  - `POST /users/login`
  - `GET /users/:id`
  - `PATCH /users/:id`
  - `PATCH /users/:id/role`

- Comprehensive Jest specs (`users.service.spec.ts`) validate:
  - repository mocking  
  - hashing behavior  
  - duplicate-email rejection  
  - password validation  
  - login success/failure  
  - profile patching  
  - role updates  

---

# Exercise 6.3 – Repository Testing

- A dedicated `UserRepository` abstraction (`user.repository.ts`) was introduced.  
- It encapsulates CRUD operations, email lookups, role queries, and group-membership lookups.
- Tests rely on **pg-mem** (`user.repository.spec.ts`), providing:
  - real SQL execution  
  - schema constraints (unique constraints, foreign keys)  
  - join testing across tables  

- The repository is registered as a provider inside `UsersModule` and exported for dependency injection.

---

# Exercise 6.4 – REST API Controller Enhancements

- `users.controller.ts` upgraded with validation-aware endpoints for registration, login, profile, and role management.  
- `tasks.controller.ts` expanded with:
  - PATCH/DELETE operations  
  - reusable validation pipe  
  - title/notes/priority/due-date updates  

- `TasksService` now performs:
  - due-date validation  
  - group/category reference resolution  
  - Jest-backed testing of update/delete scenarios  

---

# Test Evidence

The following targeted Jest suites were executed to ensure the implementation remains correct:

```bash
cd apps/api
npm run test -- users.service
npm run test -- user.repository
npm run test -- tasks.service
