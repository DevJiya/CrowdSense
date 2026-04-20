# CrowdSense AI — Architecture Guide

## 📡 System Overview
CrowdSense AI is a distributed situational awareness platform designed to process high-velocity crowd telemetry and provide actionable tactical intelligence.

## 🏗️ Core Components

### 1. Tactical Routing Engine (`src/services/routing.service.js`)
- **Algorithm**: Dijkstra's Algorithm with dynamic weighting.
- **Weights**: Computed as `BaseDistance + (CrowdDensity * ModeMultiplier)`.
- **Modes**:
  - `FASTEST`: Optimized for minimal transit time.
  - `SAFEST`: Heavy penalty for density (> 10x) to avoid stampedes.
  - `ACCESSIBLE`: Near-infinite weight for stairs to ensure wheelchair/stretcher compatibility.

### 2. AI Intelligence Layer (`src/services/gemini.service.js`)
- **Model**: Google Gemini 1.5 Flash.
- **Role**: Narrates raw telemetry into human-readable tactical briefings.
- **Context**: Injects live news headlines and venue bottleneck analysis into the prompt for hyper-local awareness.

### 3. Analytics Service (`src/services/crowd.analytics.service.js`)
- **Bottleneck Detection**: Identifies zones with density > 80%.
- **Strategy Selection**: Dynamically recommends "Open Emergency Exits" or "Unidirectional Flow" based on risk scores.

## ☁️ Cloud Infrastructure
- **Firebase Realtime Database**: Synchronizes real-time telemetry from edge sensors to the dashboard.
- **BigQuery**: Long-term storage for incident analysis and machine learning model training.
- **Google Cloud Storage**: Secure storage for tactical media (incident photos/videos).

## 🛡️ Security & Resilience
- **Zero-Trust Validation**: All API inputs validated via `Joi` schemas.
- **Graceful Degradation**: The system operates in `MOCK_MODE` if cloud credentials are absent, ensuring development remains unblocked.
- **Centralized Error Handling**: Unified `AppError` system prevents stack trace leaks and ensures structured logging.
