# CrowdSense AI — Tactical Crowd Intelligence Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-78.3%25-brightgreen)
![Node Version](https://img.shields.io/badge/node-v24.15.0-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

CrowdSense AI is a high-performance situational awareness platform that combines dynamic graph-based pathfinding with Google Gemini's tactical narration to manage large-scale crowd events with precision and safety.

## 🏗️ Architecture
```text
       [ Client (Browser) ]
               |
               v
       [ Express Server ] <---- [ Joi Validation ]
               |
       +-------+-------+
       |               |
[ Dijkstra Engine ] [ Gemini AI ]
       |               |
       v               v
 [ BigQuery ] <--> [ Firebase RTDB ]
```

## 🛠️ Prerequisites
- **Node.js**: v24.15.0 (Locked via `.nvmrc`)
- **NPM**: v10+
- **GCP Project**: For BigQuery, GCS, and Gemini AI access.

## 🚀 Local Setup
```bash
# 1. Clone the repository
git clone https://github.com/DevJiya/CrowdSense.git
cd CrowdSense

# 2. Install dependencies (exact versions pinned)
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your Gemini and Firebase credentials

# 4. Start the development server
npm run start:dev
```

## ⚙️ Environment Variables
| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `PORT` | No | `3001` | Port to run the server on. |
| `NODE_ENV` | No | `development` | `production`, `development`, or `test`. |
| `GEMINI_API_KEY` | Yes | - | API key for Google Gemini AI. |
| `FIREBASE_PROJECT_ID` | No | - | GCP Project ID for Firebase. |
| `FIREBASE_CLIENT_EMAIL` | No | - | Firebase Service Account Email. |
| `FIREBASE_PRIVATE_KEY` | No | - | Firebase Service Account Private Key. |
| `MOCK_MODE` | No | `false` | Set to `true` to bypass live cloud writes. |

## 📡 API Reference
| Method | Path | Auth | Description | Request Body | Response Shape |
|--------|------|------|-------------|--------------|----------------|
| `GET` | `/api` | No | Health check. | - | `{ status, version }` |
| `POST` | `/api/ai-chat` | No | AI Narration. | `{ message, venue, sectors, language? }` | `Stream<Text>` |
| `POST` | `/api/analytics` | Yes | Log events. | `{ analyticsEventName, metadata }` | `{ status: "logged" }` |
| `POST` | `/api/telemetry/sync` | Yes | Sync sensors. | `{ stadiumId, telemetryPayload }` | `{ status: "synced" }` |
| `POST` | `/api/upload` | Yes | Upload files. | `multipart/form-data (file)` | `{ url }` |

## 🧪 Quality & Testing
The project maintains a strict **75% coverage threshold** enforced via Jest.
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Design patterns and engine logic.
- [TESTING.md](./TESTING.md) - Test infrastructure and coverage reports.
- [SECURITY.md](./SECURITY.md) - Hardening, rate-limiting, and validation.
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Standards for tactical dashboard.
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Branching and commit standards.

## 📜 Changelog
Refer to [CHANGELOG.md](./CHANGELOG.md) for version history.
