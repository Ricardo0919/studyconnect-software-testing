# Static Code Analysis – Linter Configuration (Exercise 8.1)

## Overview

This document describes the linter configuration and execution for the **StudyConnect backend** (NestJS + TypeScript) located in `apps/api`, as required in **Exercise 8.1 – Configure and Run Linter** of the Software Testing lab. The goal is to use a suitable static analysis tool to check code quality and reflect on its results.

## Linter Tool

The backend uses **ESLint** as linter, with a **flat configuration** defined at the project root in:

- [`eslint.config.mjs`](../eslint.config.mjs)

This configuration enables:

- Recommended ESLint rules for JavaScript/TypeScript.
- `typescript-eslint` type-checked rules.
- Integration with Prettier formatting.
- Ignoring generated or external folders such as `dist/`, `node_modules/`, and `coverage/`.

## Configuration Steps

1. Navigate to the backend project:

   ```bash
   cd apps/api
   ```

2. Use the existing ESLint setup defined in `eslint.config.mjs`. No additional dependencies were required, as ESLint and the TypeScript-specific plugins are already part of the project configuration.

3. Ensure the following scripts are defined in `apps/api/package.json`:

   ```jsonc
   "scripts": {
     "lint": "eslint "{src,apps,libs,test}/**/*.ts" --fix",
     "lint:api": "eslint "src/**/*.ts""
   }
   ```

   - `lint` runs ESLint on backend code and tests.
   - `lint:api` focuses only on the backend source files under `src/`.

## Run Commands

From `apps/api` the following commands were executed:

- Lint only the backend source code:

  ```bash
  npm run lint:api
  ```

- Lint backend code plus tests and other TypeScript files:

  ```bash
  npm run lint
  ```

## Results of the Checks

Running `npm run lint:api` reported around **175 issues** (errors and warnings). The main categories were:

- **Unsafe type usage**  
  - `@typescript-eslint/no-unsafe-assignment`  
  - `@typescript-eslint/no-unsafe-member-access`  
  - `@typescript-eslint/no-unsafe-return`  

- **Code quality and style**  
  - Unused variables (`@typescript-eslint/no-unused-vars`)  
  - Missing handling of asynchronous calls (`@typescript-eslint/no-floating-promises`)

These findings highlight that parts of the backend still rely on `any` and loosely-typed objects, especially in controllers, services and DTOs.

## Reflection on Linters

Linters like ESLint are **very useful** in this project because they:

- Enforce a consistent style across the codebase.
- Expose unsafe patterns (e.g. heavy use of `any`, unchecked property access).
- Help detect potential bugs and design issues before running tests or deploying.

Although the initial number of reported issues is relatively high, it provides a clear roadmap for gradually improving code quality, type safety and maintainability in the StudyConnect backend.
