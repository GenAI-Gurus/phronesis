# Phronesis Backend

A modular, expandable, and AI-friendly backend for the Phronesis platform, built with FastAPI and structured for maintainability and future growth.

---

## Decision Chat Endpoints (MVP)\n\n## Future-Self Simulator API

## Gamification API

## OpenAI Integration (Decision Support & Future-Self Simulator)

## Future-Self Simulator (Backend & UI)

## Life Theme API

- **Endpoints:**
  - `GET /api/v1/life-theme` — Get the current user's life theme (most recent)
  - `POST /api/v1/life-theme` — Set a new life theme (creates new, does not overwrite previous)
- **Request Example:**
  ```json
  { "theme_text": "Growth through challenge" }
  ```
- **Response Example:**
  ```json
  {
    "id": "...",
    "theme_text": "Growth through challenge",
    "created_at": "2025-04-19T22:00:00Z",
    "updated_at": "2025-04-19T22:00:00Z"
  }
  ```
- **Auth:** Required (JWT Bearer)
- **Testing:** Pytest covers expected, edge, and failure cases
- **Docs:** See `specification.md` for data model and UX


- **Endpoint:** `POST /api/v1/future-self/simulate`
- **Purpose:** Simulate a user's likely future self based on decision context, values, and time horizon. Uses OpenAI GPT-4.1-nano with fallback logic.
- **Frontend:** `/future-self` page (React/Material UI)
  - Form for context, values, time horizon
  - Calls backend, displays AI projection and suggestions
  - Handles loading, error, and empty states
- **Testing:**
  - Backend: Pytest with OpenAI mocked for both AI and fallback
  - Frontend: Vitest + RTL for all UI/UX logic
- **Docs:** See `specification.md` for request/response schema and UX details


- **Endpoints:**
  - `/api/v1/decision-support/chat` (POST)
  - `/api/v1/future-self/simulate` (POST)
- **AI Model:** OpenAI GPT-4.1-nano (configurable via `OPENAI_API_KEY`)
- **How it works:**
  - If `OPENAI_API_KEY` is set, requests are sent to OpenAI for AI-powered responses.
  - If the API key is missing or OpenAI is unavailable, endpoints return a robust mock response with fallback suggestions.
  - No request/response schema changes—frontend remains compatible.
- **Environment Variable:**
  - `OPENAI_API_KEY` (required for live AI)
- **Testing:**
  - Pytest unit tests mock OpenAI for both success and failure.
  - Tests verify both AI and fallback logic.
- **Security:**
  - API key is never hardcoded; always loaded from environment/config.
  - All endpoints require authentication.


- **GET /api/v1/gamification/streaks**
  - Returns current user streaks (e.g., check-in streaks)
  - **Response:**
    ```json
    [
      { "id": "...", "streak_count": 7, "last_checkin": "2025-04-19T12:00:00Z" }
    ]
    ```

- **GET /api/v1/gamification/badges**
  - Returns badges earned by the user
  - **Response:**
    ```json
    [
      { "id": "...", "name": "7-Day Streak", "description": "Check in 7 days in a row", "awarded_at": "2025-04-19T12:00:00Z" }
    ]
    ```

- **GET /api/v1/gamification/challenges**
  - Returns available and completed challenges for the user
  - **Response:**
    ```json
    [
      { "id": "...", "name": "First Reflection", "description": "Complete your first reflection", "is_active": true, "completed_at": null }
    ]
    ```

- **POST /api/v1/gamification/challenges/{challenge_id}/complete**
  - Mark a challenge as completed for the user
  - **Response:**
    ```json
    { "id": "...", "name": "First Reflection", "description": "Complete your first reflection", "is_active": true, "completed_at": "2025-04-19T12:00:00Z" }
    ```

**Summary:**
- Streaks are tracked for user check-ins or journal entries.
- Badges are awarded for milestones (e.g., 7-day streak, first reflection).
- Challenges can be completed and tracked per user.
- All endpoints require authentication.
- See `app/models/gamification.py` and `app/schemas/gamification.py` for data structures.
\n\n- **POST /api/v1/future-self/simulate**\n- **Auth:** Required (JWT Bearer)\n- **Purpose:** AI-powered simulation of user's likely "future self" based on a decision context, values, and optional time horizon.\n\n### Request Schema\n```json\n{\n  \"decision_context\": \"Should I move to a new city for a job opportunity?\",\n  \"values\": [\"growth\", \"security\"],\n  \"time_horizon\": \"2 years\"\n}\n```\n\n### Response Schema\n```json\n{\n  \"future_projection\": \"In two years, after moving to the new city, you have grown professionally and expanded your network. The transition was challenging at first, but you adapted and found new sources of security and fulfillment.\",\n  \"suggestions\": [\n    \"Research neighborhoods and cost of living.\",\n    \"Connect with local professional groups before moving.\",\n    \"Reflect on what you need to feel secure during transitions.\"\n  ],\n  \"ai_generated\": true\n}\n```\n\n- **Summary:** Simulate your “future self” based on a decision context and values.\n- **Description:** Uses AI to project a narrative of your likely future self given a specific decision, values, and optional time horizon.\n- **Tags:** [\"future-self\", \"simulation\", \"decision support\"]\n

