# Advanced CI Setup

## Overview
This document describes the **advanced Continuous Integration (CI) setup** for the **StudyConnect backend** (NestJS + TypeScript), as required in **Exercise 9.2 – Advanced CI Setup**.

Building on the basic CI pipeline from Exercise 9.1, this setup extends the workflow to include **Docker-based services**, **database initialization**, and **end-to-end (E2E) testing**.

## CI Tool
The project continues to use **GitHub Actions** as the CI platform. GitHub Actions enables the execution of complex workflows involving containerized services directly within the CI environment.

The workflow configuration is defined in:
- `.github/workflows/ci.yml`

## Workflow Triggers
The workflow is triggered automatically on:
- Every `push` to any branch
- Every `pull_request`

This ensures that all changes are fully validated before integration.

## Execution Environment
- **Runner:** `ubuntu-latest`
- **Node.js version:** `22.x`
- **Package manager:** npm
- **Container platform:** Docker Compose

## Extended Pipeline Capabilities

### Dockerized Infrastructure
The advanced CI pipeline starts the full backend infrastructure using **Docker Compose**, defined at the repository root (`docker-compose.yml`).

The following services are launched:
- **PostgreSQL** database
- **Database initialization container** (creates the testing database if it does not exist)

This allows integration and E2E tests to run in an environment that closely mirrors production.

### Environment Configuration
Since GitHub Actions runners do not persist local environment files, the workflow dynamically generates a `.env` file for the API service during execution.

The environment variables include:
- Database host, port, credentials, and database name
- API listening port

This ensures consistent and reproducible test execution.

### Database Readiness Check
Before executing tests, the CI pipeline waits for PostgreSQL to become available using `pg_isready`.  
This guarantees that tests do not start until the database is fully initialized and ready to accept connections.

## Pipeline Steps
The advanced CI pipeline performs the following steps:

1. Checkout the repository source code.
2. Set up the Node.js runtime environment.
3. Start all required Docker services using `docker compose up -d`.
4. Wait until the PostgreSQL service is ready.
5. Install backend dependencies (`npm install`).
6. Generate the required `.env` file for the API.
7. Run unit tests (`npm test`).
8. Run static code analysis (`npm run lint`).
9. Execute end-to-end (E2E) tests (`npm run test:e2e`).
10. Shut down and clean up Docker services after execution.

## Expected Outcome
For every push or pull request, the advanced CI pipeline provides comprehensive validation:

- Confirms code quality via linting.
- Validates business logic through unit tests.
- Ensures correct system behavior through end-to-end tests against a real database.
- Guarantees isolation and cleanup of infrastructure after each run.

This advanced setup significantly increases confidence in the stability and correctness of the backend system.
