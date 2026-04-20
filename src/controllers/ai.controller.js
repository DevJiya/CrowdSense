/**
 * @module AiController
 * @description Orchestrates the tactical AI flow, including backend analytics computation,
 * event logging to Google Cloud, and streaming AI narration to the client.
 * @requires GeminiService
 * @requires CrowdAnalyticsService
 * @requires GoogleServices
 */

import { logger } from '../config/logger.js';
import { GeminiService, CrowdAnalyticsService, GoogleServices } from '../services/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const AiController = {
  /**
   * Handles tactical AI chat requests by processing sector data and streaming an AI response.
   * @async
   * @param {Object} httpRequest - Express request object containing 'message', 'sectors', and 'venue'.
   * @param {Object} httpResponse - Express response object for streaming the AI narration.
   */
  handleChat: asyncHandler(async (httpRequest, httpResponse) => {
    const benchStartTime = Date.now();
    const { message, sectors, venue } = httpRequest.body;

    // 1. COMPUTE LOGIC ON BACKEND (Efficiency)
    const bottleneckAnalysis = CrowdAnalyticsService.predictBottlenecks(sectors);

    // 2. LOG TO BIGQUERY (Google Cloud)
    await GoogleServices.logEvent('AI_QUERY', { venue, risk: bottleneckAnalysis.overall_risk });

    const computeTime = Date.now() - benchStartTime;
    logger.info('Tactical AI analytics computed', { computeTime: `${computeTime}ms` });

    // 3. NARRATE VIA AI (Narration)
    await GeminiService.streamNarration({ message, analysis: bottleneckAnalysis }, httpResponse);
  }),
};
