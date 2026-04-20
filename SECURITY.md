# Security Policy (CrowdSense AI)

CrowdSense AI is built with a **Security-First** mindset. As a tactical intelligence platform, protecting the integrity of our data grid is our highest priority.

## 🛡️ Security Implementations

### 1. Network & Protocol Security
- **HTTP Hardening**: We use `helmet.js` to enforce strict HTTP headers, including:
    - `Content-Security-Policy`: Strictly whitelisting Google and Firebase endpoints.
    - `Strict-Transport-Security`: Enforcing HTTPS.
    - `X-Content-Type-Options`: Preventing MIME-sniffing.
    - `X-Frame-Options`: Protecting against Clickjacking.
- **Rate Limiting**: Tiered rate limiting protects our infrastructure:
    - **Global**: 100 requests per 15 minutes.
    - **Tactical AI**: 1 query every 2 seconds to prevent abuse and API cost spikes.

### 2. Application Layer Security
- **Input Sanitization**: All user-provided data is sanitized and validated via `express-validator` and `DOMPurify` (frontend).
- **No Unsafe Eval**: We strictly block `eval()` and other unsafe script execution methods.
- **CORS Whitelisting**: Only authorized origins are allowed to interact with the backend API.

### 3. Google Cloud & Data Security
- **Identity Protection**: Sensitive routes are protected by **Firebase Admin SDK** token verification.
- **Principle of Least Privilege**: The Cloud Run service account is restricted to only the necessary BigQuery, RTDB, and Storage permissions.
- **Forensic Auditing**: Every AI-driven tactical decision is logged to **Google Cloud BigQuery** for post-incident review.

## 🚔 Responsible Implementation
- **AI Logic Isolation**: Gemini 2.5 Flash is never allowed to run logic or make routing decisions. All tactical math is handled by our deterministic backend engine to prevent AI hallucinations in critical scenarios.
- **Privacy**: No personally identifiable information (PII) is stored. All telemetry is anonymized to stadium-sector IDs.

## 🐛 Vulnerability Reporting
If you discover a security vulnerability within this project, please send an email to security@crowdsense.app or open a private issue on GitHub. We take all reports seriously and will respond within 24 hours.
