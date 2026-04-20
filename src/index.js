/**
 * @module ServerEntry
 * @description Entry point for the CrowdSense AI server. Orchestrates the
 * startup of the Express application on the designated port.
 * @requires app
 */

import app from './app.js';
import { logger } from './config/logger.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`CrowdSense API v2.0.0 is live on port ${PORT}`, {
    env: process.env.NODE_ENV,
    docs: `http://localhost:${PORT}/docs`,
  });
});
