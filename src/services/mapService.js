/**
 * @module MapService
 * @description Neural Stadium Map Visualizer. Handles the initialization and
 * periodic updates of the SVG-based tactical map, visualizing zone density and status.
 * @requires GLOBAL_STATE
 */

// -- MAP.JS -- Neural Stadium Map Visualizer --

/**
 * Initializes the tactical stadium map.
 * @fires init
 */
export function initMap() {
  if (typeof document === 'undefined') {
    return;
  }
  const mapContainerElement = document.getElementById('stadium-map');
  if (!mapContainerElement) {
    return;
  }

  mapContainerElement.innerHTML = `
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

/**
 * Updates the map zones SVG elements based on the current global state.
 */
function updateMapZones() {
  if (typeof document === 'undefined') {
    return;
  }
  const mapLayerElement = document.getElementById('map-zones-layer');
  if (!mapLayerElement) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }
  const venueState = window.GLOBAL_STATE;
  const zoneIds = Object.keys(venueState.zones);

  // Simple layout logic for zones
  const stadiumLayoutData = [
    { x: 40, y: 10, w: 20, h: 15 }, // Top
    { x: 40, y: 75, w: 20, h: 15 }, // Bottom
    { x: 10, y: 35, w: 15, h: 30 }, // Left
    { x: 75, y: 35, w: 15, h: 30 }, // Right
    { x: 28, y: 30, w: 10, h: 15 }, // Inner TL
    { x: 62, y: 30, w: 10, h: 15 }, // Inner TR
  ];

  mapLayerElement.innerHTML = zoneIds
    .map((zoneId, i) => {
      const zoneData = venueState.zones[zoneId];
      const layoutCoords = stadiumLayoutData[i % stadiumLayoutData.length];
      const statusColor =
        zoneData.status === 'RISKY'
          ? 'var(--danger)'
          : zoneData.status === 'MODERATE'
            ? 'var(--warn)'
            : 'var(--safe)';

      return `
      <g style="cursor: pointer;" onclick="navigate('assistant')">
        <rect x="${layoutCoords.x}" y="${layoutCoords.y}" width="${layoutCoords.w}" height="${
          layoutCoords.h
        }" rx="4" 
              fill="${statusColor}" fill-opacity="0.1" stroke="${statusColor}" stroke-width="0.5" />
        <text x="${layoutCoords.x + layoutCoords.w / 2}" y="${
          layoutCoords.y + layoutCoords.h / 2
        }" fill="#fff" font-size="2.5" text-anchor="middle" font-weight="700">${
          zoneData.name
        }</text>
        <text x="${layoutCoords.x + layoutCoords.w / 2}" y="${
          layoutCoords.y + layoutCoords.h / 2 + 4
        }" fill="#71717a" font-size="2" text-anchor="middle">${Math.round(zoneData.density)}%</text>
      </g>
    `;
    })
    .join('');
}
