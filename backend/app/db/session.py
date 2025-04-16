"""
Session management for SQLAlchemy with FastAPI dependency injection.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os

# Reason: Use DATABASE_URL from environment or fallback for local development
database_url = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(
    database_url,
    connect_args=(
        {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    ),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """
    FastAPI dependency that provides a SQLAlchemy session and ensures it is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
