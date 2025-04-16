# Phronesis

![CI/CD Status](https://github.com/GenAI-Gurus/phronesis/actions/workflows/ci-cd.yml/badge.svg)

---

**CI/CD Pipeline**

Phronesis uses [GitHub Actions](https://github.com/features/actions) for continuous integration and deployment:

- **Backend**: Installs with Poetry, checks formatting with Black, and runs all `pytest` tests.
- **Frontend**: Installs Node dependencies, lints with ESLint, runs Vitest tests, and builds the app.
- **Deployment**: Azure deployment steps can be added by maintainers (see workflow file for details).

See `.github/workflows/ci-cd.yml` for the full pipeline configuration.

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
