# GitHub Actions Workflows for Phronesis

This document describes all automated workflows in the repository, their purpose, triggers, and key steps. Keeping this up-to-date ensures transparency and easy onboarding for all contributors.

---

## Overview

Workflows are defined in `.github/workflows/`. They automate CI, deployment, linting, and other repetitive tasks for both backend and frontend.

---

## Workflow Summary

| Workflow File                      | Purpose                                 | Triggers                 |
|------------------------------------|-----------------------------------------|--------------------------|
| `azure-backend.yml`                | Backend CI, test, lint, deploy to Azure | Push/PR to backend branch|
| `azure-static-web-apps.yml`        | Frontend build & deploy to Azure Static Web Apps | Push/PR to `main` |
| `ci.yml`                           | General CI (tests, lint, etc.)          | Push/PR (all branches)   |

---

## Details

### 1. `azure-backend.yml`
- **Purpose:**
  - Installs backend dependencies
  - Runs linting (Black)
  - Runs all Pytest tests
  - Deploys backend (Docker) to Azure App Service
- **Trigger:** Push or PR to backend-related branches

### 2. `azure-static-web-apps.yml`
- **Purpose:**
  - Installs frontend dependencies
  - Builds React/Vite frontend
  - Deploys to Azure Static Web Apps
- **Trigger:** Push or PR to `main` branch
- **Secrets:** Requires `AZURE_STATIC_WEB_APPS_API_TOKEN` in repo secrets
- **Important:** For Vite/React builds in GitHub Actions, all environment variables (e.g., `VITE_API_URL`) **must be set as GitHub secrets** and passed via the `env:` block in the workflow. Azure portal environment variables will NOT be available during GitHub Actions builds.
### 3. `ci.yml`
- **Purpose:**
  - Runs general CI tasks (tests, lint, etc.)
  - May cover both backend and frontend, or serve as a catch-all
- **Trigger:** Push or PR to any branch

---

## Adding or Modifying Workflows
- Place new workflow files in `.github/workflows/`.
- Document any new workflow in this file for visibility.
- Update this file if workflow triggers or purposes change.

---

# Reason:
This file provides a single source of truth for all automation in the repo, making it easy for contributors and maintainers to understand and extend CI/CD.
