# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within CrowdSense, please do not file a public issue. Instead, report it privately via GitHub Security Advisories:
[https://github.com/DevJiya/CrowdSense/security/advisories](https://github.com/DevJiya/CrowdSense/security/advisories)

We aim to respond to all security reports within 48 hours.

## Implemented Security Controls

CrowdSense is built with a defense-in-depth approach, implementing the following security measures:

1. **Helmet CSP**: Strict Content Security Policy preventing XSS and injection attacks.
2. **CORS Enforcement**: Explicit whitelist, rejecting all wildcard or untrusted origins.
3. **Rate Limiting**: 
   - Global limit: 100 requests per 15 minutes.
   - AI Engine limit: 20 requests per minute to prevent abuse.
4. **Input Validation**: Strict `express-validator` checks and sanitization on all POST endpoints.
5. **Firebase Security Rules**: All database reads/writes are authenticated and validated at the edge.
6. **Secret Management**: No API keys in source code. All secrets loaded via environment variables or Google Secret Manager.
7. **Build Hygiene**: `.gcloudignore` and `.dockerignore` ensure no local secrets leak into the Cloud Run container.
