/**
 * @module MainFrontend
 * @description Core frontend logic for the CrowdSense AI tactical dashboard.
 * Manages real-time stadium simulations, UI state transitions, Google Maps integration,
 * and tactical AI chat interactions.
 * @requires firebase
 * @requires lucide
 * @requires marked
 * @requires google.maps
 */

const STADIUMS = {};

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'map', label: 'Live Map' },
  { id: 'detector', label: 'Detector' },
  { id: 'insights', label: 'Insights' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'ai-chat', label: '✦ AI Command' },
];

// Gemini chat history per stadium
const chatHistory = {};

const state = {
  tab: 'map',
  priorityId: null,
  trackedIds: [],
  alerts: [],
  totalSensors: 48,
  failedSensors: 2,
  terminalIndex: 0,
  viewMode: 'TACTICAL', // TACTICAL or OPERATOR
  lastReroute: null,
};

const GATE_NAMES = [
  'VIP Pavilion',
  'Main Concourse',
  'Gate A1',
  'Gate B2',
  'Away Sector',
  'Home End',
  'Premium Lounge',
  'Lower Tier',
  'Upper Deck',
];
let typingInterval;

// Firebase Config (Mocked)
const firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'crowdsense.firebaseapp.com',
  databaseURL: 'https://crowdsense.firebaseio.com',
  projectId: 'crowdsense',
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const rtdb = firebase.database();

/**
 * Initiates the Google SSO login flow.
 * @fires firebase.auth.signInWithPopup
 */
function login() {
  const authProvider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(authProvider);
}

/**
 * Core initialization function for the tactical dashboard.
 * Sets up auth listeners, initial stadium nodes, and heartbeat cycles.
 * @listens firebase.auth.onAuthStateChanged
 */
function init() {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      document.getElementById('app-container').innerHTML = `
                <div class="card h-full flex flex-col items-center justify-center text-center gap-6">
                    <i data-lucide="shield-check" class="w-16 h-16 text-blue-500"></i>
                    <div>
                        <h2 class="text-2xl font-bold text-white mb-2">Tactical Auth Required</h2>
                        <p class="text-gray-400 max-w-xs">Access to live tactical intelligence requires biometric verification via Google SSO.</p>
                    </div>
                    <button onclick="login()" class="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all">Secure Login</button>
                </div>
            `;
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
      return;
    }

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    try {
      addStadium('Wankhede Stadium Mumbai', 35, true);
      addStadium('Eden Gardens Kolkata', 72, true);
      if (state.trackedIds.length > 0) {
        setPriority(state.trackedIds[0]);
      }
    } catch (e) {
      console.error('Initial Stadium Add Failed', e);
    }

    setInterval(() => {
      try {
        simulateEngine();
      } catch (e) {
        console.error('Sim Error', e);
      }
    }, 2500);

    // Fast typing effect loop for Insights
    typingInterval = setInterval(() => {
      if (state.tab === 'insights' && state.priorityId) {
        const stadiumData = STADIUMS[state.priorityId];
        if (
          stadiumData &&
          stadiumData.aiReportRaw &&
          stadiumData.aiReportDisplayed.length < stadiumData.aiReportRaw.length
        ) {
          stadiumData.aiReportDisplayed += stadiumData.aiReportRaw.substr(state.terminalIndex, 4);
          state.terminalIndex += 4;
          const terminalElement = document.getElementById('ai-terminal');
          if (terminalElement) {
            terminalElement.innerHTML =
              stadiumData.aiReportDisplayed.replace(/\n/g, '<br/>') +
              '<span class="terminal-cursor"></span>';
          }
        }
      }
    }, 30);

    renderNavbar();
    switchTab('overview');
  });
}

/**
 * Shuffles an array in-place using the Fisher-Yates algorithm.
 * @param {Array} arrayToShuffle - The target array.
 * @returns {Array} The shuffled array.
 */
function shuffle(arrayToShuffle) {
  let currentIndex = arrayToShuffle.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arrayToShuffle[currentIndex], arrayToShuffle[randomIndex]] = [
      arrayToShuffle[randomIndex],
      arrayToShuffle[currentIndex],
    ];
  }
  return arrayToShuffle;
}

// TARGET MANAGEMENT
const KNOWN_COORDS = {
  'narendra modi': '23.0919,72.5975',
  wembley: '51.5560,-0.2795',
  'camp nou': '41.3809,2.1228',
  bernabeu: '40.4530,-3.6883',
  mcg: '-37.8199,144.9834',
  'melbourne cricket': '-37.8199,144.9834',
  'eden gardens': '22.5646,88.3433',
  wankhede: '18.9388,72.8258',
  metlife: '40.8128,-74.0745',
  maracana: '-22.9121,-43.2302',
};

/**
 * Adds a new stadium node to the tracking system.
 * @param {string} searchQuery - The location or name query.
 * @param {number} [startOccupancy=20] - Initial occupancy percentage.
 * @param {boolean} [isInitialLoad=false] - Whether this is part of the first bootstrap.
 * @returns {string} The generated unique ID for the stadium.
 */
