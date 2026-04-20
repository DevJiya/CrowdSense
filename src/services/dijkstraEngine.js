/**
 * @module DijkstraEngine
 * @description Neural Intelligence Engine (v7.0). Orchestrates the real-time simulation
 * of stadium crowd dynamics, including density drift, situational alerts, and UI synchronization.
 * @requires STADIUMS
 * @requires FAKE_SITUATIONS
 */

// ══════════════════════════════════════════════════════
// ENGINE.JS — Neural Intelligence Engine (v7.0)
// ══════════════════════════════════════════════════════

const STADIUMS = {
  wankhede: {
    name: 'Wankhede Stadium, Mumbai',
    capacity: 33108,
    zones: ['Gate A North', 'Gate B South', 'Upper Deck', 'Lower Deck', 'VIP Lounge', 'Food Court'],
  },
  eden: {
    name: 'Eden Gardens, Kolkata',
    capacity: 66349,
    zones: ['Club House', 'B Block', 'North Stand', 'South Stand', 'VIP Pavilion', 'Media Box'],
  },
  chinnaswamy: {
    name: 'M. Chinnaswamy Stadium, Bengaluru',
    capacity: 40000,
    zones: [
      'West Stand',
      'East Stand',
      'North Block',
      'South Block',
      'Executive Box',
      'Parking Zone',
    ],
  },
};

const FAKE_SITUATIONS = [
  {
    type: 'WARN',
    msg: 'Minor altercation reported near Food Court. Security notified.',
    icon: '👮',
  },
  { type: 'INFO', msg: 'Celebrity arrival at VIP Gate 1. Crowd surge expected.', icon: '🌟' },
  {
    type: 'RISKY',
    msg: 'Medical assistance required at North Stand. Clear path for EMS.',
    icon: '🚑',
  },
  { type: 'INFO', msg: 'Flash mob starting in Section 4B. Energy levels spiking.', icon: '🕺' },
  { type: 'WARN', msg: 'Lost child reported near Gate B. AI scanning facial nodes.', icon: '🔍' },
  { type: 'RISKY', msg: 'Water pipe burst in Stand C. Area partially blocked.', icon: '💧' },
];

if (typeof window !== 'undefined') {
  window.GLOBAL_STATE = {
    currentStadium: 'wankhede',
    venue: { density: 'LOW', safety: 'SAFE', trust: 92, attendance: 0, occupancy: 0 },
    zones: {},
    alerts: [],
    tick: 0,
    activeSituation: null,
  };
}

// Declarations shifted below...

/**
 * Initializes the stadium selection UI chips.
 * @fires DOMContentLoaded
 */
function initStadiumSelector() {
  const container = document.getElementById('stadium-selector');
  container.innerHTML = Object.keys(STADIUMS)
    .map(
      (stadiumId) => `
    <button class="stadium-chip ${stadiumId === window.GLOBAL_STATE.currentStadium ? 'active' : ''}" 
            onclick="switchStadium('${stadiumId}')">${STADIUMS[stadiumId].name.split(',')[0]}</button>
  `,
    )
    .join('');
}

/**
 * Switches the active monitoring stadium and resets the simulation state.
 * @param {string} stadiumId - The ID of the stadium to switch to (e.g., 'wankhede').
 */
function switchStadium(stadiumId) {
  window.GLOBAL_STATE.currentStadium = stadiumId;
  const stadium = STADIUMS[stadiumId];

  // Reset Data
  window.GLOBAL_STATE.zones = {};
  stadium.zones.forEach((zoneName) => {
    window.GLOBAL_STATE.zones[zoneName.toLowerCase().replace(/ /g, '-')] = {
      name: zoneName,
      status: 'SAFE',
      density: 20,
      trust: 90,
    };
  });

  window.GLOBAL_STATE.alerts = [];
  document.getElementById('venue-name-display').textContent = stadium.name;

  // Update Chips
  document.querySelectorAll('.stadium-chip').forEach((chipElement) => {
    chipElement.classList.toggle(
      'active',
      chipElement.textContent.toLowerCase().includes(stadiumId.substring(0, 3)),
    );
  });

  generateSystemAlert('system', `Now Monitoring: ${stadium.name}`);
}

