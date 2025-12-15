# Basic CI Setup

## Overview
This document describes the basic Continuous Integration (CI) setup for the **StudyConnect backend** (NestJS + TypeScript) located in `apps/api`, as required in **Exercise 9.1 – Basic CI Setup**.

The goal of this setup is to automatically run quality checks whenever changes are pushed to the repository or submitted via pull requests.

## CI Tool
The project uses **GitHub Actions** as the CI platform. GitHub Actions was chosen because it integrates natively with GitHub repositories and allows workflows to be defined as code using YAML files.

The CI workflow is defined in:
- `.github/workflows/ci.yml`

## Workflow Triggers
The workflow is automatically triggered on:
- Every `push` to any branch
- Every `pull_request`

This ensures that all changes are validated before being merged into the main codebase.

## Execution Environment
- **Runner:** `ubuntu-latest`
- **Node.js version:** `20.x` (configured using a matrix strategy)
- **Package manager:** npm

## Project Scope
The CI workflow is scoped specifically to the backend project located in:
- `apps/api`

This is achieved by configuring a default working directory for all workflow steps.

## Pipeline Steps
The CI pipeline performs the following steps:

1. Checkout the repository source code.
2. Set up the Node.js environment and enable dependency caching.
3. Install backend dependencies using `npm ci`.
4. Run static code analysis using the linter (`npm run lint`, if present).
5. Execute automated unit tests (`npm test`, if present).

## Expected Outcome
For every push or pull request, GitHub Actions provides immediate feedback:
- A successful run indicates that the backend builds, linting passes, and tests execute correctly.
- A failed run highlights issues early in the development process, preventing faulty code from being merged.