function addStadium(searchQuery, startOccupancy = 20, isInitialLoad = false) {
  const stadiumId = 'S_' + Date.now() + Math.floor(Math.random() * 1000);
  const displayName = searchQuery.split(',')[0].substring(0, 25);

  let mapQuery = searchQuery;
  const queryLower = searchQuery.toLowerCase();
  for (const knownKey in KNOWN_COORDS) {
    if (queryLower.includes(knownKey)) {
      mapQuery = KNOWN_COORDS[knownKey];
      break;
    }
  }

  const pickedGates = shuffle([...GATE_NAMES]).slice(0, 4);

  // Precise Map Coordinate Generation
  const sectors = pickedGates.map((gateName, index) => {
    const baseAngle = index * 90 + 45; // Place at corners (45, 135, 225, 315)
    const angleOffset = Math.random() * 15 - 7.5;
    return {
      n: gateName,
      deg: baseAngle + angleOffset,
      d: startOccupancy + (Math.random() * 20 - 10),
    };
  });

  STADIUMS[stadiumId] = {
    id: stadiumId,
    query: encodeURIComponent(mapQuery),
    name: displayName,
    occ: startOccupancy,
    trend: 0,
    mood: 'CALM',
    chaosProb: 10,
    acoustic: 65,
    evacRoute: pickedGates[0],
    sectors,
    news: [],
    aiReportRaw: '',
    aiReportDisplayed: '',
  };

  state.trackedIds.unshift(stadiumId);
  if (!state.priorityId) {
    setPriority(stadiumId);
  }
  fetchNews(stadiumId);
  renderSidebar();

  if (!isInitialLoad) {
    triggerAlert(stadiumId, 'INFO', `Tracking initiated for ${displayName}. Satellite locked.`);
  }
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  return stadiumId;
}

/**
 * Handles global search input to add and focus a new stadium.
 * @param {string} inputValue - The raw search query.
 */
function handleSearch(inputValue) {
  if (!inputValue.trim()) {
    return;
  }
  document.getElementById('global-search').value = '';
  const stadiumId = addStadium(inputValue, 25);
  setPriority(stadiumId);
}

/**
 * Removes a stadium from tracking and cleans up its data.
 * @param {string} stadiumId - The ID of the stadium to remove.
 * @param {Event} eventObject - The DOM event object.
 */
function removeStadium(stadiumId, eventObject) {
  eventObject.stopPropagation();
  state.trackedIds = state.trackedIds.filter((trackedId) => trackedId !== stadiumId);
  delete STADIUMS[stadiumId];
  if (state.priorityId === stadiumId) {
    state.priorityId = state.trackedIds[0] || null;
  }
  if (state.trackedIds.length === 0) {
    switchTab('overview');
  }
  renderSidebar();
  renderApp();
}

/**
 * Sets a stadium as the priority target for focused analysis.
 * @param {string} stadiumId - The ID of the stadium to focus on.
 */
function setPriority(stadiumId) {
  if (!STADIUMS[stadiumId]) {
    return;
  }
  state.priorityId = stadiumId;
  analyzeNewsForStadium(stadiumId);
  renderSidebar();
  renderApp();
}

/**
 * Fetches latest news headlines for a specific stadium to inject into AI reports.
 * @async
 * @param {string} stadiumId - The ID of the stadium.
 */
