# Phronesis

![CI Status](https://github.com/GenAI-Gurus/phronesis/actions/workflows/ci.yml/badge.svg)

---

**CI/CD Workflows**

Phronesis uses [GitHub Actions](https://github.com/features/actions) for continuous integration and deployment. As of 2025-04-16, all pipelines are fully passing:

- **ci.yml**: Runs lint, tests, and build for backend (FastAPI) and frontend (React/Vite) on all pushes and pull requests to main. This workflow does NOT deploy.
- **azure-backend.yml**: Handles backend deployment to Azure App Service (Docker) after CI passes, triggered only on main branch or manual dispatch. Uses production deployment secrets.

**Workflow Separation**

For clarity and maintainability, our CI/CD workflows are separated into two distinct files:

* `.github/workflows/ci.yml`: Responsible for continuous integration tasks such as linting, testing, and building.
* `.github/workflows/azure-backend.yml`: Handles deployment to Azure App Service.

**Troubleshooting:**
- If the backend fails with import errors, ensure `PYTHONPATH=.` is set for tests and all modules are in the correct location.
- If the frontend build fails, check that `index.html` exists and is committed, and that all page/component files are present.
- If Black fails, run `poetry run black app tests` and commit the changes.

See `.github/workflows/ci.yml` for the CI pipeline and `.github/workflows/azure-backend.yml` for deployment configuration and troubleshooting examples.

---

Phronesis is an open-source platform for mindful decision-making, reflection, and value-driven personal growth. It combines journaling, AI-powered prompts, and gamification to help users make better decisions over time.

## Key Features
- Conversational decision journaling (chat-based, not forms)
- AI-generated reflection and follow-up prompts
- Value calibration and progress tracking
- Gamification: streaks, badges, challenges
- Open-source: advanced users can self-host, contribute, or extend
- Hosted option: easy onboarding for non-technical users

## Community
This project is maintained by the GenAI Gurus community. Contributions, bug reports, and feature suggestions are welcome!

## License
See [LICENSE](LICENSE) for details.
