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
