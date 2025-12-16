# Explore More GitHub Actions

## Overview
This document describes the **enhanced Continuous Integration (CI) setup** for the **StudyConnect backend** (NestJS + TypeScript), extending the basic CI pipeline implemented in Exercise 9.1.
<br>The goal of this exercise is to explore and integrate **additional GitHub Actions and repository features** to improve:
- Code quality
- Security
- Reliability of pull requests and merges
- Realism of the test environment

## CI Platform
The project uses **GitHub Actions** as the CI platform.  
All workflows are defined as code and stored in the repository.

Workflow configuration file:
- [ci.yml](../../.github/workflows/ci.yml)

## Enhancements Implemented

### 1. Test Matrix (Multiple Node.js Versions)
To ensure compatibility across different runtime environments, the CI workflow uses a **matrix strategy** to run the pipeline on multiple Node.js versions:
- Node.js `20.x`
- Node.js `22.x`

This helps detect version-specific issues early and increases confidence in runtime compatibility.

### 2. Docker Compose Integration
The CI pipeline starts the complete backend infrastructure using **Docker Compose**, defined at the repository root (`docker-compose.yml`).
<br>The following services are started:
- PostgreSQL database
- Database initialization container for the testing database
<br>This allows tests to run against a real database environment instead of mocks, closely matching production behavior.

### 3. Environment Configuration in CI
Since GitHub Actions runners do not persist local environment files, the workflow dynamically generates a `.env` file for the backend during execution.
<br>The environment variables include:
- Database host, port, credentials, and database name
- API port
<br>This guarantees consistent and reproducible execution of tests in CI.

### 4. Database Readiness Check
Before running tests, the workflow waits for PostgreSQL to be ready using `pg_isready`.
<br>This prevents race conditions and ensures that:
- Unit tests
- Integration tests
- End-to-end (E2E) tests
<br>only start once the database is fully available.

### 5. End-to-End (E2E) Testing
In addition to unit tests and linting, the CI pipeline executes **end-to-end tests** using: npm run test:e2e
<br>These tests validate the behavior of the system across multiple layers (API, database, and services), providing higher confidence in system correctness.

### 6. Dependency Security Review
The workflow integrates the **Dependency Review Action**:
- `actions/dependency-review-action@v4`
<br>This action runs automatically on **pull requests** and analyzes dependency changes to detect:
- Vulnerable packages
- Unexpected dependency modifications
<br>This improves the security posture of the project by catching risky dependency changes early.

### 7. Pull Request Status Checks & Branch Protection
Beyond workflow configuration, **repository rulesets** were configured to enforce quality gates before merging:
- Require pull requests before merging
- Require at least one approval
- Require CI status checks to pass before merging
- Require branches to be up to date before merging
The required status checks include:
- `API - lint & test (20.x)`
- `API - lint & test (22.x)`
<br>This ensures that no code can be merged unless all CI checks succeed.

## Pipeline Summary
The enhanced CI pipeline performs the following steps:
1. Checkout repository source code
2. Run dependency security review (pull requests only)
3. Set up Node.js (matrix strategy)
4. Start Docker Compose services
5. Wait for PostgreSQL readiness
6. Install backend dependencies
7. Generate `.env` configuration
8. Run unit tests
9. Run linting checks
10. Run end-to-end (E2E) tests
11. Shut down Docker services

## Added Value
These enhancements provide significant benefits:
- Improved runtime compatibility through matrix testing
- Higher confidence via real database and E2E tests
- Increased security through dependency analysis
- Safer merges enforced by required CI status checks
<br>Overall, the advanced CI setup results in a more robust, secure, and production-ready development workflow.