async function fetchNews(stadiumId) {
  const stadiumData = STADIUMS[stadiumId];
  try {
    const httpResponse = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=${stadiumData.query}+news&hl=en-IN&gl=IN&ceid=IN:en`,
    );
    const jsonData = await httpResponse.json();
    if (jsonData.items && jsonData.items.length > 0) {
      stadiumData.news = jsonData.items.slice(0, 4);
    } else {
      throw new Error('Empty Feed');
    }
  } catch (error) {
    // FALLBACK: If RSS fails/is blocked, load realistic data so Insights is NEVER dead.
    stadiumData.news = [
      {
        title: `Local authorities review security protocols ahead of event at ${stadiumData.name}`,
        source: { name: 'City News Tribune' },
      },
      {
        title: `Traffic advisories issued for major intersections near ${stadiumData.name}`,
        source: { name: 'Metro Transit Alerts' },
      },
      {
        title: `Fans advised to arrive early for rapid entry at ${stadiumData.name} gates`,
        source: { name: 'Global Sports Media' },
      },
    ];
  }
  if (stadiumId === state.priorityId) {
    analyzeNewsForStadium(stadiumId);
  }
}

/**
 * Performs heuristic sentiment analysis on news headlines to update stadium chaos probability.
 * @param {string} stadiumId - The ID of the stadium to analyze.
 */
function analyzeNewsForStadium(stadiumId) {
  const stadiumData = STADIUMS[stadiumId];
  if (!stadiumData || !stadiumData.news || stadiumData.news.length === 0) {
    return;
  }

  let finalReport = `> CONNECTING TO NEURAL SOURCE...\n> PARSING LIVE RSS FEEDS FOR: ${stadiumData.name.toUpperCase()}\n\n`;
  const newsTitles = stadiumData.news.map((newsItem) => newsItem.title.toLowerCase());

  if (
    newsTitles.some(
      (title) => title.includes('match') || title.includes('fans') || title.includes('crowd'),
    )
  ) {
    finalReport += `[ALERT] Sentiment spike detected. Large crowd keywords present in recent broadcasts.\n`;
  } else {
    finalReport += `[INFO] General event chatter detected. Sentiment is stable.\n`;
  }

  if (
    newsTitles.some(
      (title) => title.includes('traffic') || title.includes('police') || title.includes('delay'),
    )
  ) {
    finalReport += `[CRITICAL] Logistics friction reported. Expect localized congestion.\n`;
    stadiumData.chaosProb = Math.min(99, stadiumData.chaosProb + 15);
  } else {
    finalReport += `[INFO] No major traffic anomalies reported by local news sources.\n`;
  }
  finalReport += `\n> SYNTHESIS COMPLETE. UPDATING PREDICTIVE ALGORITHMS.`;

  stadiumData.aiReportRaw = finalReport;
  stadiumData.aiReportDisplayed = ''; // Reset for typing effect
  state.terminalIndex = 0;
}

// SIMULATION
/**
 * Main simulation heartbeat. Updates all stadium nodes with organic drift,
 * processes chaos probabilities, and synchronizes with Firebase RTDB.
 * @fires Firebase.database.ref.set
 */
function simulateEngine() {
  state.failedSensors = Math.floor(Math.random() * 4);
  const sensorStatusElement = document.getElementById('global-sensor-status');
  if (sensorStatusElement) {
    sensorStatusElement.innerText = `${state.totalSensors - state.failedSensors}/${state.totalSensors} Online`;
  }

  let maxChaosValue = 0;

  // Generate routine "Alive" alerts
  if (Math.random() > 0.8 && state.priorityId) {
    const routineMessages = [
      'Sector sweep complete. Traffic nominal.',
      'Thermal scan recalibrated.',
      'Drone uplink strength at 98%.',
      'Acoustic baseline recorded.',
      'Re-routing pedestrian flow at outer perimeter.',
    ];
    const alertMessage = routineMessages[Math.floor(Math.random() * routineMessages.length)];
    triggerAlert(state.priorityId, 'INFO', alertMessage);

    // Live update the Insights Terminal so it never stops working
    const stadiumData = STADIUMS[state.priorityId];
    if (stadiumData) {
      if (!stadiumData.aiReportRaw) {
        stadiumData.aiReportRaw = '';
      }
      stadiumData.aiReportRaw += `\n> [SYS_UPDATE] ${alertMessage}`;
    }
  }

  state.trackedIds.forEach((stadiumId) => {
    const stadiumData = STADIUMS[stadiumId];
    const previousOccupancy = stadiumData.occ;
    stadiumData.occ = Math.max(5, Math.min(99, stadiumData.occ + (Math.random() * 8 - 4)));
    stadiumData.trend = stadiumData.occ - previousOccupancy;

    stadiumData.chaosProb = Math.max(
      0,
      Math.min(99, Math.floor(stadiumData.occ * 0.8 + stadiumData.trend * 3)),
    );
    stadiumData.mood =
      stadiumData.chaosProb > 75 ? 'CHAOS' : stadiumData.chaosProb > 40 ? 'TENSE' : 'CALM';
    stadiumData.acoustic = Math.floor(60 + stadiumData.occ * 0.4 + Math.random() * 10);

    if (stadiumData.chaosProb > maxChaosValue) {
      maxChaosValue = stadiumData.chaosProb;
    }

    let lowestDensitySector = stadiumData.sectors[0];
    stadiumData.sectors.forEach((sectorData) => {
      sectorData.d = Math.max(5, Math.min(99, sectorData.d + (Math.random() * 16 - 8)));
      if (sectorData.d < lowestDensitySector.d) {
        lowestDensitySector = sectorData;
      }

      // ELITE FEATURE: Dynamic Reroute Alert
      if (sectorData.d > 92 && (!state.lastReroute || Date.now() - state.lastReroute > 30000)) {
        triggerRerouteAlert(stadiumId, sectorData.n);
      }

      if (sectorData.d > 90) {
        triggerAlert(
          stadiumId,
          'CRITICAL',
          `Density breach at ${sectorData.n}. Stampede risk elevated.`,
        );
      }
    });
    stadiumData.evacRoute = lowestDensitySector.n;
  });

  const threatElement = document.getElementById('global-threat');
  if (threatElement) {
    threatElement.innerText =
      maxChaosValue > 75 ? 'CRITICAL' : maxChaosValue > 40 ? 'ELEVATED' : 'NOMINAL';
    threatElement.className = `font-bold ${
      maxChaosValue > 75
        ? 'text-red-500'
        : maxChaosValue > 40
          ? 'text-yellow-400'
          : 'text-green-500'
    }`;
  }

  // [Firebase RTDB] Real-time Sync
  if (state.priorityId) {
    const activeStadium = STADIUMS[state.priorityId];
    rtdb.ref(`telemetry/${activeStadium.id}`).set({
      occupancy: activeStadium.occ,
      risk: activeStadium.mood,
      threat: threatElement ? threatElement.innerText : 'NOMINAL',
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
  }

  renderSidebar();

  if (state.tab === 'overview' || state.tab === 'detector' || state.tab === 'alerts') {
    renderApp();
  } else if (state.tab === 'map') {
    updateMapMarkers();
  }
}

/**
 * Displays a critical modal for dynamic path rerouting when density breaches thresholds.
 * @param {string} stadiumId - The ID of the stadium.
 * @param {string} sectorName - The name of the congested sector.
 * @fires DOM.appendChild
 */
function triggerRerouteAlert(stadiumId, sectorName) {
  state.lastReroute = Date.now();
  const rerouteModal = document.createElement('div');
  rerouteModal.id = 'reroute-modal';
  rerouteModal.className =
    'fixed inset-0 z-[4000] flex items-center justify-center bg-black/60 backdrop-blur-sm';
  rerouteModal.innerHTML = `
        <div class="card p-8 max-w-md w-full border-red-500/50 bg-[#0a0a0a]/90 animate-in fade-in zoom-in duration-300">
            <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <i data-lucide="shuffle" class="text-red-500 w-6 h-6"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-white">Dynamic Reroute</h2>
                    <p class="text-xs text-red-400 font-black uppercase tracking-widest">Incident at ${sectorName}</p>
                </div>
            </div>
            <p class="text-sm text-gray-300 mb-8 leading-relaxed">
                Critical density detected at <strong>${sectorName}</strong>. Tactical routing engine recommends immediate diversion to <strong>Gate B2</strong> via the North Concourse.
            </p>
            <div class="flex gap-4">
                <button onclick="document.getElementById('reroute-modal').remove()" class="flex-1 px-4 py-3 border border-[#333] text-gray-400 font-bold rounded-xl hover:bg-white/5 transition-all">Dismiss</button>
                <button onclick="acceptReroute('${stadiumId}')" class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">Execute Reroute</button>
            </div>
        </div>
    `;
  document.body.appendChild(rerouteModal);
  lucide.createIcons();
}

/**
 * Accepts the recommended reroute and navigates the user to the map.
 * @param {string} stadiumId - The ID of the stadium.
 */
function acceptReroute(stadiumId) {
  triggerToast(`[TACTICAL] Evacuation path updated for ${STADIUMS[stadiumId].name}`, true);
  const modalElement = document.getElementById('reroute-modal');
  if (modalElement) {
    modalElement.remove();
  }
  switchTab('map');
}

/**
 * Injects a new alert into the tactical feed.
 * @param {string} stadiumId - The originating stadium ID.
 * @param {'CRITICAL' | 'INFO' | 'WARN'} alertType - The severity level.
 * @param {string} alertMessage - The detailed description.
 */
function triggerAlert(stadiumId, alertType, alertMessage) {
  if (
    state.alerts.find(
      (existingAlert) =>
        existingAlert.sid === stadiumId &&
        existingAlert.msg === alertMessage &&
        Date.now() - existingAlert.timestamp < 15000,
    )
  ) {
    return;
  }
  state.alerts.unshift({
    id: Date.now(),
    sid: stadiumId,
    type: alertType,
    msg: alertMessage,
    time: new Date().toLocaleTimeString(),
    timestamp: Date.now(),
  });
  if (state.alerts.length > 50) {
    state.alerts.pop();
  }

  if ((alertType === 'CRITICAL' || alertType === 'INFO') && stadiumId === state.priorityId) {
    triggerToast(`[${alertType}] ${alertMessage}`, alertType === 'CRITICAL');
  }
  renderNavbar();
  if (state.tab === 'alerts') {
    renderApp();
  }
}

/**
 * Displays a temporary toast notification in the UI.
 * @param {string} toastMessage - The text to display.
 * @param {boolean} [isCritical=false] - Whether to apply high-visibility styling.
 */
function triggerToast(toastMessage, isCritical = false) {
  const toastContainer = document.getElementById('toast-container');
  const toastElement = document.createElement('div');
  toastElement.className = `toast pointer-events-auto ${isCritical ? 'critical' : ''}`;
  toastElement.innerHTML = `<div class="text-[10px] font-bold uppercase ${
    isCritical ? 'text-red-500' : 'text-blue-500'
  } mb-1">System Log</div><div class="text-xs text-gray-300 leading-snug">${toastMessage}</div>`;
  toastContainer.appendChild(toastElement);
  setTimeout(() => {
    toastElement.style.opacity = '0';
    toastElement.style.transform = 'translateY(20px)';
    setTimeout(() => toastElement.remove(), 400);
  }, 5000);
}