/**
 * Starts the simulation heartbeat interval.
 */
function startHeartbeat() {
  setInterval(() => {
    updateSimulation();
    syncUI();
  }, 4000);
}

/**
 * Updates the simulation state for the current tick, including density drift and situational injection.
 */
function updateSimulation() {
  const simulationState = window.GLOBAL_STATE;
  const activeStadium = STADIUMS[simulationState.currentStadium];

  simulationState.tick++;

  // Global Metrics Drift
  simulationState.venue.trust = Math.max(
    40,
    Math.min(100, simulationState.venue.trust + (Math.random() * 6 - 3)),
  );
  simulationState.venue.attendance = Math.floor(
    activeStadium.capacity * (0.4 + Math.random() * 0.5),
  );
  simulationState.venue.occupancy = Math.round(
    (simulationState.venue.attendance / activeStadium.capacity) * 100,
  );
  simulationState.venue.density =
    simulationState.venue.occupancy > 75
      ? 'HIGH'
      : simulationState.venue.occupancy > 45
        ? 'MED'
        : 'LOW';

  // Zones Drift
  Object.keys(simulationState.zones).forEach((zoneId) => {
    const zoneData = simulationState.zones[zoneId];
    const oldStatus = zoneData.status;
    zoneData.density = Math.max(5, Math.min(99, zoneData.density + (Math.random() * 16 - 8)));
    zoneData.status = zoneData.density > 70 ? 'RISKY' : zoneData.density > 45 ? 'MODERATE' : 'SAFE';
    zoneData.trust = Math.max(40, Math.min(100, zoneData.trust + (Math.random() * 4 - 2)));

    if (oldStatus !== zoneData.status) {
      generateSystemAlert(zoneId, zoneData.status);
    }
  });

  // 3. Situational Injection (Every 3 ticks, 40% chance)
  if (simulationState.tick % 3 === 0 && Math.random() > 0.6) {
    const situationData = FAKE_SITUATIONS[Math.floor(Math.random() * FAKE_SITUATIONS.length)];
    simulationState.activeSituation = situationData.msg;
    generateSystemAlert('system', situationData.msg, situationData.icon);
  }
}

/**
 * Synchronizes the internal simulation state with the DOM UI elements.
 * @listens tick
 */
function syncUI() {
  const simulationState = window.GLOBAL_STATE;

  // Home Stats
  updateText('stat-density', simulationState.venue.density);
  updateText('stat-safety', simulationState.venue.occupancy > 80 ? 'CAUTION' : 'SAFE');
  updateText('stat-attendance', simulationState.venue.attendance.toLocaleString());
  updateText('stat-occupancy', simulationState.venue.occupancy + '% Full');
  updateText('trust-hero-score', Math.round(simulationState.venue.trust) + '%');

  // Safety Vibe Grid
  const safetyGrid = document.getElementById('safety-zone-grid');
  if (safetyGrid) {
    safetyGrid.innerHTML = Object.keys(simulationState.zones)
      .map((zoneId) => {
        const zoneData = simulationState.zones[zoneId];
        const severityColor =
          zoneData.status === 'RISKY' ? 'red' : zoneData.status === 'MODERATE' ? 'yellow' : 'green';
        return `
        <div class="safety-card ${severityColor}">
          <div class="card-label">${zoneData.name}</div>
          <div style="font-size: 1.25rem; font-weight: 800;">${zoneData.status}</div>
          <div class="safety-density-bar"><div class="fill" style="width: ${
            zoneData.density
          }%"></div></div>
          <div style="font-size: 0.7rem; color: #71717a; margin-top: 8px;">Density: ${Math.round(
            zoneData.density,
          )}%</div>
        </div>
      `;
      })
      .join('');
  }

  // Insights
  updateText('ins-avg-atten', Math.round(simulationState.venue.attendance).toLocaleString());
  const riskyZoneCount = Object.keys(simulationState.zones).filter(
    (zoneId) => simulationState.zones[zoneId].status === 'RISKY',
  ).length;
  updateText('ins-risky-count', riskyZoneCount);

  const insightText = document.getElementById('ai-insight-text');
  if (insightText) {
    if (riskyZoneCount > 0) {
      insightText.innerHTML = `<span style="color:var(--danger)">⚠️ CRITICAL:</span> ${riskyZoneCount} zones are currently showing high density. AI recommends immediate flow diversion.`;
    } else {
      insightText.innerHTML = `<span style="color:var(--safe)">✅ OPTIMAL:</span> Venue flow is verified stable. No congestion detected.`;
    }
  }

  // Map Shimmer
  const mapElement = document.getElementById('stadium-map');
  if (mapElement) {
    mapElement.style.opacity = '0.8';
    setTimeout(() => (mapElement.style.opacity = '1'), 100);
  }

  // Clock
  updateText(
    'ist-clock',
    new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST',
  );
}

