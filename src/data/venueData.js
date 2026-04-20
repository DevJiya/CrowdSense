// ── MOCK BACKEND DATA LAYER ──
// Simulates a real-time Firebase / backend data feed

export const ZONES = [
  { id: 'main-entrance', name: 'Main Entrance', type: 'entry',   level: 'congested', wait: 18, x: 350, y: 40,  r: 28 },
  { id: 'gate-2',        name: 'Gate 2 (North)', type: 'exit',   level: 'clear',     wait: 2,  x: 580, y: 130, r: 22 },
  { id: 'gate-3',        name: 'Gate 3 (East)',  type: 'exit',   level: 'moderate',  wait: 8,  x: 620, y: 290, r: 22 },
  { id: 'gate-4',        name: 'Gate 4 (West)',  type: 'exit',   level: 'clear',     wait: 1,  x: 110, y: 290, r: 22 },
  { id: 'food-104',      name: 'Food · Sec 104', type: 'food',   level: 'congested', wait: 15, x: 490, y: 190, r: 20 },
  { id: 'food-115',      name: 'Food · Sec 115', type: 'food',   level: 'clear',     wait: 0,  x: 195, y: 190, r: 20 },
  { id: 'wc-a',          name: 'Washroom A',     type: 'rest',   level: 'moderate',  wait: 6,  x: 290, y: 390, r: 16 },
  { id: 'wc-b',          name: 'Washroom B',     type: 'rest',   level: 'clear',     wait: 0,  x: 450, y: 390, r: 16 },
  { id: 'merch',         name: 'Merchandise',    type: 'other',  level: 'moderate',  wait: 10, x: 350, y: 220, r: 24 },
  { id: 'medic',         name: 'Medical Bay',    type: 'safety', level: 'clear',     wait: 0,  x: 120, y: 140, r: 16 },
];

export const REPORTS = [
  { user: 'alex_k', report: 'Gate 3 is completely blocked', verdict: 'blocked',   score: 310, color: 'red' },
  { user: 'priya_m', report: 'Washroom B is empty right now', verdict: 'helpful', score: 870, color: 'green' },
  { user: 'tom_r',  report: 'Food at Sec 104 has a 15-min wait', verdict: 'helpful', score: 740, color: 'green' },
  { user: 'anon_7', report: 'There is a fire near Gate 2!', verdict: 'blocked',   score: 120, color: 'red' },
  { user: 'sara_v', report: 'Food at Sec 115 is totally free', verdict: 'helpful', score: 910, color: 'green' },
  { user: 'mike_9', report: 'West corridor very crowded', verdict: 'neutral',     score: 540, color: 'gray' },
  { user: 'rina_d', report: 'Merch stand queue moving fast', verdict: 'helpful',  score: 680, color: 'green' },
  { user: 'anon_3', report: 'Entire east wing blocked!', verdict: 'misleading',   score: 210, color: 'red' },
];

export const ALERTS_FEED = [
  { type: 'verified', text: 'Food stand at Section 115 has zero wait time. Verified by 6 Trusted Reporters.', source: 'AI Verified · 2 min ago' },
  { type: 'safety',   text: 'Medical staff deployed near Section 108. Area is secured and clear.', source: 'Venue Security · 5 min ago' },
  { type: 'blocked',  text: 'Report "Fire near Gate 2" has been suppressed — unverified and panic-inducing.', source: 'AI Blocked · 7 min ago' },
  { type: 'crowd',    text: 'Main Entrance congestion rising. AI recommends Gate 4 (West) — currently clear.', source: 'CrowdSense AI · 9 min ago' },
  { type: 'verified', text: 'Gate 3 is NOT blocked. Earlier report was flagged as misleading (TruthScore: 120).', source: 'AI Verified · 11 min ago' },
  { type: 'crowd',    text: 'Post-match exit surge expected in ~20 minutes. Plan your route now.', source: 'Predictive AI · 15 min ago' },
];