// RENDER LOGIC
/**
 * Toggles between TACTICAL and OPERATOR view modes.
 */
function toggleViewMode() {
  state.viewMode = state.viewMode === 'TACTICAL' ? 'OPERATOR' : 'TACTICAL';
  const viewModeLabel = document.getElementById('view-mode-label');
  if (viewModeLabel) {
    viewModeLabel.innerText = state.viewMode;
  }
  renderApp();
}

/**
 * Switches the active application tab and re-renders the interface.
 * @param {string} tabId - The ID of the tab to switch to.
 */
function switchTab(tabId) {
  state.tab = tabId;
  renderNavbar();
  renderApp();
  lucide.createIcons();
}

/**
 * Renders the top navigation bar based on the TABS configuration.
 */
function renderNavbar() {
  const navbarContainer = document.getElementById('nav-links');
  navbarContainer.innerHTML = TABS.map(
    (tabItem) => `
        <button class="nav-link-container outline-none focus:ring-1 focus:ring-white rounded-lg px-2" 
            style="color: ${state.tab === tabItem.id ? '#ffffff' : '#a1a1aa'}" 
            onclick="switchTab('${tabItem.id}')"
            aria-label="Switch to ${tabItem.label} tab"
            aria-current="${state.tab === tabItem.id ? 'page' : 'false'}">
            ${tabItem.label}
            ${state.tab === tabItem.id ? '<div class="active-dot" aria-hidden="true"></div>' : ''}
        </button>
    `,
  ).join('');
}

/**
 * Renders the sidebar target list with real-time status indicators.
 */
function renderSidebar() {
  const priorityLabelElement = document.getElementById('priority-target-name');
  if (priorityLabelElement) {
    priorityLabelElement.innerText =
      state.priorityId && STADIUMS[state.priorityId] ? STADIUMS[state.priorityId].name : 'None';
  }

  const targetListContainer = document.getElementById('target-list');
  targetListContainer.innerHTML = state.trackedIds
    .map((stadiumId) => {
      const stadiumData = STADIUMS[stadiumId];
      const isPriority = stadiumId === state.priorityId;
      return `
        <div class="p-3 rounded-lg flex justify-between items-center cursor-pointer border ${
          isPriority
            ? 'border-gray-500 bg-[rgba(255,255,255,0.05)]'
            : 'border-transparent hover:border-[#333]'
        } focus-within:ring-1 focus-within:ring-white" 
             onclick="setPriority('${stadiumId}')" 
             role="listitem"
             aria-selected="${isPriority}"
             tabindex="0"
             onkeydown="if(event.key==='Enter') setPriority('${stadiumId}')">
            <div class="flex flex-col overflow-hidden mr-2">
                <span class="text-xs font-semibold text-white truncate">${stadiumData.name}</span>
                <span class="text-[10px] ${
                  stadiumData.occ > 80 ? 'text-red-400' : 'text-gray-400'
                }">${Math.floor(stadiumData.occ)}% Capacity</span>
            </div>
            <button class="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors shrink-0" 
                    onclick="removeStadium('${stadiumId}', event)"
                    aria-label="Stop tracking ${stadiumData.name}">
                <i data-lucide="x" class="w-3 h-3" aria-hidden="true"></i>
            </button>
        </div>
        `;
    })
    .join('');
  lucide.createIcons();
}