/**
 * Generates and displays a system alert in the feed and notification list.
 * @param {string} zoneId - The ID of the zone the alert originates from, or 'system'.
 * @param {string} status - The status message (e.g., 'RISKY', 'SAFE').
 * @param {string} [customIcon=null] - Optional emoji icon for the alert.
 */
function generateSystemAlert(zoneId, status, customIcon = null) {
  const feedElement = document.getElementById('live-alerts-feed');
  const globalAlertList = document.getElementById('global-alert-list');
  const alertBadge = document.getElementById('alert-badge');

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const zoneName = zoneId === 'system' ? 'SYSTEM' : window.GLOBAL_STATE.zones[zoneId].name;
  const isRisky = status === 'RISKY';
  const severityIcon = customIcon || (status === 'SAFE' ? '✅' : '🚨');

  const alertHtml = `
    <div class="incident-item animate-fadeIn">
      <span class="incident-dot ${status === 'SAFE' ? 'safe' : 'alert'}"></span>
      <div class="incident-text"><strong>${zoneName}</strong>: ${
        status === 'RISKY' ? '🚨 ' : ''
      }${status}</div>
      <span class="incident-time">${timestamp}</span>
    </div>
  `;
  if (feedElement) {
    feedElement.insertAdjacentHTML('afterbegin', alertHtml);
    if (feedElement.children.length > 10) {
      feedElement.removeChild(feedElement.lastChild);
    }
  }

  const cardHtml = `
    <div class="alert-card ${status === 'RISKY' ? 'risky' : 'safe'}">
      <div style="font-size: 1.5rem;">${severityIcon}</div>
      <div style="flex: 1;">
        <div style="font-weight: 700;">${
          zoneId === 'system' ? 'SITUATIONAL ALERT' : zoneName + ' TRANSITION'
        }</div>
        <div style="font-size: 0.8rem; opacity: 0.6;">${
          status === 'system' ? '' : 'Neural analysis: '
        }${status}</div>
      </div>
      <div style="font-size: 0.7rem; opacity: 0.4;">${timestamp}</div>
    </div>
  `;
  if (globalAlertList) {
    globalAlertList.insertAdjacentHTML('afterbegin', cardHtml);
  }

  if (isRisky && alertBadge) {
    alertBadge.textContent = parseInt(alertBadge.textContent) + 1;
    alertBadge.style.display = 'block';
  }
}

/**
 * Helper to update the text content of a DOM element by ID.
 * @param {string} elementId - The ID of the DOM element.
 * @param {string|number} textContentValue - The value to set.
 */
function updateText(elementId, textContentValue) {
  const domElement = document.getElementById(elementId);
  if (domElement) {
    domElement.textContent = textContentValue;
  }
}

// ── INITIALIZE ──
if (typeof window !== 'undefined') {
  window.initStadiumSelector = initStadiumSelector;
  window.switchStadium = switchStadium;
  window.startHeartbeat = startHeartbeat;

  document.addEventListener('DOMContentLoaded', () => {
    window.initStadiumSelector();
    window.switchStadium('wankhede');
    window.startHeartbeat();
  });
}
