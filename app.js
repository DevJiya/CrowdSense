// ── APP.JS — SPA Navigation & Global Handlers ──

// Expose functions globally for explicit HTML handlers
window.navigate = navigate;
window.handleSend = handleSend;
window.runDetector = runDetector;

document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Neural Router Online...");
  // Start with Home
  navigate('landing');
});

function navigate(sectionId) {
  console.log(`Neural Route -> ${sectionId}`);
  
  // 1. Update Navigation Links (by data-section attribute)
  document.querySelectorAll('.nav-item').forEach(n => {
    const section = n.getAttribute('data-section');
    n.classList.toggle('active', section === sectionId);
  });

  // 2. Update Content Sections
  document.querySelectorAll('.page-section').forEach(s => {
    s.classList.toggle('active', s.id === sectionId);
  });

  // 3. Hot-Reload Tab Logic
  if (sectionId === 'map' && typeof initMap === 'function') {
    initMap();
  }
  if (sectionId === 'trust' && typeof renderTrustPanel === 'function') {
    renderTrustPanel();
  }
  if (sectionId === 'safety' && typeof window.syncUI === 'function') {
    window.syncUI();
  }
}

// ── AI ASSISTANT ──
function handleSend() {
  const input = document.getElementById('chat-input');
  const text = input.value ? input.value.trim() : "";
  if (!text) return;
  input.value = '';

  appendChatMsg(text, 'user');
  
  setTimeout(() => {
    const reply = generateAIResponse(text);
    appendChatMsg(reply, 'ai');
  }, 600);
}

function appendChatMsg(text, role) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `
    <div style="font-size: 0.6rem; opacity: 0.5; margin-bottom: 4px; font-weight: 800;">
      ${role === 'ai' ? 'NEURAL' : 'USER'}
    </div>
    ${text}
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function generateAIResponse(query) {
  const q = query.toLowerCase();
  const state = window.GLOBAL_STATE;
  if (!state) return "Syncing sensors...";
  
  if (q.includes('crowd') || q.includes('bheed') || q.includes('haal')) {
    const riskyCount = Object.keys(state.zones).filter(id => state.zones[id].status === 'RISKY').length;
    return `Venue <b>${state.currentStadium.toUpperCase()}</b> analysis: <br/>Density is ${state.venue.density}. <br/>${riskyCount > 0 ? `⚠️ ${riskyCount} risky zones detected.` : '✅ No congestion detected.'}`;
  }
  
  if (q.includes('safe') || q.includes('exit') || q.includes('niklo')) {
    const safeOnes = Object.keys(state.zones).filter(id => state.zones[id].status === 'SAFE');
    return `Safest routes detected: <b>${safeOnes.slice(0, 2).join(', ')}</b>.`;
  }

  return "Monitoring live sensors. Ask about <b>crowd</b> or <b>safe exits</b>.";
}

// ── TRUST PANEL ──
function renderTrustPanel() {
  const container = document.getElementById('trust-grid');
  const state = window.GLOBAL_STATE;
  if (!container || !state || !state.zones) return;

  container.innerHTML = Object.keys(state.zones).map(id => {
    const z = state.zones[id];
    return `
      <div class="glass p-6">
        <div class="card-label">${z.name} Reliability</div>
        <div style="font-size: 2rem; font-weight: 800; color: var(--accent);">${Math.round(z.trust)}%</div>
        <div style="height: 4px; background: rgba(0,0,0,0.2); margin-top: 10px; border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; width: ${z.trust}%; background: var(--accent);"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ── DETECTOR ──
function runDetector() {
  const verdict = document.getElementById('det-verdict');
  const input = document.getElementById('det-input');
  if (!verdict || !input || !input.value) return;

  verdict.innerHTML = `<div style="font-size: 0.8rem; opacity: 0.6;">Analyzing signal pulse...</div>`;
  
  setTimeout(() => {
    const isFake = input.value.toLowerCase().includes('bomb') || input.value.toLowerCase().includes('fire');
    if (isFake) {
      verdict.innerHTML = `<div class="p-4 border border-red-500/30 text-red-500 rounded-xl">🚨 ANOMALY: Signal mismatched with local sensors. Suppressing.</div>`;
    } else {
      verdict.innerHTML = `<div class="p-4 border border-green-500/30 text-green-500 rounded-xl">✅ VERIFIED: Signal matches telemetry.</div>`;
    }
  }, 1000);
}
