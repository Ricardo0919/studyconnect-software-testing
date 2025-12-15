# Basic CI Setup

## Overview
This document describes the **basic Continuous Integration (CI) setup** for the **StudyConnect backend** (NestJS + TypeScript), located in `apps/api`, as required for **Exercise 9.1 – Basic CI Setup**.

The purpose of this setup is to automatically verify code quality and correctness whenever changes are pushed to the repository or submitted via pull requests.

## CI Tool
The project uses **GitHub Actions** as the Continuous Integration platform. GitHub Actions was selected because it integrates natively with GitHub repositories and allows workflows to be defined declaratively using YAML configuration files.

The CI workflow is defined in:
- [ci.yml](../../.github/workflows/ci.yml)

## Workflow Triggers
The workflow is triggered automatically on:
- Every `push` to any branch
- Every `pull_request`

This ensures that all changes are validated before being merged into the main codebase.

## Execution Environment
- **Runner:** `ubuntu-latest`
- **Node.js version:** `22.x`
- **Package manager:** npm

A matrix strategy is used to define the Node.js version, allowing easy extensibility if additional versions are required in the future.

## Project Scope
The CI pipeline is scoped specifically to the backend application located at:
- `apps/api`

All CI steps are executed relative to this directory to ensure that only the backend is analyzed and tested.

## Pipeline Steps
The basic CI pipeline performs the following steps:

1. Checks out the repository source code.
2. Sets up the Node.js runtime environment.
3. Installs project dependencies using `npm install`.
4. Runs static code analysis using ESLint (`npm run lint`).
5. Executes automated unit tests using Jest (`npm test`).

## Expected Outcome
For every push or pull request, GitHub Actions provides immediate feedback:

- A **successful run** confirms that the backend builds correctly, passes linting rules, and all unit tests succeed.
- A **failed run** highlights code quality issues or failing tests early, preventing unstable code from being merged.

This basic CI setup establishes a reliable foundation for further CI enhancements in later exercises.
