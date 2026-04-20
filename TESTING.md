# CrowdSense AI — Testing Philosophy & Infrastructure

CrowdSense AI uses a multi-layered testing strategy to ensure the tactical reliability of the platform. Our suite is built on **Jest** and **Supertest**, with strict coverage gates enforced.

## 🧪 Test Structure
The test directory mirrors the `src/` directory for consistency:

- `tests/unit/`: Logic-only tests for services, utility functions, and middleware.
- `tests/integration/`: API route testing using Supertest, mocking external cloud services.
- `tests/e2e/`: Full lifecycle simulation of telemetry sync, routing, and analytics.

## 🚀 Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage report (thresholds: 80% branches, 85% others)
npm run test:coverage

# Continuous testing during development
npm run test:watch
```

## 🛠 Adding New Tests
1. **Filename**: Must end in `.test.js`.
2. **Location**: Place in the corresponding `tests/` subdirectory mirroring `src/`.
3. **Mocks**: All external services (Firebase, Gemini, BigQuery) are automatically mocked via `tests/setup.js`. Use `jest.spyOn` if you need to mock specific service failures.

## 📊 Coverage Gates
We enforce high-quality standards. The build will fail if coverage drops below:
- **Branches**: 80%
- **Functions**: 85%
- **Lines**: 85%
- **Statements**: 85%

## 🤖 Dijkstra Engine Requirements
All pathfinding logic must pass:
- Shortest path verification.
- Crowd-penalty avoidance (density weighting).
- Accessibility constraints (stairs bypass).
- Performance benchmarks (< 50ms for 50 nodes).
