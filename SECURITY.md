# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Yes             |
| 1.x.x   | ❌ No              |

## Reporting a Vulnerability

We take the security of CrowdSense AI seriously. If you believe you have found a security vulnerability, please report it using the **GitHub Security Advisory** system:

👉 [Report a Vulnerability](https://github.com/DevJiya/CrowdSense/security/advisories/new)

Please do not report security vulnerabilities via public GitHub issues.

## Implemented Security Controls

CrowdSense AI implements several production-grade security layers:

### 1. HTTP Security Headers (Helmet)
We use the `helmet` middleware to set critical security headers:
- **Content Security Policy (CSP)**: Restricted to trusted origins and inline styles for Tailwind.
- **XSS Filter**: Enabled to prevent cross-site scripting.
- **No Sniff**: Prevents browsers from MIME-sniffing a response away from the declared content-type.
- **Referrer Policy**: Set to `same-origin`.
- **Hide Powered By**: Removes the `X-Powered-By` header to hide server technology.

### 2. CORS (Cross-Origin Resource Sharing)
- Explicit **whitelist-only** policy.
- Wildcards (`*`) are strictly forbidden.
- Restricted to local development ports and the production Cloud Run URL.

### 3. Rate Limiting
- **Global Limiter**: 100 requests per 15 minutes per IP.
- **AI Command Limiter**: 1 request per 2 seconds per IP to prevent LLM API abuse and cost spikes.

### 4. Input Validation
- Every `POST` route body is validated and sanitized using `express-validator`.
- Strict type checking and length restrictions on all incoming tactical data.

### 5. Secrets Management
- No API keys or credentials are stored in the source code.
- All secrets are injected via environment variables at runtime.
- `.gcloudignore` prevents accidental upload of `.env` files during deployment.

### 6. Firebase Security
- `firebase.rules` enforce mandatory authentication for all Firestore data access.
