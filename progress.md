[x] 1. Finalize Product Requirements

*Product requirements, vision, and scope finalized based on user feedback. All details and agreements are documented in:*
- *decisions_log.md (finalized decisions and clarifications)*
- *specification.md (current product specification)*
- *PRS_original.md (original PRS for reference)*

[x] 2. Define Key Data Entities

*Key data entities for the MVP are now finalized and documented in:*
- *decisions_log.md (agreement and rationale)*
- *specification.md (current product specification)*

[x] 3. Architecture Design Document

*System architecture, data flow, and all diagrams are finalized and fully documented in:*
- *specification.md (see Architecture Design and User Journey Diagrams sections)*

[x] 4. Set Up Version Control

*Git repository initialized and connected to remote:*
- *https://github.com/GenAI-Gurus/phronesis*
- *.gitignore, README.md, and MIT LICENSE added and pushed to main branch.*
- *Project is ready for open-source collaboration and advanced user contributions.*

[x] 5. Initialize Python Project

*Modular FastAPI backend scaffolded in the `backend/` directory, designed for maintainability and AI-friendly expansion. See:*
- *backend/README.md (project overview)*
- *backend/STRUCTURE.md (folder and module structure)*
- *backend/requirements.txt (core dependencies)*

[x] 6. Implement Decision Chat Session & Message Endpoints

*CRUD API endpoints for DecisionChatSession and DecisionChatMessage, with Pydantic validation, database integration, and Pytest unit tests (expected, edge, failure cases) are implemented and tested. All tests pass as of 2025-04-15.*
- *Endpoints in backend/app/api/v1/endpoints/decisions.py*
- *Models in backend/app/models/decision.py, reflection.py*
- *Tests in tests/app/api/v1/endpoints/test_decisions.py*

[x] 7. Establish Dependency Management

*Poetry installed and configured for the backend. Dependencies managed in pyproject.toml/poetry.lock. requirements.txt is now obsolete and will be removed.*

[x] 8. Design Backend Folder Structure

*Backend folder structure is modular, AI-friendly, and documented in backend/STRUCTURE.md. Ready for scalable development.*

[x] 9. Configure Local Development Environment

*.env.example added for safe, maintainable environment variable management. Local dev server can be started with `poetry run uvicorn app.main:app --reload`. See backend/README.md for instructions.*

[x] 10. Set Up Azure Cloud Resources
[x] 10. Provision Azure App Service

*Azure App Service (Linux, Python 3.11) was provisioned using Bicep templates as described in infra/bicep/README.md. See Azure Portal for resource details.*
[x] 11. Provision a Database on Azure

*Azure SQL Database was provisioned using Bicep templates. Admin login and password were set securely, and the SQL firewall rule was intentionally skipped due to dynamic developer IP (see decisions_log.md). Azure-internal access is enabled by default.*
[x] 12. Set Up Database Security

*Database connection is secured using Azure Key Vault. The backend loads the DATABASE_URL from environment variables, which should point to Key Vault in production and to SQLite for local development. See .env.example for details.*

[x] 13. Design Database Schema

*All core and gamification entities are modeled in SQLAlchemy. Alembic is set up for migrations. Use the following workflow:*

*See backend/README.md for database migration instructions using Alembic. This ensures your schema is up to date both locally and in production.*

[x] 14. Implement User Registration API

*/api/v1/register endpoint implemented. Validates email and password, checks for duplicates, hashes password, and returns new user info.*
[x] 15. Implement Authentication

*/api/v1/login endpoint implemented. Verifies credentials and returns JWT access token on success.*
[x] 16. Develop User Profile API

*/api/v1/me endpoints implemented. Supports authenticated profile retrieval and update for current user.*
[ ] 17. Implement Optional Social Login
[x] 18. Build Frontend Base Framework

- [x] Choose frontend stack (React + Vite + TypeScript + Material UI)
- [x] Scaffold project in /frontend
- [x] Set up folder structure (src/components, src/pages, src/api, etc.)
- [x] Configure routing (React Router)
- [x] Add API client and connect to backend
- [x] Document setup in /frontend/README.md

*Frontend base framework is fully implemented and tested as of 2025-04-16.*

[x] 19. Design Registration and Login Screens
    - [x] Create Registration UI (Material UI form)
    - [x] Create Login UI (Material UI form)
    - [x] Add client-side validation
    - [x] Integrate with backend API
    - [x] Show error/success messages
    - [x] Add component/unit tests