export const ACTIVITY_LOG = [
  { type: 'pos', icon: '+15', text: 'Report "Food Sec 115 is clear" verified accurate', time: '9m ago' },
  { type: 'pos', icon: '+15', text: 'Report "Gate 4 is clear" verified accurate', time: '23m ago' },
  { type: 'pos', icon: '+5',  text: 'New report submitted: Washroom B empty', time: '31m ago' },
  { type: 'neg', icon: '−20', text: 'Report "Main Exit blocked" flagged — inaccurate', time: '1h ago' },
  { type: 'pos', icon: '+15', text: 'Report "Merch queue fast" verified accurate', time: '1h 20m ago' },
];

// AI Response engine map
export const AI_RESPONSES = [
  {
    match: ['exit', 'leave', 'out', 'way out', 'escape'],
    tag: 'verified',
    response: '<span class="tag verified">✓ VERIFIED</span>Gate 2 (North) is your fastest exit — currently clear, estimated 2-min walk from your position. Gate 4 (West) is also clear. Avoid the Main Entrance — 18-min wait confirmed by 9 reporters.'
  },
  {
    match: ['food', 'eat', 'burger', 'hotdog', 'hungry', 'drink'],
    tag: 'verified',
    response: '<span class="tag verified">✓ VERIFIED</span>Section 115 food stand has zero wait right now. Section 104 has a 15-minute queue — confirmed congested. Head to Sec 115: save ~15 minutes.'
  },
  {
    match: ['bathroom', 'washroom', 'toilet', 'restroom', 'wc'],
    tag: 'verified',
    response: '<span class="tag verified">✓ VERIFIED</span>Washroom B (near Section 116) is completely empty — confirmed clear 4 minutes ago by a Trusted Reporter. Washroom A has a 6-minute queue.'
  },
  {
    match: ['quiet', 'chill', 'relax', 'less crowded', 'calm', 'peaceful'],
    tag: 'verified',
    response: '<span class="tag verified">✓ VERIFIED</span>The Medical Bay area (North West, Section 103) is the least crowded zone right now — low foot traffic, seating available. Gate 4 corridor is also quiet.'
  },
  {
    match: ['gate 3', 'blocked', 'gate3'],
    tag: 'verified',
    response: '<span class="tag verified">✓ AI FACT-CHECK</span>Gate 3 is NOT blocked. An earlier report claiming blockage was flagged as misleading (that user\'s TruthScore is 120 — unreliable). Gate 3 shows moderate crowd flow — 8 min wait.'
  },
  {
    match: ['fire', 'emergency', 'danger', 'panic', 'run', 'evacuate'],
    tag: 'blocked',
    response: '<span class="tag blocked">⊘ BEHAVIOR ANALYSIS TRIGGERED</span>No verified safety incidents detected. Security has been automatically notified to check your zone. Please remain calm — panic-inducing unverified claims are suppressed. Follow official venue announcements only.'
  },
  {
    match: ['safe', 'safe route', 'safest'],
    tag: 'verified',
    response: '<span class="tag verified">✓ VERIFIED</span>The safest and least crowded route right now: your position → North corridor → Gate 2. Zero congestion points on this path. Estimated 4-minute walk.'
  },
  {
    match: ['merch', 'merchandise', 'shop', 'store', 'buy'],
    tag: 'verified',
    response: '<span class="tag verified">✓ VERIFIED</span>The merchandise stand has moderate traffic — about 10-minute wait. A Trusted Reporter mentioned the queue is moving fast. Best time: 20 minutes before halftime ends.'
  },
];

export const DEFAULT_AI_RESPONSE = '<span class="tag analyzing">◎ ANALYZING</span>I\'m cross-referencing live crowd data for your query. Based on current conditions, all major exit routes are operational. Gate 2 and Gate 4 are clearest. Food at Sec 115 is available with no wait.';
