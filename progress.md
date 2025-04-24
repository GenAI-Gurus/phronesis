# Project Progress Tracker

_This file tracks the status of all project tasks, milestones, and discovered work. For requirements and architecture, see specification.md._

## In Progress
- [ ] Implement Optional Social Login
- [ ] Integrate Speech-to-Text (Optional)
- [ ] Set Up Push Notifications
- [ ] Implement Email Notification System
- [ ] Build Analytics & Reporting Module
- [ ] Construct an Admin Dashboard
- [ ] Integrate Application Insights
- [ ] Establish Automated Testing
- [ ] Perform Load and Stress Testing
- [ ] Deploy MVP to Production

## Upcoming / TODO
- [ ] Continue to improve safety and robustness of automated DB migrations (see .github/workflows/azure-backend.yml and specification.md)
    - Add pre-migration backup, manual approval for production, and/or rollback strategy.
    - Review Azure App Service + Alembic best practices for zero-downtime and safe schema changes.

## Completed Tasks
- [x] Finalize Product Requirements
    *Product requirements, vision, and scope finalized based on user feedback. The single source of truth for requirements is:*
    - *specification.md (canonical product & technical specification)*
    - *decisions_log.md (rationale and historical context only)*
    - *PRS_original.md (historical reference, superseded)*
- [x] Define Key Data Entities
    *Key data entities for the MVP are now finalized and documented in:*
    - *decisions_log.md (agreement and rationale)*
    - *specification.md (current product specification)*
- [x] Architecture Design Document
    *System architecture, data flow, and all diagrams are finalized and fully documented in:*
    - *specification.md (see Architecture Design and User Journey Diagrams sections)*
- [x] Set Up Version Control
    *Git repository initialized and connected to remote:*
    - *https://github.com/GenAI-Gurus/phronesis*
    - *.gitignore, README.md, and MIT LICENSE added and pushed to main branch.*
    - *Project is ready for open-source collaboration and advanced user contributions.*
- [x] Initialize Python Project
    *Modular FastAPI backend scaffolded in the `backend/` directory, designed for maintainability and AI-friendly expansion. See:*
    - *backend/README.md (project overview)*
    - *backend/STRUCTURE.md (folder and module structure)*
    - *backend/requirements.txt (core dependencies)*
- [x] Implement Decision Chat Session & Message Endpoints
    *CRUD API endpoints for DecisionChatSession and DecisionChatMessage, with Pydantic validation, database integration, and Pytest unit tests (expected, edge, failure cases) are implemented and tested. All tests pass as of 2025-04-15.*
    - *Endpoints in backend/app/api/v1/endpoints/decisions.py*
    - *Models in backend/app/models/decision.py, reflection.py*
    - *Tests in tests/app/api/v1/endpoints/test_decisions.py*
- [x] Establish Dependency Management (Poetry)
    *Poetry installed and configured for the backend. Dependencies managed in pyproject.toml/poetry.lock. requirements.txt is now obsolete and will be removed.*
- [x] Design Backend Folder Structure
    *Backend folder structure is modular, AI-friendly, and documented in backend/STRUCTURE.md. Ready for scalable development.*
- [x] Configure Local Development Environment
    *.env.example added for safe, maintainable environment variable management. Local dev server can be started with `poetry run uvicorn app.main:app --reload`. See backend/README.md for instructions.*
- [x] Set Up Azure Cloud Resources & Provision App Service
    *Azure App Service (Linux, Python 3.11) was provisioned using Bicep templates as described in infra/bicep/README.md. See Azure Portal for resource details.*
- [x] Provision a Database on Azure
    *Azure SQL Database was provisioned using Bicep templates. Admin login and password were set securely, and the SQL firewall rule was intentionally skipped due to dynamic developer IP (see decisions_log.md). Azure-internal access is enabled by default.*
- [x] Set Up Database Security (Key Vault)
    *Database connection is secured using Azure Key Vault. The backend loads the DATABASE_URL from environment variables, which should point to Key Vault in production and to SQLite for local development. See .env.example for details.*
- [x] Design Database Schema & Migrations
    *All core and gamification entities are modeled in SQLAlchemy. Alembic is set up for migrations. See backend/README.md for database migration instructions using Alembic. This ensures your schema is up to date both locally and in production.*
- [x] Implement User Registration API
    */api/v1/register endpoint implemented. Validates email and password, checks for duplicates, hashes password, and returns new user info.*
- [x] Implement Authentication
    */api/v1/login endpoint implemented. Verifies credentials and returns JWT access token on success.*
