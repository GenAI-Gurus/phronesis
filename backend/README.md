# Phronesis Backend

A modular, expandable, and AI-friendly backend for the Phronesis platform, built with FastAPI and structured for maintainability and future growth.

---

## Decision Chat Endpoints (MVP)

- **Create Session:** `POST /api/v1/decisions/sessions` — `{ "title": string }` → `{ "id": UUID, ... }`
- **List Sessions:** `GET /api/v1/decisions/sessions`
- **Create Message:** `POST /api/v1/decisions/sessions/{session_id}/messages` — `{ "content": string, "sender": "user"|"ai" }` → `{ "id": UUID, ... }`
- **List Messages:** `GET /api/v1/decisions/sessions/{session_id}/messages`
- **Update Session:** `PATCH /api/v1/decisions/sessions/{session_id}`
- All endpoints require JWT authentication and return proper status codes (401, 404, 422).
- Full Pytest coverage: see `/backend/tests/app/api/v1/endpoints/test_decisions.py`.

## Database Migrations (Alembic)

To keep your database schema in sync with your SQLAlchemy models, use Alembic migrations as follows:

### 1. Local Development (SQLite)
- Set `DATABASE_URL=sqlite:///./dev.db` in your `.env` file.
- Generate a new migration after changing models:
  ```sh
  poetry run alembic revision --autogenerate -m "Describe your change"
  ```

### 2. Production (Azure SQL)
- Set `DATABASE_URL` to your Azure SQL connection string (from Key Vault or Azure Portal).
- Apply all migrations to your cloud database:
  ```sh
  poetry run alembic upgrade head
  ```

### Notes
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
2. **Configure App Service**
   - Set environment variables (e.g., `DATABASE_URL`, `OPENAI_API_KEY`, etc.) in the Azure Portal (Configuration > Application settings).
   - Do NOT commit secrets; use Azure Key Vault or App Service settings.
3. **Run Database Migrations**
   - Use the Azure Cloud Shell or a CI/CD step:
     ```sh
     poetry run alembic upgrade head
     ```
4. **Dockerfile and .dockerignore**
   - See `backend/Dockerfile` for the production build setup.
   - See `backend/.dockerignore` to keep Docker images clean and builds fast.

For more details, see Azure App Service [docs](https://learn.microsoft.com/en-us/azure/app-service/quickstart-custom-container?tabs=python&pivots=container-linux).
