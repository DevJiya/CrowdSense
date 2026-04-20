# CrowdSense AI 🌐

## 1. Chosen Vertical
**Smart Cities & Public Safety (Event Management & Crowd Control)**
CrowdSense AI is a highly advanced tactical intelligence layer designed to monitor, predict, and mitigate crowd congestion and potential chaos at large-scale venues (stadiums, concerts, transit hubs). It empowers security teams with real-time data visualization, predictive AI, and actionable evacuation metrics.

---

## 2. Approach and Logic
The core logic of CrowdSense AI is built around **Predictive Situational Awareness**. Rather than simply waiting for a crisis to occur, the system actively calculates "Chaos Probability" by synthesizing multiple data streams:
1. **Density Metrics**: Simulated real-time tracking of gate/sector occupancy.
2. **Contextual Sentiment (Google News)**: Analyzing local news feeds for keywords related to traffic, unrest, or delays.
3. **Acoustic & Threat Diagnostics**: Fusing sensor statuses and acoustic baselines to determine the overall "Mood" (CALM, TENSE, CHAOS).

The UI was designed using "Dark-Glass Tactical" aesthetics, mimicking military/security dashboards. The logic prioritizes **visual hierarchy**—nominal data remains subtle (gray/green), while critical breaches (density >85%) immediately grab attention with pulsing red indicators and automated incident logging.

---

## 3. How the Solution Works
* **Interactive Satellite Targeting**: Using the **Google Maps API**, users can search for any global venue. The UI features an unlocked satellite feed, allowing the user to click and drag the map to perfectly align the stadium under our Tactical Crosshairs.
* **Smart Radar Nodes**: Once aligned, 4 precise sector nodes lock onto the perimeter of the venue. These nodes run independently of the map iframe, updating their density metrics efficiently without forcing map reloads.
* **AI Neural Insights**: The system fetches live RSS feeds via **Google News**. It parses headlines related to the active venue and runs a simulated neural synthesis, typing out a real-time risk assessment and adjusting the global threat level dynamically.
* **Evacuation Routing**: Based on the lowest density sectors, the algorithm calculates and displays the safest primary evacuation route in the Insights tab.

---

## 4. Assumptions Made
* **Data Availability**: The system assumes that in a production environment, the simulated density metrics would be replaced by actual IoT sensor APIs (e.g., thermal cameras, turnstile counters).
* **Targeting Alignment**: Because Google Maps pins are sometimes offset from the physical roof of a structure, we assumed the best user experience was manual drag-to-align calibration rather than forcing rigid programmatic coordinates.
* **News Relevancy**: We assume that sudden spikes in local traffic or public safety news are highly correlated with venue congestion.

---

### 💻 Code Quality & Architecture
* **Centralized Engine Modules**: The architecture strictly separates business logic from routing. The Express backend uses `engine/aiEngine.js` for Gemini SDK interactions, `engine/crowdEngine.js` for bottleneck calculations, and `engine/analyticsEngine.js` for BigQuery logging. Routes in `server.js` remain clean and act only as adapters.

### 🔒 Security
* **Defense-in-Depth Backend**: The Node.js Express server is protected via `helmet()` for strict CSP, CORS whitelisting, `express-rate-limit`, and `express-validator`. Authentication and DB rules are locked down via `firebase.rules`.

### 🧪 Testing
* **Comprehensive Jest Coverage**: The logic is backed by 14 extensive test suites and over 200 individual test cases using `jest` and `supertest`, rigorously validating every module, from the AI schemas to UI file uploads.

### ♿ Accessibility
* **WCAG 2.1 AA Conformant**: Features comprehensive `aria-live` regions, keyboard navigability, semantic HTML, and high-contrast dark aesthetics.

### 🌍 Google Services Integration (7 Services)
CrowdSense natively integrates powerful Google Services to drive its intelligence:
1. **Gemini 2.5 Flash**: Analyzes tactical threat context via the official Node.js SDK and SSE streams.
2. **Google Maps JavaScript API**: Renders the high-res interactive stadium tactical view.
3. **Firebase Authentication**: Secures operator access and validates identity.
4. **Firebase Realtime Database**: Streams and persists live incident reports and user scores.
5. **Google Cloud Run**: Hosts the scalable, containerized Express microservice.
6. **Google Cloud Build**: Automated CI/CD pipelines via `cloudbuild.yaml`.
7. **Google Cloud BigQuery**: Logs critical system events and bottleneck metrics for long-term data analysis.