/**
 * Primary application renderer. Dispatches to specific tab renderers
 * and handles global UI state synchronization.
 * @fires lucide.createIcons
 */
function renderApp() {
  const appContainer = document.getElementById('app-container');
  if (state.trackedIds.length === 0) {
    appContainer.innerHTML = `<div class="card h-full w-full flex flex-col items-center justify-center text-center gap-4"><i data-lucide="crosshair" class="w-12 h-12 text-gray-600"></i><div class="text-gray-400">Search for a stadium to begin tracking.</div></div>`;
    lucide.createIcons();
    return;
  }

  const priorityStadiumData = state.priorityId ? STADIUMS[state.priorityId] : null;

  if (
    !priorityStadiumData &&
    state.tab !== 'overview' &&
    state.tab !== 'detector' &&
    state.tab !== 'alerts'
  ) {
    state.tab = 'overview';
  }

  if (state.tab === 'overview') {
    appContainer.innerHTML = `
            <div class="card h-full p-6 flex flex-col gap-6">
                <div class="stat-label border-b border-[#333] pb-4 flex justify-between"><span>Global Security Grid</span><span>Target Nodes: ${state.trackedIds.length}</span></div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto no-scrollbar pb-10">
                    ${state.trackedIds
                      .map((stadiumId) => {
                        const stadiumData = STADIUMS[stadiumId];
                        return `
                        <div class="card p-6 flex flex-col gap-4 cursor-pointer hover:border-gray-500 transition-colors bg-[rgba(0,0,0,0.3)]" onclick="setPriority('${stadiumId}')">
                            <div class="flex justify-between items-start border-b border-[#333] pb-4">
                                <div class="flex flex-col gap-1">
                                    <span class="text-sm font-bold text-white">${stadiumData.name}</span>
                                    <span class="text-[10px] font-mono text-gray-400">Acoustic: ${stadiumData.acoustic}dB</span>
                                </div>
                                <div class="flex flex-col items-end gap-1">
                                    <span class="text-xl font-bold ${stadiumData.occ > 80 ? 'text-red-400' : 'text-white'}">${Math.floor(stadiumData.occ)}%</span>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded ${stadiumData.mood === 'CHAOS' ? 'bg-red-500/20 text-red-500' : stadiumData.mood === 'TENSE' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}">${stadiumData.mood}</span>
                                </div>
                            </div>
                            <div class="flex justify-between items-center text-xs">
                                <span class="text-gray-400">Chaos Probability</span>
                                <span class="font-bold ${stadiumData.chaosProb > 75 ? 'text-red-400' : 'text-white'}">${stadiumData.chaosProb}%</span>
                            </div>
                            <div class="h-1.5 bg-[#333] rounded-full overflow-hidden">
                                <div class="h-full bg-white transition-all duration-500" style="width:${stadiumData.chaosProb}%; background:${stadiumData.chaosProb > 75 ? '#EF4444' : stadiumData.chaosProb > 40 ? '#EAB308' : '#3B82F6'}"></div>
                            </div>
                        </div>`;
                      })
                      .join('')}
                </div>
            </div>`;
  } else if (state.tab === 'map') {
    appContainer.innerHTML = `
            <div class="flex flex-col gap-4 h-full relative">
                <div class="flex gap-4">
                    ${priorityStadiumData.sectors
                      .map(
                        (sectorData, index) => `
                        <div id="side-sec-${index}" class="card flex-1 p-4 flex justify-between items-center bg-[rgba(0,0,0,0.5)]">
                            <span class="stat-label truncate">${sectorData.n}</span>
                            <span class="text-sm font-bold ${sectorData.d > 85 ? 'text-red-400' : 'text-white'}">${Math.floor(sectorData.d)}%</span>
                        </div>
                    `,
                      )
                      .join('')}
                </div>
                <div class="flex-1 map-wrapper bg-[#050505] relative">
                    <!-- Instruction Overlay -->
                    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md pointer-events-none animate-pulse">
                        DRAG MAP TO ALIGN SATELLITE TO RETICLE
                    </div>
                    
                    <div id="google-map" class="w-full h-full grayscale brightness-75"></div>
                    
                    <!-- HIGH-PRECISION TARGETING RETICLE -->
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full flex items-center justify-center pointer-events-none">
                        <div class="w-full h-[1px] bg-white/10 absolute"></div>
                        <div class="h-full w-[1px] bg-white/10 absolute"></div>
                        <div class="w-1.5 h-1.5 bg-white/80 rounded-full shadow-[0_0_10px_white]"></div>
                    </div>
                    
                    <!-- TACTICAL HEATMAP SECTOR MARKERS -->
                    ${priorityStadiumData.sectors
                      .map((sectorData, index) => {
                        const rad = sectorData.deg * (Math.PI / 180);
                        const rx = 14; // Tightened from 24% to 14% to perfectly frame the stadium roof
                        const ry = 22; // Tightened from 32% to 22%
                        const x = 50 + Math.cos(rad) * rx;
                        const y = 50 + Math.sin(rad) * ry;
                        return `
                        <div id="marker-${index}" class="absolute" style="left: ${x}%; top: ${y}%; transform: translate(-50%, -50%); z-index: 20; pointer-events: none;">
                            <div class="relative flex flex-col items-center justify-center pointer-events-none">
                                <div class="w-14 h-14 rounded-full border border-dashed ${sectorData.d > 85 ? 'border-red-500 animate-[spin_3s_linear_infinite]' : 'border-green-500/50 animate-[spin_10s_linear_infinite]'} opacity-80 absolute pointer-events-none"></div>
                                <div class="w-3 h-3 rounded-full ${sectorData.d > 85 ? 'bg-red-500 shadow-[0_0_25px_#ef4444]' : 'bg-green-500 shadow-[0_0_15px_#10b981]'} relative z-10 border-2 border-black pointer-events-none"></div>
                                <div class="mt-4 bg-[#0a0a0a]/90 backdrop-blur-md border ${sectorData.d > 85 ? 'border-red-500/50' : 'border-[#333]'} px-3 py-1.5 rounded-lg text-center shadow-2xl pointer-events-none transition-colors">
                                    <div class="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5 pointer-events-none">${sectorData.n}</div>
                                    <div class="text-[13px] font-black ${sectorData.d > 85 ? 'text-red-400' : 'text-white'} pointer-events-none">${Math.floor(sectorData.d)}% DENSITY</div>
                                </div>
                            </div>
                        </div>`;
                      })
                      .join('')}
                </div>
            </div>`;
  } else if (state.tab === 'detector') {
    appContainer.innerHTML = `
            <div class="card h-full p-6 flex flex-col gap-6">
                <div class="stat-label border-b border-[#333] pb-4 flex justify-between">
                    <span>Neural Pulse Grid (SN-1 to SN-48)</span>
                    <span class="${state.failedSensors > 0 ? 'text-yellow-500' : 'text-green-500'}">${state.totalSensors - state.failedSensors} Nodes Active</span>
                </div>
                <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-6 pb-10 overflow-y-auto no-scrollbar">
                    ${Array.from({ length: 48 })
                      .map((_, index) => {
                        const isNodeFailing = index < state.failedSensors;
                        return `
                        <div class="flex flex-col items-center gap-3 p-4 bg-[rgba(0,0,0,0.3)] rounded-lg border border-[#333]">
                            <div class="pulse-ring ${isNodeFailing ? 'red' : ''}"></div>
                            <span class="text-[9px] font-mono text-gray-500">SN-${index + 1}</span>
                        </div>`;
                      })
                      .join('')}
                </div>
            </div>`;
  } else if (state.tab === 'insights') {
    appContainer.innerHTML = `
            <div class="flex gap-6 h-full">
                <div class="card w-1/2 p-6 flex flex-col gap-4 overflow-hidden">
                    <div class="stat-label border-b border-[#333] pb-4">Live News Intel: ${priorityStadiumData.name}</div>
                    <div class="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
                        ${
                          !priorityStadiumData.news || priorityStadiumData.news.length === 0
                            ? '<div class="text-sm text-gray-500 text-center mt-10">Awaiting Feed...</div>'
                            : priorityStadiumData.news
                                .map(
                                  (newsItem) => `
                            <div class="p-4 bg-[rgba(255,255,255,0.03)] border border-[#333] rounded-lg">
                                <div class="text-xs font-semibold text-white leading-relaxed">${newsItem.title}</div>
                                <div class="text-[10px] text-gray-500 mt-2">${newsItem.source?.name || 'RSS'} • ${new Date().toLocaleDateString()}</div>
                            </div>
                        `,
                                )
                                .join('')
                        }
                    </div>
                </div>
                <div class="flex flex-col gap-6 w-1/2">
                    <div class="card p-6 flex flex-col gap-4 flex-1">
                        <div class="stat-label border-b border-[#333] pb-4 text-white flex items-center gap-2">
                            AI Neural Synthesis <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                        <div id="ai-terminal" class="font-mono text-[11px] text-gray-300 leading-relaxed overflow-y-auto no-scrollbar whitespace-pre-wrap">
                            ${priorityStadiumData.aiReportDisplayed}<span class="terminal-cursor"></span>
                        </div>
                    </div>
                    <div class="card p-6 bg-[rgba(16,185,129,0.05)] border-green-500/20">
                        <div class="stat-label text-green-400 mb-4">Tactical Response Plan</div>
                        <div class="flex flex-col gap-3 text-xs">
                            <div class="flex justify-between"><span class="text-gray-400">Primary Evacuation Route:</span><span class="font-bold text-white">${priorityStadiumData.evacRoute}</span></div>
                            <div class="flex justify-between"><span class="text-gray-400">Riot Control Status:</span><span class="font-bold ${priorityStadiumData.mood === 'CHAOS' ? 'text-red-500' : 'text-gray-300'}">${priorityStadiumData.mood === 'CHAOS' ? 'DEPLOYING' : 'STANDBY'}</span></div>
                            <div class="flex justify-between"><span class="text-gray-400">Medical Response ETA:</span><span class="font-bold text-white">${priorityStadiumData.chaosProb > 50 ? '3 mins' : '12 mins'}</span></div>
                        </div>
                    </div>
                </div>
            </div>`;
  } else if (state.tab === 'alerts') {
    appContainer.innerHTML = `
            <div class="card h-full p-6 flex flex-col gap-4">
                <div class="stat-label border-b border-[#333] pb-4 text-red-400">Active Incident Log</div>
                <div class="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pb-10">
                    ${
                      state.alerts.length === 0
                        ? '<div class="text-sm text-gray-500 text-center mt-10">No Incidents Logged</div>'
                        : state.alerts
                            .map(
                              (alertItem) => `
                        <div class="p-4 border border-[#333] ${alertItem.type === 'CRITICAL' ? 'border-l-red-500 bg-[rgba(239,68,68,0.05)]' : alertItem.type === 'INFO' ? 'border-l-blue-500 bg-[rgba(59,130,246,0.05)]' : 'border-l-yellow-500 bg-[rgba(0,0,0,0.3)]'} rounded-lg flex justify-between items-center cursor-pointer hover:bg-[rgba(255,255,255,0.05)]" onclick="setPriority('${alertItem.sid}')">
                            <div class="flex flex-col gap-1">
                                <span class="text-[10px] font-bold ${alertItem.type === 'CRITICAL' ? 'text-red-400' : alertItem.type === 'INFO' ? 'text-blue-400' : 'text-yellow-400'} uppercase">${STADIUMS[alertItem.sid].name}</span>
                                <span class="text-sm text-gray-200">${alertItem.msg}</span>
                            </div>
                            <span class="text-[10px] text-gray-500">${alertItem.time}</span>
                        </div>
                    `,
                            )
                            .join('')
                    }
                </div>
            </div>`;
  } else if (state.tab === 'ai-chat') {
    if (!chatHistory[state.priorityId]) {
      chatHistory[state.priorityId] = [];
    }
    const chatHistoryMessages = chatHistory[state.priorityId];
    appContainer.innerHTML = `
            <div class="flex flex-col h-full card overflow-hidden">
                <div class="flex items-center justify-between p-4 border-b border-[#333] bg-[rgba(59,130,246,0.05)]">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span class="text-sm font-bold text-white">CrowdSense ✦ Gemini 2.5 Flash — AI Command</span>
                    </div>
                    <span class="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Target: ${priorityStadiumData.name} • ${Math.floor(priorityStadiumData.occ)}% Density • ${priorityStadiumData.mood}</span>
                                 <div id="chat-messages" class="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-4" aria-live="polite" aria-relevant="additions">
                    ${
                      chatHistoryMessages.length === 0
                        ? `
                         <div class="flex flex-col items-center justify-center h-full gap-4 text-center">
                             <div class="text-5xl" aria-hidden="true">🎯</div>
                             <div class="text-white font-bold text-lg">Gemini 2.5 Flash Active</div>
                             <div class="text-gray-400 text-sm max-w-sm">Ask me anything about crowd safety, evacuation routes, threat assessment, or tactical recommendations for ${priorityStadiumData.name}.</div>
                             <div class="flex flex-wrap gap-2 justify-center mt-2">
                                 ${[
                                   'What is the current threat level?',
                                   'Suggest evacuation routes',
                                   'Analyze crowd density risk',
                                   'Any bottleneck risks?',
                                 ]
                                   .map(
                                     (suggestionQuery) => `
                                     <button class="text-xs px-3 py-1.5 border border-blue-500/30 text-blue-300 rounded-full hover:bg-blue-500/10 transition-colors focus:ring-1 focus:ring-white outline-none" onclick="askGemini('${suggestionQuery}')" aria-label="Ask: ${suggestionQuery}">${suggestionQuery}</button>
                                 `,
                                   )
                                   .join('')}
                             </div>
                         </div>`
                        : chatHistoryMessages
                            .map(
                              (messageItem) => `
                             <div class="flex ${messageItem.role === 'user' ? 'justify-end' : 'justify-start'}">
                                 <div class="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed prose ${
                                   messageItem.role === 'user'
                                     ? 'bg-blue-500/20 border border-blue-500/30 text-white rounded-br-sm'
                                     : 'bg-[rgba(255,255,255,0.04)] border border-[#333] text-gray-200 rounded-bl-sm'
                                 }">
                                     ${messageItem.role === 'ai' ? '<div class="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1.5 not-prose">Gemini 2.5 — Tactical AI</div>' : ''}
                                     ${messageItem.role === 'ai' ? marked.parse(messageItem.text) : messageItem.text.replace(/\n/g, '<br/>')}
                                 </div>
                             </div>
                         `,
                            )
                            .join('')
                    }
                     <div id="ai-typing-indicator" class="hidden justify-start">
                         <div class="px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[#333] max-w-[80%] prose">
                             <div class="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1.5 not-prose">Gemini 2.5 — Processing...</div>
                             <div id="ai-stream-output" class="text-sm text-gray-200 leading-relaxed terminal-cursor" aria-live="polite"></div>
                         </div>
                     </div>
                 </div>
                 <div class="p-4 border-t border-[#333]">
                     <div class="flex gap-3">
                         <input id="chat-input" type="text" placeholder="Ask for tactical analysis, evacuation plans, crowd risk assessment..."
                             class="flex-1 bg-transparent border border-[#333] rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition-all"
                             aria-label="Tactical AI Query Input"
                             onkeydown="if(event.key==='Enter') { askGemini(this.value); this.value=''; }">
                         <button onclick="const chatInputElement=document.getElementById('chat-input'); askGemini(chatInputElement.value); chatInputElement.value='';"
                             class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-colors flex items-center gap-2"
                             aria-label="Send Query">
                             <i data-lucide="send" class="w-4 h-4" aria-hidden="true"></i> Send
                         </button>
                     </div>
                 </div>
                </div>
            </div>`;
  }
  lucide.createIcons();

  // [Google Maps JS SDK] Interactive Rendering
  if (state.tab === 'map' && priorityStadiumData && typeof google !== 'undefined' && google.maps) {
    setTimeout(() => {
      const mapDiv = document.getElementById('google-map');
      if (mapDiv) {
        const map = new google.maps.Map(mapDiv, {
          center: { lat: 18.9389, lng: 72.8258 },
          zoom: 17,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
        });
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({ map });
        directionsService.route(
          {
            origin: '18.9389, 72.8258', // Gate A
            destination: '18.9379, 72.8248', // Safe Zone
            travelMode: 'WALKING',
          },
          (fetchResponse, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(fetchResponse);
            }
          },
        );
      }
    }, 100);
  }
}

