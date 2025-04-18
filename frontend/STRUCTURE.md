# Modular React Frontend Structure for Phronesis

frontend/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html                # Main HTML entry point
├── .env.example              # Example environment variables
├── src/
│   ├── main.tsx              # React entrypoint
│   ├── api/                  # API clients and backend integration
│   │   ├── client.ts         # Axios instance/config
│   │   └── ...
│   ├── components/           # Reusable UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   └── ...
│   ├── pages/                # Route-level pages (Login, Register, Dashboard, etc.)
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── NewDecisionPage.tsx
│   │   ├── ValueCalibrationPage.tsx
│   │   ├── ReflectionPage.tsx
│   │   ├── ChallengesPage.tsx
│   │   └── ...
│   ├── routes/               # React Router configuration
│   │   └── AppRouter.tsx
│   └── ...                   # Other feature or utility folders
├── tests/                    # Frontend test files (mirrors src/ structure)
└── ...

---

## Directory Overview

- `src/components/` – Shared and feature-specific UI components. Place generic, reusable pieces here. Subfolders (like `dashboard/`) group related widgets.
- `src/pages/` – Route-level React components. Each file represents a page in the app (e.g., Login, Register, Dashboard, Journal, etc.).
- `src/api/` – API client logic, typically using Axios. Add new files here for each backend integration.
- `src/routes/` – Routing logic using React Router. Centralizes route definitions and navigation.
- `tests/` – Unit and integration tests for components, pages, and utilities. Should mirror the `src/` structure as much as possible.

## Guidelines

- **Components:**
  - Use functional components and hooks.
  - Name files and components in PascalCase (e.g., `UserCard.tsx`).
  - Place shared UI in `components/` and page-specific UI in `pages/`.
- **Pages & Routing:**
  - Each page should be a self-contained component in `pages/`.
  - Add new routes in `routes/AppRouter.tsx`.
- **API Integration:**
  - Use `src/api/client.ts` for the Axios instance.
  - Add new API modules as needed for new endpoints/features.
- **Testing:**
  - Place test files in `tests/`, mirroring the structure of `src/` (e.g., `tests/components/`, `tests/pages/`).
  - Use Vitest and React Testing Library for unit and integration tests.
- **Styling:**
  - Use Material UI as the primary component library.
  - Use the provided theme and avoid inline styles where possible.
- **State Management:**
  - Prefer React Context or hooks for local state. If global state is needed, document the approach in this file.
- **Environment Variables:**
  - Configure backend API URLs and other secrets in `.env` files, never commit real secrets.

## Example: Adding a New Feature

1. Create a new page in `src/pages/` (e.g., `NewFeaturePage.tsx`).
2. Add any reusable widgets to `src/components/`.
3. Add API logic to `src/api/` if needed.
4. Register the new route in `src/routes/AppRouter.tsx`.
5. Add tests in `tests/pages/` or `tests/components/` as appropriate.

---

# Reason:
This document provides a clear, maintainable overview of the frontend structure, mirroring the backend's STRUCTURE.md. It helps onboard new contributors and ensures consistency across the codebase.