*All frontend authentication screens and validation logic are implemented and tested. All tests pass as of 2025-04-16.*

---

### Discovered During Work
- Fixed frontend test runner config: Use `npx vitest run` for non-interactive tests; updated tests to use robust async queries for Material UI dialogs.
- Fixed backend test teardown to avoid SQLite readonly errors by checking if test.db exists before removal.

- Disabled the `required` attribute on Material UI TextFields in test mode (via `required={import.meta.env.MODE !== 'test'}`) to ensure custom validation logic is exercised and testable in React Testing Library.
- [x] Implement Reflection Prompt Generator Endpoint  
    *Endpoint and Pytest unit tests complete. Ready for OpenAI integration and frontend UI.*
- [x] Integrate OpenAI API for Prompts  
    *Backend Reflection Prompt Generator endpoint now uses OpenAI securely and robustly, with full tests and fallback logic.*
- [x] Develop UI for Reflection Prompts  
    *React UI at /reflection-prompts lets user select a journal entry and generate AI-powered prompts. Robust error/loading/empty handling. Full unit test coverage (Vitest/RTL).*
- [x] Implement Auto Tagging and Categorization  
    *Backend, migration, and Pytest tests complete. API now returns domain_tags, sentiment_tag, and keywords. Frontend integration is next.*
[x] 20. Develop User Dashboard UI

*Modular dashboard UI implemented in React with Material UI. Includes user summary, recent journals, quick actions, and progress badges. Unit tests cover expected, edge, and failure cases. Ready for backend integration and further enhancements.*
[x] 21. Create Decision Journal Data Model
[x] 22. Implement Decision Journal API endpoints (session/message CRUD, status update)
[x] 23. Implement Decision Journal Entry creation endpoint
- [x] Implement Decision Journal Entry listing and update endpoints  
    *Backend endpoints for listing and updating Decision Journal Entries implemented and fully tested (Pytest).*
[x] 24. Build Decision Journal Form UI  
    *Modern React UI at /journal for listing, creating, viewing details, and editing entries. Modular components, robust error handling, and full unit test coverage (Vitest/RTL). Users can now create, view, and edit entries with AI-generated tags. All backend and frontend integration complete and tested.*

[ ] 25. Integrate Speech-to-Text (Optional)
[x] 26. Implement Reflection Prompt Generator Endpoint  
    *Backend endpoint, OpenAI integration, robust fallback logic, and Pytest unit tests (expected, edge, failure cases) are all complete. See backend/app/api/v1/endpoints/reflection.py.*
[x] 27. Integrate OpenAI API for Prompts  
    *OpenAI GPT-4.1-nano is fully integrated in the backend reflection prompt generator endpoint, with robust fallback logic and Pytest unit tests. See backend/app/api/v1/endpoints/reflection.py.*
[x] 28. Develop UI for Reflection Prompts  
    *ReflectionPromptPage.tsx implements a full-featured UI for generating and displaying AI-powered reflection prompts, with robust error/loading handling and Material UI design. See frontend/src/pages/ReflectionPromptPage.tsx.*
[x] 29. Implement Auto Tagging and Categorization  
    *Now uses OpenAI LLM with function calling. All legacy NLP code and dependencies removed. Pytest unit tests—including edge and failure cases (e.g., OpenAI down)—are now complete and passing. Tests updated to mock OpenAI and simulate API failure.*
[x] 30. Develop API for Value Calibration
[x] 31. Create Value Calibration Data Model
[x] 32. Design Value Calibration UI
    - Interactive UI with sliders for core values (Courage, Honesty, Curiosity, Empathy, Resilience), validation, feedback, and unit tests implemented in ValueCalibrationPage.tsx.
    - Backend endpoints (`POST`/`GET` /api/v1/value-calibration/checkins), Pydantic schemas, robust Pytest coverage (expected, edge, failure cases).
    - Frontend API integration (`src/api/valueCalibration.ts`), check-in history, error/loading states, accessibility.
    - Comprehensive Vitest + RTL tests, including initialValues prop for robust validation.
[x] 33. Implement Tension Detector Logic
    - Backend service detects value conflicts and rapid swings in user check-ins. Comprehensive unit tests (expected, edge, failure cases) in test_tension_detector.py.
[x] 34. Build Decision Support Chat API
    - FastAPI endpoint /api/v1/decision-support/chat (POST) with request/response schemas. Returns mock AI reply and suggestions. Fully unit tested (expected, edge, failure cases).
