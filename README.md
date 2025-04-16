# Phronesis

![CI/CD Status](https://github.com/GenAI-Gurus/phronesis/actions/workflows/ci-cd.yml/badge.svg)

---

**CI/CD Pipeline**

Phronesis uses [GitHub Actions](https://github.com/features/actions) for continuous integration and deployment. Both backend and frontend pipelines are now fully passing as of 2025-04-16:

- **Backend**: Installs with Poetry, checks formatting with Black, and runs all `pytest` tests with `PYTHONPATH=.`, ensuring all modules are discoverable. Code must be formatted with Black and all tests must pass.
- **Frontend**: Installs Node dependencies, lints with ESLint, runs Vitest tests, and builds the app with Vite. Make sure `frontend/index.html` and all required source files are tracked by git.
- **Deployment**: Azure deployment steps can be added by maintainers (see workflow file for details).

**Troubleshooting:**
- If the backend fails with import errors, ensure `PYTHONPATH=.` is set for tests and all modules are in the correct location.
- If the frontend build fails, check that `index.html` exists and is committed, and that all page/component files are present.
- If Black fails, run `poetry run black app tests` and commit the changes.

See `.github/workflows/ci-cd.yml` for the full pipeline configuration and troubleshooting examples.

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
