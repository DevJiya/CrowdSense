// ── MAP.JS — Neural Stadium Map Visualizer ──

export function initMap() {
  const container = document.getElementById('stadium-map');
  if (!container) {
    return;
  }

  container.innerHTML = `
    <svg viewBox="0 0 100 100" style="width:100%; height:100%; border-radius: 20px; background: rgba(0,0,0,0.3);">
      <!-- Field -->
      <rect x="35" y="35" width="30" height="30" rx="15" fill="none" stroke="rgba(255,255,255,0.1)" stroke-dasharray="2,2" />
      <text x="50" y="52" fill="rgba(255,255,255,0.2)" font-size="3" text-anchor="middle" font-weight="800">CENTRE FIELD</text>
      
      <!-- Zone Rectangles (Neural Grid) -->
      <g id="map-zones-layer"></g>

      <!-- Scanning Laser -->
      <line id="map-laser" x1="0" y1="0" x2="100" y2="0" stroke="var(--accent)" stroke-width="0.2" opacity="0.5">
        <animate attributeName="y1" from="0" to="100" dur="4s" repeatCount="indefinite" />
        <animate attributeName="y2" from="0" to="100" dur="4s" repeatCount="indefinite" />
      </line>
    </svg>
  `;

  updateMapZones();
  setInterval(updateMapZones, 4000);
}

function updateMapZones() {
  const layer = document.getElementById('map-zones-layer');
  if (!layer) {
    return;
  }

  const state = window.GLOBAL_STATE;
  const zoneKeys = Object.keys(state.zones);

  // Simple layout logic for zones
  const layout = [
    { x: 40, y: 10, w: 20, h: 15 }, // Top
    { x: 40, y: 75, w: 20, h: 15 }, // Bottom
    { x: 10, y: 35, w: 15, h: 30 }, // Left
    { x: 75, y: 35, w: 15, h: 30 }, // Right
    { x: 28, y: 30, w: 10, h: 15 }, // Inner TL
    { x: 62, y: 30, w: 10, h: 15 }, // Inner TR
  ];

  layer.innerHTML = zoneKeys
    .map((id, i) => {
      const z = state.zones[id];
      const l = layout[i % layout.length];
      const color =
        z.status === 'RISKY'
          ? 'var(--danger)'
          : z.status === 'MODERATE'
            ? 'var(--warn)'
            : 'var(--safe)';

      return `
      <g style="cursor: pointer;" onclick="navigate('assistant')">
        <rect x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" rx="4" 
              fill="${color}" fill-opacity="0.1" stroke="${color}" stroke-width="0.5" />
        <text x="${l.x + l.w / 2}" y="${l.y + l.h / 2}" fill="#fff" font-size="2.5" text-anchor="middle" font-weight="700">${z.name}</text>
        <text x="${l.x + l.w / 2}" y="${l.y + l.h / 2 + 4}" fill="#71717a" font-size="2" text-anchor="middle">${Math.round(z.density)}%</text>
      </g>
    `;
    })
    .join('');
}
