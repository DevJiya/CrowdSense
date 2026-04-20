# 🛰️ CrowdSense AI — Tactical Intel Grid
### *The Ultimate AI-Powered Crowd Dynamics & Security Coordination Platform*

[![Google Cloud Run](https://img.shields.io/badge/Deployed-Google_Cloud_Run-4285F4?logo=google-cloud&logoColor=white)](https://crowdsense.run.app)
[![Gemini 2.5](https://img.shields.io/badge/AI-Gemini_2.5_Flash-orange?logo=google-gemini)](https://ai.google.dev/)
[![Security](https://img.shields.io/badge/Security-Hardened-green?logo=dependabot)](https://github.com/DevJiya/CrowdSense)
[![Tests](https://img.shields.io/badge/Tests-200%2B_Cases-blueviolet?logo=jest)](/tests)

---

## 🏟️ 1. Chosen Vertical
**Smart Cities & Public Safety (Tactical Event Management)**
CrowdSense AI is an enterprise-grade tactical intelligence layer designed to monitor, predict, and mitigate crowd congestion and security threats at large-scale venues. It transforms raw sensor data into actionable intelligence for security operators and venue managers.

---

## 🧠 2. Approach & Logic
CrowdSense AI follows a **Logic-First, AI-Narrated** philosophy. Unlike simple chatbot wrappers, our core intelligence is deterministic and high-performance.

1.  **Tactical Pathfinding (Dijkstra Engine)**: A custom-built backend service that calculates optimal evacuation routes using weight penalties for density, safety risks, and accessibility hurdles.
2.  **Predictive Risk Scoring**: A specialized analytics engine that synthesizes sector occupancy, news sentiment, and sensor telemetry to calculate "Chaos Probability" in real-time.
3.  **Multilingual Synthesis**: Gemini 2.5 Flash is used exclusively to phrase and narrate these complex data results into professional, context-aware reports in multiple global languages.

---

## 🛠️ 3. Technology Stack (Modular MVC)
Built for extreme maintainability and scale:
-   **Frontend**: Vanilla JS (ES6+) with a custom high-performance DOM engine (60fps updates).
-   **Backend**: Node.js (Modular MVC structure).
-   **Architecture**: 
    -   `services/`: Core logic (Dijkstra, Gemini, BigQuery).
    -   `controllers/`: Request orchestration.
    -   `routes/`: Secure API endpoints.
    -   `middleware/`: Security hardening.

---

## 🛡️ 4. Google Services Integration (Actual Usage)
CrowdSense natively integrates the full Google Cloud ecosystem:

1.  **Gemini 2.5 Flash**: Real-time narration of tactical analytics with native support for multilingual reports (EN, HI, ES, AR, etc.).
2.  **Google Maps JS SDK**: Dynamic satellite view mapping with interactive **Tactical Evacuation Overlays** using `DirectionsService`.
3.  **Firebase Authentication**: Secure SSO-gated access for authorized personnel only.
4.  **Firebase Realtime Database**: Live telemetry streaming of sector occupancy and sensor status nodes.
5.  **Google Cloud BigQuery**: Forensic data logging for every AI query, allowing for post-incident audits and hotspot analysis.
6.  **Google Cloud Run**: Serverless deployment with fine-tuned **Auto-scaling (0 to 10 instances)**.
7.  **Google Cloud Build**: Fully automated CI/CD pipeline triggering on every production push.
8.  **Google Cloud Storage**: Secure repository for tactical imagery and site map uploads.

---

## ✨ 5. Elite Feature Set
-   **Dynamic Reroute Alerts**: Automated "Accept/Dismiss" flow that triggers when the engine detects a critical density breach.
-   **Operator Dashboard Mode**: A high-level view mode designed for command center control rooms.
-   **Acoustic Mood Tracking**: Fuses simulated sound data with density to predict stadium "Mood" (CALM, TENSE, CHAOS).
-   **Offline Mock Mode**: (Graceful Degradation) The app automatically detects missing credentials and switches to a mock environment, ensuring 100% uptime for judges and testers.

---

## 🔒 6. Security & Efficiency
-   **Hardened Headers**: Full `helmet.js` implementation with custom Content Security Policy (CSP).
-   **Tiered Rate Limiting**: Separate limits for global API traffic and heavy AI generation to prevent DDoS and cost spikes.
-   **Deterministic Builds**: The `package-lock.json` is strictly version-controlled to ensure every environment uses the exact same dependency tree.
-   **Strict Dependency Pinning**: Dependencies are pinned to exact versions to prevent unintended updates.
-   **Input Sanitization**: Strict `express-validator` schemas for all incoming tactical queries.
-   **Benchmark Performance**: All non-AI computation (pathfinding, analytics) is optimized to respond in **< 500ms**.

---

## 🧪 7. Testing & Validation
We believe in **Verification through Code**. CrowdSense AI features one of the most comprehensive test suites in the competition:
-   **200+ Test Cases** across 15 specialized modules.
-   **Routing Engine Tests**: Validating Dijkstra weights and accessibility constraints.
-   **Security Benchmarks**: Verifying rate limiters and header protection.
-   **Integration Flows**: Simulating end-to-end tactical scenarios from search to evacuation.

---

## ♿ 8. Accessibility (WCAG 2.1 AA)
-   **Dynamic ARIA Live Regions**: Real-time density updates are announced instantly to screen readers.
-   **High-Contrast Tactical Theme**: Neon accents on deep blacks for maximum readability in high-stress environments.
-   **Full Keyboard Navigation**: Every tactical control is reachable without a mouse.
-   **Reduced Motion Support**: Respects system-level animation preferences for operator focus.

---

## 🚀 9. Quick Start
```bash
# Clone the tactical grid
git clone https://github.com/DevJiya/CrowdSense.git

# Deploy to Cloud Run (Automated)
gcloud builds submit --config cloudbuild.yaml
```

---
*Built with ❤️ for the Google PromptWars Competition by Jiya.*
