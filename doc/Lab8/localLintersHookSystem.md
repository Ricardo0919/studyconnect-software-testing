# Run local linters automatically using Git’s hook system

## Overview
This document explains the setup of a Git **pre-commit hook** for the StudyConnect backend (`apps/api`) as required in Exercise 8.3.  
The hook runs linting and test coverage checks automatically before each commit to increase code quality and visibility of potential issues.
Because the backend contains legacy TypeScript patterns that trigger many linting warnings, the hook was configured as **non-blocking**.  
This allows development to continue while still reporting all issues to the developer.



## Hook Setup
The hook file was added at:
.git/hooks/pre-commit
Git executes this script every time a commit is performed.

### Final Script
```sh
#!/bin/sh
echo "Running pre-commit checks for StudyConnect API"

# Ir a la carpeta del API
cd apps/api || exit 1

echo "Running ESLint"
npm run lint:api
LINT_STATUS=$?

if [ "$LINT_STATUS" -ne 0 ]; then
  echo "ESLint finished with errors (exit code $LINT_STATUS)."
  echo "Please review the issues above, but commit will continue for this lab."
fi

echo "Running Jest tests with coverage"
npm run test:cov
TEST_STATUS=$?

if [ "$TEST_STATUS" -ne 0 ]; then
  echo "Jest finished with errors/coverage issues (exit code $TEST_STATUS)."
  echo "Please review the output above, but commit will continue for this lab."
fi

echo "Pre-commit checks finished (non-blocking)."
exit 0
```

## What the Hook Does
- Executes ESLint (npm run lint:api)
- Executes Jest with coverage (npm run test:cov)
- Displays problems clearly to the developer
- Allows commits even when issues exist (non-blocking mode)


## Example Execution
When performing a commit, output similar to this appears:
```sh
Running pre-commit checks for StudyConnect API
Running ESLint
# ... ESLint output ...

Running Jest tests with coverage
# ... Jest output ...

Pre-commit checks finished (non-blocking).
```

## Reflection
Pre-commit hooks help maintain quality by making linting and testing part of the commit workflow.
Even in non-blocking mode, this hook increases awareness of issues in the StudyConnect backend and aligns with the purpose of the exercise.
A blocking hook would normally be used in production, but for this lab and the current state of the codebase, the chosen configuration provides the right balance.
