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

window.GLOBAL_STATE = {
  currentStadium: 'wankhede',
  venue: { density: 'LOW', safety: 'SAFE', trust: 92, attendance: 0, occupancy: 0 },
  zones: {},
  alerts: [],
  tick: 0,
  activeSituation: null,
};

// Declarations shifted below...

function initStadiumSelector() {
  const container = document.getElementById('stadium-selector');
  container.innerHTML = Object.keys(STADIUMS)
    .map(
      (id) => `
    <button class="stadium-chip ${id === window.GLOBAL_STATE.currentStadium ? 'active' : ''}" 
            onclick="switchStadium('${id}')">${STADIUMS[id].name.split(',')[0]}</button>
  `,
    )
    .join('');
}

function switchStadium(id) {
  window.GLOBAL_STATE.currentStadium = id;
  const stadium = STADIUMS[id];

  // Reset Data
  window.GLOBAL_STATE.zones = {};
  stadium.zones.forEach((zName) => {
    window.GLOBAL_STATE.zones[zName.toLowerCase().replace(/ /g, '-')] = {
      name: zName,
      status: 'SAFE',
      density: 20,
      trust: 90,
    };
  });

  window.GLOBAL_STATE.alerts = [];
  document.getElementById('venue-name-display').textContent = stadium.name;

  // Update Chips
  document.querySelectorAll('.stadium-chip').forEach((c) => {
    c.classList.toggle('active', c.textContent.toLowerCase().includes(id.substring(0, 3)));
  });

  generateSystemAlert('system', `Now Monitoring: ${stadium.name}`);
}

function startHeartbeat() {
  setInterval(() => {
    updateSimulation();
    syncUI();
  }, 4000);
}

function updateSimulation() {
  const state = window.GLOBAL_STATE;
  const stadium = STADIUMS[state.currentStadium];

  state.tick++;

  // Global Metrics Drift
  state.venue.trust = Math.max(40, Math.min(100, state.venue.trust + (Math.random() * 6 - 3)));
  state.venue.attendance = Math.floor(stadium.capacity * (0.4 + Math.random() * 0.5));
  state.venue.occupancy = Math.round((state.venue.attendance / stadium.capacity) * 100);
  state.venue.density =
    state.venue.occupancy > 75 ? 'HIGH' : state.venue.occupancy > 45 ? 'MED' : 'LOW';

  // Zones Drift
  Object.keys(state.zones).forEach((id) => {
    const z = state.zones[id];
    const oldStatus = z.status;
    z.density = Math.max(5, Math.min(99, z.density + (Math.random() * 16 - 8)));
    z.status = z.density > 70 ? 'RISKY' : z.density > 45 ? 'MODERATE' : 'SAFE';
    z.trust = Math.max(40, Math.min(100, z.trust + (Math.random() * 4 - 2)));

    if (oldStatus !== z.status) {
      generateSystemAlert(id, z.status);
    }
  });

  // 3. Situational Injection (Every 3 ticks, 40% chance)
  if (state.tick % 3 === 0 && Math.random() > 0.6) {
    const sit = FAKE_SITUATIONS[Math.floor(Math.random() * FAKE_SITUATIONS.length)];
    state.activeSituation = sit.msg;
    generateSystemAlert('system', sit.msg, sit.icon);
  }
}