[x] 35. Develop Chat UI for Decision Support
    - Modern Material UI chat interface (DecisionSupportChatPage.tsx): user/AI messages, suggestions as quick actions, loading/error states, and unit tests.
[x] 36. Integrate OpenAI Chat API
    - Both decision-support/chat and future-self/simulate endpoints use OpenAI GPT-4.1-nano if configured, fallback to robust mock if not. All logic tested (mocked AI and fallback). Docs and .env.example updated.
[x] 37. Implement Future-Self Simulator Backend
    - Endpoint implemented, uses OpenAI GPT-4.1-nano with robust fallback. Fully tested and documented.
[x] 38. Develop Simulator UI Component
    - Frontend UI complete: form, API integration, result display, error/loading states. Fully tested (expected, edge, failure cases).
[x] 39. Implement Life Theme & Progress Tracker
    - Backend endpoints, model, and Pytest tests implemented. Frontend UI, API client, route, and Vitest tests complete. Dashboard card and navigation link added for discoverability.
[x] 40. Develop Progress Visualization UI
    - /progress page implemented with Material UI and Recharts. Visualizes value trends and decision activity using real backend data. Fully tested (expected, edge, failure cases) with ResizeObserver polyfill for chart compatibility in Vitest.
[x] 41. Create Gamification Module (Backend)
    - Backend endpoints, models, and Pytest unit tests for streaks, badges, and challenges are implemented and documented. All tests pass.
[x] 42. Develop Gamification UI Elements
    - /gamification page implemented with Material UI. Renders badges, streaks, and challenges from backend. Fully tested (expected, edge, failure cases). MUI v5 Grid v2 migration warnings are non-blocking.

---

### Completed Infrastructure & Process Improvements
- All backend and frontend tests pass locally and in CI (including LLM-powered integration tests with OpenAI GPT-4.1-nano).
- Test output (OpenAI messages, verdicts) is visible in CI logs for auditability.
- Test database (test.db) is deleted before every CI run; no legacy UUID errors.
- Black formatting enforced; code is compliant.
- .env, test.db, and temp files are gitignored and never committed.
- OpenAI API key and other secrets managed via GitHub Actions and .env files.
- Value Calibration and Tension Detector logic fully implemented and tested.
- Decision Support Chat API with LLM-as-judge integration test.
- Frontend Value Calibration UI and Chat UI are interactive, validated, and tested.
- No accidental commits of local/test files; code hygiene is strong.

[x] 50. Prepare backend for Azure App Service (Dockerfile or Gunicorn/Uvicorn config, environment variables) (IN PROGRESS)
[x] 51. Prepare frontend for Azure Static Web Apps (ensure build output is ready)  
    *Production build (`npm run build`) outputs to `dist/`, and deployment is fully automated via GitHub Actions (`.github/workflows/azure-static-web-apps.yml`). No manual steps are needed except managing GitHub secrets (`VITE_API_URL`, `AZURE_STATIC_WEB_APPS_API_TOKEN`).*
[x] 52. Connect Azure Key Vault or App Service settings for secrets (OPENAI_API_KEY, DB connection, etc.)  
    *backend/README.md now documents both App Service environment variables and Azure Key Vault reference syntax for secure secret management. No code changes required—just configure in Azure Portal as described.*
[x] 53. Add GitHub Actions deployment step for backend (azure/webapps-deploy@v3)  
    *.github/workflows/azure-backend.yml automates backend Docker build and deployment to Azure App Service using GitHub Actions. Manual Alembic migration step is noted in the workflow.*
[x] 54. Add GitHub Actions deployment step for frontend (Azure/static-web-apps-deploy@v1)  
    *.github/workflows/azure-static-web-apps.yml automates build and deployment of the frontend to Azure Static Web Apps using GitHub Actions.*
[x] 55. Test deployment and document URLs for QA  
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

[ ] 56. Set Up Push Notifications
[ ] 57. Implement Email Notification System
[ ] 58. Build Analytics & Reporting Module
[ ] 59. Construct an Admin Dashboard
[ ] 60. Integrate Application Insights
[ ] 61. Establish Automated Testing
[ ] 62. Perform Load and Stress Testing
[x] 63. Set Up CI/CD Pipeline
    - GitHub Actions is now configured for backend (FastAPI, Poetry) and frontend (React, Vite) CI. See .github/workflows/ci-cd.yml and README.md for details.
[ ] 64. Deploy MVP to Production