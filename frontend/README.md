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

### 3. Build for Production (Azure Static Web Apps)
```bash
npm run build
```
- The production build output will be in the `dist/` folder.
- This folder is what Azure Static Web Apps expects for deployment.
- If you see warnings about large chunks or "use client" directives from Material UI, these are non-blocking and safe to ignore for deployment.

### 4. Deploy to Azure Static Web Apps
- Push to the configured branch (usually `main`) to trigger the GitHub Actions deployment workflow.
- Ensure all environment variables (e.g., `VITE_API_URL`) are set as GitHub secrets and passed in the workflow's `env:` block (see below).

## Setup & Development

### ⚠️ Environment Variables for Production (Vite)
- When deploying with Azure Static Web Apps **via GitHub Actions**, all Vite environment variables (e.g., `VITE_API_URL`) must be set as **GitHub secrets** and passed via the `env:` block in the workflow.
- **Do not rely on Azure portal environment variables**—they are not available during GitHub Actions builds.
- Example:
  ```yaml
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
  ```
- For local development, you can still use a `.env` file.

## Setup

### Prerequisites
...

### Installing dependencies
- Run `npm install` to install core dependencies.
- Run `npm install react-markdown` to add markdown support for chat UI.

## Project Structure

See [STRUCTURE.md](./STRUCTURE.md) for directory and modularity details.

For full architecture and requirements, see [../specification.md](../specification.md).

## Environment Variables

- **Local development:**
  - Create a `.env` file and set your backend API URL:
    ```env
    VITE_API_URL=http://localhost:8000/api/v1
    ```
- **Production (Azure Static Web Apps):**
  - Set `VITE_API_URL` as a GitHub secret.
  - Reference it in your GitHub Actions workflow YAML:
    ```yaml
    env:
      VITE_API_URL: ${{ secrets.VITE_API_URL }}
    ```

## Linting & Formatting

- ESLint and Prettier recommended for code quality and consistency.

## CI/CD & Troubleshooting

- The frontend pipeline (GitHub Actions) now passes: it installs dependencies, lints, runs Vitest tests, builds with Vite, and runs Playwright E2E tests.
- **Playwright HTML reports** are uploaded as CI artifacts after every run. Download the `playwright-report` artifact from the GitHub Actions UI to review E2E test results, screenshots, and logs (including AI/manual review outputs for [A+M]/[AI] tests).
- **index.html** must be present and tracked by git, or the build will fail.
- If you add new pages/components, ensure all files are committed or the build/test may fail in CI.
- If you see a "Could not resolve entry module 'index.html'" error, check that `frontend/index.html` exists and is tracked.
- See the main project README for more CI/CD troubleshooting tips.
- **Note:** React 18 downgrade for compatibility with UI libraries (Chatscope, MUI, etc.)
- **Chat UI:** The `/chat` route is now available for users and system tests. Chat UI is built with `@chatscope/chat-ui-kit-react` and uses a `contenteditable` input, not a standard textarea.
- **System Tests:** Frontend tests for chat UI are skipped in CI due to jsdom limitations; E2E/system tests provide coverage. To run system tests for chat, use the following selectors: `[data-testid="chat-input"] [contenteditable="true"]` and `.cs-message--incoming` for AI messages.
- **Troubleshooting:** If no AI reply is shown, check backend API and OpenAI config.

## Demo & Placeholder Pages

- The app includes placeholder pages for New Decision Journal, Value Calibration, Reflection, and Challenges.
- These are accessible from the Dashboard quick actions and via direct URLs:
  - `/journal/new`
  - `/value-calibration`
  - `/reflection`
  - `/challenges`
- These pages are for development/demo purposes only and help preview the intended app navigation and UI/UX.
- **Cleanup Note:** Remove or replace these placeholders with real features before production release.

## Next Steps
- Implement routing and connect to backend API.
- Build out registration, login, and dashboard screens.
- See progress.md for detailed task tracking.
