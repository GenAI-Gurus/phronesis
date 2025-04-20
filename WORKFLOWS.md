# GitHub Actions Workflows for Phronesis

This document describes all automated workflows in the repository, their purpose, triggers, and key steps. Keeping this up-to-date ensures transparency and easy onboarding for all contributors.

---

## Overview

Workflows are defined in `.github/workflows/`. They automate CI, deployment, linting, and other repetitive tasks for both backend and frontend.

---

## Workflow Summary

| Workflow File                      | Purpose                                 | Triggers/Conditions                 |
|------------------------------------|-----------------------------------------|--------------------------|
| `azure-backend.yml`                | Backend CI, test, lint, deploy to Azure (no longer runs DB migrations automatically) | Push/PR to backend files (skips deploy if only `backend/tests/` changes) |
| `azure-static-web-apps.yml`        | Frontend build & deploy to Azure Static Web Apps | Push/PR to frontend files (skips deploy if only `frontend/tests/` changes) |
| `manual-migrate.yml`               | Run Alembic DB migrations in production or staging manually | Manual trigger from GitHub Actions UI |
| `ci.yml`                           | General CI (tests, lint, etc.)          | Push/PR (all branches)   |

---

## Details

### 1. `azure-backend.yml`
- **Purpose:**
  - Installs backend dependencies
  - Runs linting (Black)
  - Runs all Pytest tests
  - Deploys backend (Docker) to Azure App Service (only if non-test backend files changed)
  - **Note:** Database migrations are now run via the manual workflow (see below), not automatically after deploy.
- **Trigger/Condition:**
  - Push or PR to any file under `backend/` or the workflow itself
  - **Deployment is skipped if only `backend/tests/` files were changed** (tests still run)
  - Uses `dorny/paths-filter` for detection

### 2. `azure-static-web-apps.yml`
- **Purpose:**
  - Installs frontend dependencies
  - Builds React/Vite frontend
  - Deploys to Azure Static Web Apps (only if non-test frontend files changed)
- **Trigger/Condition:**
  - Push or PR to any file under `frontend/` or the workflow itself
  - **Deployment is skipped if only `frontend/tests/` files were changed** (tests/builds still run)
  - Uses `dorny/paths-filter` for detection
- **Secrets:** Requires `AZURE_STATIC_WEB_APPS_API_TOKEN` in repo secrets
- **Important:** For Vite/React builds in GitHub Actions, all environment variables (e.g., `VITE_API_URL`) **must be set as GitHub secrets** and passed via the `env:` block in the workflow. Azure portal environment variables will NOT be available during GitHub Actions builds.
### 3. `ci.yml`
- **Purpose:**
  - Runs general CI tasks (tests, lint, etc.)
  - Runs Playwright E2E tests for all major frontend user flows (across desktop and mobile)
  - Uploads Playwright HTML report as a CI artifact for QA review
- **Trigger:**
  - Pull Request to `main`
  - Nightly at 2am UTC (schedule)
  - Manual trigger (workflow_dispatch)
- **How to Review:**
  - After every run, download the `playwright-report` artifact from the GitHub Actions UI.
  - Open `index.html` in the report to view detailed E2E results, screenshots, logs, and outputs for all [A], [AI], and [A+M] tests.
  - Follow the TESTING.md protocol for manual/AI review of flagged outputs.
- **Note:**
  - Full E2E tests are not run on every push for speed/cost reasons.
  - For fast post-deploy health checks, consider adding a smoke test step to deploy workflows (e.g., azure-static-web-apps.yml).

### 4. `manual-migrate.yml`
- **Purpose:**
  - Run Alembic DB migrations in the deployed backend container (production or staging) via a manual trigger.
  - Uses the Azure App Service Kudu API to execute the migration command inside the running container.
  - Ensures migrations are only run after verifying the new container is healthy and deployed.
- **Trigger:**
  - Manual trigger from the GitHub Actions UI (`workflow_dispatch`).
- **Usage:**
  1. Deploy backend using `azure-backend.yml` (wait for success).
  2. In Azure Portal, go to your App Service > Deployment Center > FTPS credentials. Copy your Kudu deployment username and password.
  3. Add these as GitHub secrets: `AZURE_KUDU_USER` and `AZURE_KUDU_PASS`.
  4. Go to GitHub Actions, select the "Manual DB Migration" workflow, and click "Run workflow".
  5. The workflow will use the Kudu API to run `alembic upgrade head` in your container. Output and errors are visible in the Actions log.
- **Best Practices:**
  - Consider running a backup before migration.
  - Use for both staging and production as needed.
  - For critical migrations, consider a manual approval step or backup.

---

## Adding or Modifying Workflows
- Place new workflow files in `.github/workflows/`.
- Document any new workflow in this file for visibility.
- Update this file if workflow triggers or purposes change.

---

# Reason:
This file provides a single source of truth for all automation in the repo, making it easy for contributors and maintainers to understand and extend CI/CD.
