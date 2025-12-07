# Capture Code Coverage

## Overview
This document describes how code coverage is captured for the **StudyConnect backend** (NestJS + TypeScript) located in `apps/api`, as required in **Exercise 8.2 – Capture Code Coverage**

## Coverage Tool
The backend uses **Jest’s built-in code coverage** support. Jest is already the unit test framework for the NestJS backend, so it is a natural choice for computing coverage without adding extra tools.
The Jest configuration for the backend is defined in:
- [`jest.config.ts`](../../apps/api/jest.config.ts)

This configuration now includes:
- `collectCoverage` enabled.
- `collectCoverageFrom: ['src/**/*.ts']` to focus on backend source files.
- `coverageDirectory: 'coverage'` for storing reports.
- `coverageReporters: ['text', 'lcov', 'html']` for console and HTML reports.
- A global `coverageThreshold` set to 80% for statements, branches, functions and lines.

## Configuration Steps
1. Navigate to the backend project:

   ```bash
   cd apps/api
   ```

2. Extend the existing Jest configuration in `jest.config.ts` with coverage-related options:

   ```ts
   collectCoverage: true,
   collectCoverageFrom: ['src/**/*.ts'],
   coverageDirectory: 'coverage',
   coverageReporters: ['text', 'lcov', 'html'],
   coverageThreshold: {
     global: {
       branches: 80,
       functions: 80,
       lines: 80,
       statements: 80,
     },
   },
   ```

3. Use the existing Jest coverage script defined in `apps/api/package.json`:

   ```jsonc
   "scripts": {
     "test": "jest",
     "test:cov": "jest --coverage",
     "test:e2e": "jest --config ./test/jest-e2e.json"
   }
   ```

## Run Commands

From `apps/api` the following command was executed to capture coverage:

```bash
npm run test:cov
```

Jest runs all unit tests and generates coverage output in the console, as well as detailed reports in the [`coverage/index.html`](../../apps/api/coverage/index.html) directory (including HTML reports that can be opened in a browser).

## Results of the Checks

The command `npm run test:cov` executed **22** test suites with **58** tests, all of which passed. Jest then reported the following global coverage metrics:

- **Statements:** 58.23%
- **Branches:** 45.98%
- **Functions:** 55.17%
- **Lines:** 58.68%

Because the configured global threshold is **80%**, Jest reported that the coverage thresholds for statements, branches, functions and lines were **not met**. This indicates that, while there is already a reasonable amount of test coverage, additional tests are required to reach the target level.

## Reflection on Code Coverage

Code coverage is a useful metric because it shows how much of the codebase is exercised by automated tests. In the StudyConnect backend, the coverage report helps to:

- Identify modules and services that are still weakly tested (for example, parts of the tasks and groups modules).
- Prioritise where to add new tests to increase confidence in the system.
- Monitor how test quality evolves as new features are added.

At the same time, coverage has limitations: high percentages do not guarantee good tests or correct behaviour. It is possible to achieve high coverage with superficial assertions. For this project, coverage is best seen as a **diagnostic indicator** that complements other practices (meaningful assertions, testing edge cases, and negative scenarios) rather than a goal on its own.
