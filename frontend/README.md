# Phronesis Frontend

A modern, modular frontend for the Phronesis platform, built with React, Vite, TypeScript, and Material UI.

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

## Project Structure

- `src/components/` – Reusable UI components
- `src/pages/` – Route-level pages (Login, Register, Dashboard, etc.)
- `src/api/` – API client (Axios) and backend integration
- `src/routes/` – React Router config

## Environment Variables

- Configure the backend API URL in `.env`:
  ```env
  VITE_API_URL=http://localhost:8000/api/v1
  ```

## Linting & Formatting

- ESLint and Prettier recommended for code quality and consistency.

## Next Steps
- Implement routing and connect to backend API.
- Build out registration, login, and dashboard screens.
- See progress.md for detailed task tracking.