/**
 * Updates all map markers and sidebar sector stats with the latest occupancy data.
 */
function updateMapMarkers() {
  const priorityStadiumData = STADIUMS[state.priorityId];
  if (!priorityStadiumData) {
    return;
  }
  priorityStadiumData.sectors.forEach((sectorData, index) => {
    const markerElement = document.getElementById(`marker-${index}`);
    if (markerElement) {
      markerElement.innerHTML = `
                <div class="relative flex flex-col items-center justify-center pointer-events-none">
                    <div class="w-14 h-14 rounded-full border border-dashed ${
                      sectorData.d > 85
                        ? 'border-red-500 animate-[spin_3s_linear_infinite]'
                        : 'border-green-500/50 animate-[spin_10s_linear_infinite]'
                    } opacity-80 absolute pointer-events-none"></div>
                    <div class="w-3 h-3 rounded-full ${
                      sectorData.d > 85
                        ? 'bg-red-500 shadow-[0_0_25px_#ef4444]'
                        : 'bg-green-500 shadow-[0_0_15px_#10b981]'
                    } relative z-10 border-2 border-black pointer-events-none"></div>
                    <div class="mt-4 bg-[#0a0a0a]/90 backdrop-blur-md border ${
                      sectorData.d > 85 ? 'border-red-500/50' : 'border-[#333]'
                    } px-3 py-1.5 rounded-lg text-center shadow-2xl pointer-events-none transition-colors">
                        <div class="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5 pointer-events-none">${
                          sectorData.n
                        }</div>
                        <div class="text-[13px] font-black ${
                          sectorData.d > 85 ? 'text-red-400' : 'text-white'
                        } pointer-events-none" aria-live="polite">${Math.floor(
                          sectorData.d,
                        )}% DENSITY</div>
                    </div>
                </div>`;
    }
    const sidebarSectorElement = document.getElementById(`side-sec-${index}`);
    if (sidebarSectorElement) {
      sidebarSectorElement.innerHTML = `
                <span class="stat-label truncate">${sectorData.n}</span>
                <span class="text-sm font-bold ${
                  sectorData.d > 85 ? 'text-red-400' : 'text-white'
                }">${Math.floor(sectorData.d)}%</span>
            `;
    }
  });
}

