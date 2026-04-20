# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-20

### Added
- **Core Engine**: Dijkstra-based crowd-aware pathfinding with dynamic risk weighting.
- **AI Integration**: Google Gemini 1.5 Flash for real-time tactical narration.
- **Cloud Infrastructure**: Firebase Realtime Database for telemetry and BigQuery for analytics.
- **Security**: Hardened headers (Helmet), tiered rate-limiting, and Joi-based schema validation.
- **Hardened Testing**: 75% coverage enforced via Jest with full E2E and unit test suites.
- **Production Logging**: Structured JSON logging via Winston with request tracing.
- **GCP Ready**: Dockerized setup with Cloud Build and Cloud Run configurations.
- **Documentation**: Comprehensive JSDoc, Architecture, Testing, and Security guides.

### Changed
- Refactored legacy `express-validator` to high-fidelity `Joi` schemas.
- Migrated all `console` calls to a centralized Winston logger.
- Pinned all dependencies to exact versions for deterministic builds.

### Fixed
- Resolved Node-JSDOM environment conflicts for browser-centric services.
- Fixed rate-limiting bottlenecks in automated test environments.
