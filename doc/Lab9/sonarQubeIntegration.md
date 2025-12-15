# SonarQube Integration and Code Quality Analysis

## Overview
This document describes the integration of **SonarQube** into the Continuous Integration (CI) pipeline for the **StudyConnect backend** (NestJS + TypeScript), as required for **Exercise 9.3 – Code Quality and Coverage Analysis**.

The objective of this exercise is to extend the existing CI pipeline with **automated static code analysis**, **test coverage reporting**, and **code duplication detection**, enabling continuous and objective feedback on the overall quality of the codebase.

This exercise builds on the CI foundations established in:
- Exercise 9.1 – Basic CI Setup
- Exercise 9.2 – Explore More GitHub Actions

---

## Tooling
The following tools and technologies are used to implement code quality analysis:

- **SonarQube Community Edition** (self-hosted instance)
- **SonarQube Scanner for GitHub Actions**
- **Jest** for unit testing and coverage generation
- **GitHub Actions** as the CI execution platform

All quality checks are executed automatically as part of the CI workflow.

---

## SonarQube Project Configuration
A dedicated SonarQube project was created for the backend application.

The configuration is defined in:
- [sonar-project.properties](../../apps/api/sonar-project.properties)

This configuration specifies:
- Project identification (`sonar.projectKey`, `sonar.projectName`)
- Source code directory (`src`)
- Test directory (`test`)
- Test file inclusion patterns
- Coverage report location (`coverage/lcov.info`)
- Excluded directories (`node_modules`, `dist`, `coverage`)

This ensures that SonarQube correctly distinguishes between production code and test code and accurately computes coverage and duplication metrics.

---

## CI Integration
SonarQube analysis is integrated into the existing CI workflow defined in:
- [ci.yml](../../.github/workflows/ci.yml)

The analysis step is executed:
- After unit tests, linting, and end-to-end tests
- Only once per pipeline execution (Node.js `22.x`) to avoid duplicate analyses

Authentication with SonarQube is handled securely using GitHub Secrets:
- `SONAR_TOKEN`
- `SONAR_HOST_URL`

---

## Test Coverage Reporting
Test coverage is generated using **Jest** with coverage enabled.

- CI command: `npm run test:cov`
- Coverage format: **LCOV**

The generated coverage report (`coverage/lcov.info`) is consumed by SonarQube during analysis, allowing coverage metrics to be displayed directly in the SonarQube dashboard.

This provides continuous visibility into:
- Overall test coverage
- Coverage trends over time
- Untested or weakly tested areas of the codebase

---

## Code Duplication Analysis
SonarQube automatically analyzes the codebase for duplicated code blocks using its built-in duplication detection engine.

The analysis results show:
- **0 duplicated lines**
- **0 duplicated blocks**
- **0.0% duplications**

This indicates that the backend codebase avoids copy-paste patterns and follows clean, modular design practices.

---

## Security Hotspots
As part of the analysis, SonarQube scans the codebase for **Security Hotspots**, which represent potentially risky coding patterns that require manual review.

For the current project:
- No Security Hotspots were detected
- No manual security reviews were required

This suggests that the backend implementation does not contain suspicious security-related patterns according to SonarQube’s rule set.

---

## Quality Gate
The project is evaluated against a **Quality Gate**, which aggregates multiple quality metrics such as:
- Bugs
- Vulnerabilities
- Test coverage
- Code duplication

The latest analysis result:
- **Quality Gate: Passed**

This confirms that the backend meets the defined quality standards and is suitable for further development and integration.

---

## Added Value
Integrating SonarQube into the CI pipeline provides the following benefits:

- Continuous and automated code quality feedback
- Early detection of maintainability and reliability issues
- Objective measurement of test coverage
- Verification of clean, non-duplicated code
- Increased confidence in code changes before merging

Overall, this exercise completes the CI pipeline by adding **automated quality assurance**, resulting in a more robust, professional, and production-ready development workflow.