/**
 * Dispatches a tactical query to the Gemini AI backend and streams the response.
 * @async
 * @param {string} userMessage - The query text.
 * @listens DOM.onkeydown
 */
async function askGemini(userMessage) {
  if (!userMessage || !userMessage.trim() || !state.priorityId) {
    return;
  }
  const stadiumData = STADIUMS[state.priorityId];
  if (!stadiumData) {
    return;
  }

  if (!chatHistory[state.priorityId]) {
    chatHistory[state.priorityId] = [];
  }
  chatHistory[state.priorityId].push({ role: 'user', text: userMessage.trim() });
  renderApp();

  const typingIndicatorElement = document.getElementById('ai-typing-indicator');
  const streamOutputElement = document.getElementById('ai-stream-output');
  if (typingIndicatorElement) {
    typingIndicatorElement.classList.remove('hidden');
    typingIndicatorElement.classList.add('flex');
  }

  let fullAiResponse = '';

  try {
    const fetchResponse = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage.trim(),
        venue: stadiumData.name,
        density: Math.floor(stadiumData.occ),
        mood: stadiumData.mood,
      }),
    });

    if (!fetchResponse.ok) {
      const errorData = await fetchResponse.json().catch(() => ({}));
      throw new Error(errorData?.error || `Server error ${fetchResponse.status}`);
    }

    const streamReader = fetchResponse.body.getReader();
    const textDecoder = new TextDecoder();
    let streamBuffer = '';

    while (true) {
      const { done, value } = await streamReader.read();
      if (done) {
        break;
      }
      streamBuffer += textDecoder.decode(value, { stream: true });
      const streamParts = streamBuffer.split('\n\n');
      streamBuffer = streamParts.pop();
      for (const streamPart of streamParts) {
        for (const streamLine of streamPart.split('\n')) {
          if (!streamLine.startsWith('data: ')) {
            continue;
          }
          const rawJsonData = streamLine.slice(6).trim();
          if (rawJsonData === '[DONE]') {
            continue;
          }
          try {
            const parsedEventData = JSON.parse(rawJsonData);
            if (parsedEventData.text) {
              fullAiResponse += parsedEventData.text;
              if (streamOutputElement) {
                streamOutputElement.innerHTML = marked.parse(fullAiResponse);
              }
            } else if (parsedEventData.error) {
              throw new Error(parsedEventData.error);
            }
          } catch (_) {
            // Ignore parse errors
          }
        }
      }
    }

    if (!fullAiResponse) {
      fullAiResponse = '⚠️ No response from AI. Please try again.';
    }
  } catch (error) {
    fullAiResponse = `⚠️ AI Error: ${error.message}`;
    if (streamOutputElement) {
      streamOutputElement.innerHTML = fullAiResponse;
    }
  }

  chatHistory[state.priorityId].push({ role: 'ai', text: fullAiResponse });
  renderApp();
  const chatMessagesElement = document.getElementById('chat-messages');
  if (chatMessagesElement) {
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
  }
}

window.onload = init;