function syncUI() {
  const state = window.GLOBAL_STATE;

  // Home Stats
  updateText('stat-density', state.venue.density);
  updateText('stat-safety', state.venue.occupancy > 80 ? 'CAUTION' : 'SAFE');
  updateText('stat-attendance', state.venue.attendance.toLocaleString());
  updateText('stat-occupancy', state.venue.occupancy + '% Full');
  updateText('trust-hero-score', Math.round(state.venue.trust) + '%');

  // Safety Vibe Grid
  const safetyGrid = document.getElementById('safety-zone-grid');
  if (safetyGrid) {
    safetyGrid.innerHTML = Object.keys(state.zones)
      .map((id) => {
        const z = state.zones[id];
        const color = z.status === 'RISKY' ? 'red' : z.status === 'MODERATE' ? 'yellow' : 'green';
        return `
        <div class="safety-card ${color}">
          <div class="card-label">${z.name}</div>
          <div style="font-size: 1.25rem; font-weight: 800;">${z.status}</div>
          <div class="safety-density-bar"><div class="fill" style="width: ${z.density}%"></div></div>
          <div style="font-size: 0.7rem; color: #71717a; margin-top: 8px;">Density: ${Math.round(z.density)}%</div>
        </div>
      `;
      })
      .join('');
  }

  // Insights
  updateText('ins-avg-atten', Math.round(state.venue.attendance).toLocaleString());
  const riskyCount = Object.keys(state.zones).filter(
    (id) => state.zones[id].status === 'RISKY',
  ).length;
  updateText('ins-risky-count', riskyCount);

  const insightText = document.getElementById('ai-insight-text');
  if (insightText) {
    if (riskyCount > 0) {
      insightText.innerHTML = `<span style="color:var(--danger)">⚠️ CRITICAL:</span> ${riskyCount} zones are currently showing high density. AI recommends immediate flow diversion.`;
    } else {
      insightText.innerHTML = `<span style="color:var(--safe)">✅ OPTIMAL:</span> Venue flow is verified stable. No congestion detected.`;
    }
  }

  // Map Shimmer
  const map = document.getElementById('stadium-map');
  if (map) {
    map.style.opacity = '0.8';
    setTimeout(() => (map.style.opacity = '1'), 100);
  }

  // Clock
  updateText(
    'ist-clock',
    new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST',
  );
}

function generateSystemAlert(zoneId, status, customIcon = null) {
  const feed = document.getElementById('live-alerts-feed');
  const globalList = document.getElementById('global-alert-list');
  const badge = document.getElementById('alert-badge');

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const zoneName = zoneId === 'system' ? 'SYSTEM' : window.GLOBAL_STATE.zones[zoneId].name;
  const isRisky = status === 'RISKY';
  const icon = customIcon || (status === 'SAFE' ? '✅' : '🚨');

  const alertHtml = `
    <div class="incident-item animate-fadeIn">
      <span class="incident-dot ${status === 'SAFE' ? 'safe' : 'alert'}"></span>
      <div class="incident-text"><strong>${zoneName}</strong>: ${status === 'RISKY' ? '🚨 ' : ''}${status}</div>
      <span class="incident-time">${time}</span>
    </div>
  `;
  if (feed) {
    feed.insertAdjacentHTML('afterbegin', alertHtml);
    if (feed.children.length > 10) {
      feed.removeChild(feed.lastChild);
    }
  }

  const cardHtml = `
    <div class="alert-card ${status === 'RISKY' ? 'risky' : 'safe'}">
      <div style="font-size: 1.5rem;">${icon}</div>
      <div style="flex: 1;">
        <div style="font-weight: 700;">${zoneId === 'system' ? 'SITUATIONAL ALERT' : zoneName + ' TRANSITION'}</div>
        <div style="font-size: 0.8rem; opacity: 0.6;">${status === 'system' ? '' : 'Neural analysis: '}${status}</div>
      </div>
      <div style="font-size: 0.7rem; opacity: 0.4;">${time}</div>
    </div>
  `;
  if (globalList) {
    globalList.insertAdjacentHTML('afterbegin', cardHtml);
  }

  if (isRisky && badge) {
    badge.textContent = parseInt(badge.textContent) + 1;
    badge.style.display = 'block';
  }
}

function updateText(id, val) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = val;
  }
}

// ── INITIALIZE ──
window.initStadiumSelector = initStadiumSelector;
window.switchStadium = switchStadium;
window.startHeartbeat = startHeartbeat;

document.addEventListener('DOMContentLoaded', () => {
  window.initStadiumSelector();
  window.switchStadium('wankhede');
  window.startHeartbeat();
});
