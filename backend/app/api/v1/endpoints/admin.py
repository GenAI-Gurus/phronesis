"""
Admin endpoints for Phronesis backend (protected, internal use only).
"""
from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
import subprocess

"""
Admin endpoints for Phronesis backend (internal use only).

- /api/v1/admin/migrate: Trigger Alembic DB migrations (upgrade head) in the deployed container.
- Protected by MIGRATE_SECRET (must be sent in x-migrate-secret header).
- Only callable by CI/CD or trusted operators.
- Returns full stdout, stderr, and return code for debuggability.
- See backend/README.md and WORKFLOWS.md for usage.
"""
"""
Admin endpoints for Phronesis backend (internal use only).

- /api/v1/admin/migrate: Trigger Alembic DB migrations (upgrade head) in the deployed container.
- Protected by MIGRATE_SECRET (must be sent in x-migrate-secret header).
- Only callable by CI/CD or trusted operators.
- Returns full stdout, stderr, and return code for debuggability.
- See backend/README.md and WORKFLOWS.md for usage.
"""
import os

router = APIRouter()


@router.post("/admin/migrate", tags=["admin"])
def run_migration(request: Request):
    """
    Run Alembic migrations (upgrade head) if secret is valid.
    Returns stdout, stderr, and return code for debuggability.
    """
    secret = request.headers.get("x-migrate-secret")
    expected_secret = os.environ.get("MIGRATE_SECRET")
    if not expected_secret or not secret or secret != expected_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized"
        )
    try:
        result = subprocess.run(
            ["poetry", "run", "alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            check=False,
        )
        return JSONResponse(
            status_code=200 if result.returncode == 0 else 500,
            content={
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode,
                "message": "Migration complete"
                if result.returncode == 0
                else "Migration failed",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
