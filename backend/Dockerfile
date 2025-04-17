# Dockerfile for Azure App Service - FastAPI + Poetry
# ---------------------------------------------------
# - Expects all backend code and pyproject.toml in /app
# - Set secrets (OPENAI_API_KEY, DB URI, etc.) via Azure App Service env vars
# - For local dev: docker build -t phronesis-backend . && docker run -p 8000:8000 phronesis-backend

FROM python:3.11-slim

# Install system dependencies and ODBC drivers for pyodbc/MS SQL
RUN apt-get update && \
    apt-get install -y build-essential curl gcc g++ gnupg2 unixodbc-dev && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/$(. /etc/os-release; echo $VERSION_ID)/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql18 && \
    rm -rf /var/lib/apt/lists/*

# Install Poetry
ENV POETRY_VERSION=1.7.1
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# Set workdir
WORKDIR /app

# Copy only poetry files first for cache efficiency
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --only main

# Copy rest of the app code
COPY . .

# Expose port for Azure
EXPOSE 8000

# Entrypoint for production
CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--timeout", "120"]
