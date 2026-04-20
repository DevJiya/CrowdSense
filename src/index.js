/**
 * @module ServerEntry
 * @description Entry point for the CrowdSense AI server. Orchestrates the
 * startup of the Express application on the designated port.
 * @requires app
 */

/* eslint-disable no-console */
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
    🚀 CrowdSense AI — Tactical Intel Grid Active
    🛡️  Security: Hardened (Helmet + Rate Limits)
    🛰️  Nodes: Online
    🌐  Endpoint: http://localhost:${PORT}
    `);
});