- **Create Session:** `POST /api/v1/decisions/sessions` — `{ "title": string }` → `{ "id": UUID, ... }`
- **List Sessions:** `GET /api/v1/decisions/sessions`
- **Create Message:** `POST /api/v1/decisions/sessions/{session_id}/messages` — `{ "content": string, "sender": "user"|"ai" }` → `{ "id": UUID, ... }`
- **List Messages:** `GET /api/v1/decisions/sessions/{session_id}/messages`
- **Update Session:** `PATCH /api/v1/decisions/sessions/{session_id}`
- All endpoints require JWT authentication and return proper status codes (401, 404, 422).
- Full Pytest coverage: see `/backend/tests/app/api/v1/endpoints/test_decisions.py`.
- **For detailed test protocols, E2E coverage, and manual/AI-assisted testing guidance, see [TESTING.md](../TESTING.md).**

## Database Migrations

To apply schema changes, use Alembic migrations:

1. Make model changes in SQLAlchemy models.
2. Generate migration:
   ```bash
   poetry run alembic revision --autogenerate -m "Describe your change"
   ```
3. Apply migration locally:
   ```bash
   poetry run alembic upgrade head
   ```

### Production/Staging Migrations (CI/CD)
- **Never run migrations manually in production.**
- Use the protected `/api/v1/admin/migrate` endpoint, which is triggered via the "Manual DB Migration" GitHub Actions workflow.
- The endpoint is secured with a strong secret (`MIGRATE_SECRET`).
- The workflow POSTs to the endpoint, which runs `poetry run alembic upgrade head` in the deployed container and returns stdout/stderr/returncode for full debuggability.
- See [WORKFLOWS.md](../WORKFLOWS.md) for details and usage instructions.
- For troubleshooting, check the workflow logs and the Alembic output in the response.

### Production/Staging Migrations (CI/CD)
- **Never run migrations manually in production.**
- Use the protected `/api/v1/admin/migrate` endpoint, which is triggered via the "Manual DB Migration" GitHub Actions workflow.
- The endpoint is secured with a strong secret (`MIGRATE_SECRET`).
- The workflow POSTs to the endpoint, which runs `poetry run alembic upgrade head` in the deployed container and returns stdout/stderr/returncode for full debuggability.
- See [WORKFLOWS.md](../WORKFLOWS.md) for details and usage instructions.
- For troubleshooting, check the workflow logs and the Alembic output in the response.
- This ensures your schema is up to date both locally and in production.
- See `backend/.env.example` and `backend/alembic/` for configuration and migration scripts.
- Only generate migrations from the main branch and after verifying model changes.

---

## Deploying to Azure App Service (Docker)

1. **Build and Push Docker Image**
   - Azure App Service can build directly from your repo, or you can build/push to Azure Container Registry (ACR):
     ```sh
     docker build -t phronesis-backend .
     docker tag phronesis-backend <youracr>.azurecr.io/phronesis-backend:latest
     docker push <youracr>.azurecr.io/phronesis-backend:latest
     ```
2. **Configure App Service Secrets**
   - In Azure Portal → Your App Service → Configuration → Application settings:
     - Add environment variables for all secrets (e.g., `DATABASE_URL`, `OPENAI_API_KEY`, etc.).
     - Example:
       | Name              | Value (example)                       |
       |-------------------|---------------------------------------|
       | DATABASE_URL      | <Azure SQL connection string>          |
       | OPENAI_API_KEY    | <your-openai-key>                      |
   - These are available to your FastAPI app via `os.getenv()`.
   - **For production:**
     - You can reference secrets stored in Azure Key Vault using Key Vault Reference syntax:
       - Example value:
         ```
         @Microsoft.KeyVault(SecretUri=https://<your-keyvault-name>.vault.azure.net/secrets/OPENAI_API_KEY/<secret-guid>)
         ```
     - This keeps secrets centralized and never exposes them in code or CI logs.
   - See [Azure Key Vault References](https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references) for details.
   - **Never commit secrets to the repository.**
3. **Run Database Migrations**
   - Use the Azure Cloud Shell or a CI/CD step:
     ```sh
     poetry run alembic upgrade head
     ```
4. **Dockerfile and .dockerignore**
   - See `backend/Dockerfile` for the production build setup.
   - See `backend/.dockerignore` to keep Docker images clean and builds fast.

For more details, see Azure App Service [docs](https://learn.microsoft.com/en-us/azure/app-service/quickstart-custom-container?tabs=python&pivots=container-linux).
