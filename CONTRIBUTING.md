# Contributing to CrowdSense AI

Thank you for your interest in contributing to CrowdSense AI! To maintain the high quality and consistency of this project, please follow these guidelines.

## 🌿 Branch Naming Convention
- `feat/description` - For new features
- `fix/description` - For bug fixes
- `docs/description` - For documentation changes
- `test/description` - For adding or updating tests
- `refactor/description` - For code refactoring
- `chore/description` - For maintenance tasks

## 💬 Commit Message Format
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat: ...` - New feature
- `fix: ...` - Bug fix
- `docs: ...` - Documentation
- `test: ...` - Tests
- `refactor: ...` - Refactoring
- `chore: ...` - Maintenance

## 🚀 Pull Request Checklist
Before submitting a PR, ensure:
1. [ ] **Linting Passes**: Run `npm run lint` and fix all errors.
2. [ ] **Tests Pass**: Run `npm run test` and ensure 100% pass rate.
3. [ ] **Coverage Maintained**: Ensure coverage does not drop below the enforced thresholds (75%).
4. [ ] **Documentation Updated**: Update README.md or JSDoc if necessary.
5. [ ] **Branch is Clean**: Rebase or merge from `main` to ensure no conflicts.

## 🛠️ Local Development
1. Clone the repo
2. Run `npm install`
3. Setup `.env` using `.env.example`
4. Run `npm run dev` to start the development server