- [x] Develop User Profile API
    */api/v1/me endpoints implemented. Supports authenticated profile retrieval and update for current user.*
- [x] Build Frontend Base Framework
    - [x] Choose frontend stack (React + Vite + TypeScript + Material UI)
    - [x] Scaffold project in /frontend
    - [x] Set up folder structure (src/components, src/pages, src/api, etc.)
    - [x] Configure routing (React Router)
    - [x] Add API client and connect to backend
    - [x] Document setup in /frontend/README.md
    *Frontend base framework is fully implemented and tested as of 2025-04-16.*
- [x] Design Registration and Login Screens
    - [x] Create Registration UI (Material UI form)
    - [x] Create Login UI (Material UI form)
    - [x] Add client-side validation
    - [x] Integrate with backend API
    - [x] Show error/success messages
    - [x] Add component/unit tests
    *All frontend authentication screens and validation logic are implemented and tested. All tests pass as of 2025-04-16.*
- [x] Implement Reflection Prompt Generator Endpoint
- [x] Integrate OpenAI API for Prompts
- [x] Develop UI for Reflection Prompts
- [x] Implement Auto Tagging and Categorization
- [x] Develop User Dashboard UI
- [x] Create Decision Journal Data Model
- [x] Implement Decision Journal API endpoints (session/message CRUD, status update)
- [x] Implement Decision Journal Entry creation, listing, and update endpoints
- [x] Build Decision Journal Form UI
- [x] Implement Reflection Prompt Generator Endpoint (backend, OpenAI integration, fallback, tests)
- [x] Integrate OpenAI API for Prompts (backend reflection prompt generator endpoint, fallback, tests)
- [x] Develop UI for Reflection Prompts (frontend, error/loading handling, Material UI)
- [x] Implement Auto Tagging and Categorization (OpenAI LLM, function calling, tests)
- [x] Develop API for Value Calibration
- [x] Create Value Calibration Data Model
- [x] Design Value Calibration UI (frontend, backend, tests)
- [x] Implement Tension Detector Logic (backend service, tests)
- [x] Build Decision Support Chat API (FastAPI endpoint, tests)
- [x] Develop Chat UI for Decision Support (Material UI, tests)
- [x] Integrate OpenAI Chat API (backend endpoints, fallback, tests)
- [x] Implement Future-Self Simulator Backend (OpenAI, fallback, tests)
- [x] Develop Simulator UI Component (frontend, tests)
- [x] Implement Life Theme & Progress Tracker (backend, frontend, tests)
- [x] Develop Progress Visualization UI (Material UI, Recharts, tests)
- [x] Create Gamification Module (Backend, endpoints, models, tests)
- [x] Develop Gamification UI Elements (frontend, Material UI, tests)
- [x] Prepare backend for Azure App Service (Dockerfile, Gunicorn/Uvicorn, env vars)
- [x] Prepare frontend for Azure Static Web Apps (build output, GitHub Actions)
- [x] Connect Azure Key Vault or App Service settings for secrets
- [x] Add GitHub Actions deployment step for backend (azure/webapps-deploy@v3)
- [x] Add GitHub Actions deployment step for frontend (Azure/static-web-apps-deploy@v1)
- [x] Set Up CI/CD Pipeline (GitHub Actions for backend and frontend CI)
    - GitHub Actions is now configured for backend (FastAPI, Poetry) and frontend (React, Vite) CI. See .github/workflows/ci-cd.yml and README.md for details.
- [x] Test deployment and document URLs for QA
    **Production URLs:**
    - Frontend: https://ambitious-ground-0a5060803.6.azurestaticapps.net/
    - Backend: https://phronesis-backend-app.azurewebsites.net/api/v1
    **QA Checklist:**
    - [ ] Frontend loads and displays dashboard
    - [ ] Registration and login work
    - [ ] Journal, reflection, and chat features function as expected
    - [ ] Backend API responds to requests (e.g., /api/v1/docs)
    - [ ] No critical errors in browser or server logs
    - [ ] Environment variables/secrets are loaded correctly
    - [ ] All major user flows tested
- [ ] Set Up Push Notifications
- [ ] Implement Email Notification System
- [ ] Build Analytics & Reporting Module
- [ ] Construct an Admin Dashboard
- [ ] Integrate Application Insights
- [ ] Establish Automated Testing
- [ ] Perform Load and Stress Testing
- [x] Set Up CI/CD Pipeline
    - GitHub Actions is now configured for backend (FastAPI, Poetry) and frontend (React, Vite) CI. See .github/workflows/ci-cd.yml and README.md for details.
- [ ] Deploy MVP to Production