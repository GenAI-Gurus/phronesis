# Modular FastAPI backend structure for Phronesis

backend/
├── README.md
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI entrypoint
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/ # Each feature in its own module
│   │   │   │   ├── __init__.py
│   │   │   │   ├── users.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── decisions.py
│   │   │   │   ├── reflection.py
│   │   │   │   ├── value_calibration.py
│   │   │   │   ├── gamification.py
│   │   │   │   └── ...
│   ├── core/              # Core logic, config, security
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── security.py
│   │   └── ai.py
│   ├── models/            # Pydantic schemas & ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── decision.py
│   │   ├── reflection.py
│   │   ├── value_calibration.py
│   │   ├── gamification.py
│   │   └── ...
│   ├── db/                # Database setup & CRUD
│   │   ├── __init__.py
│   │   ├── session.py
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── decision.py
│   │   ├── reflection.py
│   │   ├── value_calibration.py
│   │   ├── gamification.py
│   │   └── ...
│   ├── services/          # Business logic, integrations
│   │   ├── __init__.py
│   │   ├── ai_service.py
│   │   ├── notification_service.py
│   │   └── ...
│   └── utils/             # Utility functions
│       ├── __init__.py
│       └── ...
└── tests/
    ├── __init__.py
    └── ...
