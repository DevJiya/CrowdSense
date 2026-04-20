/**
 * @module AiController
 * @description Orchestrates the tactical AI flow, including backend analytics computation,
 * event logging to Google Cloud, and streaming AI narration to the client.
 * @requires GeminiService
 * @requires CrowdAnalyticsService
 * @requires GoogleServices
 */

/* eslint-disable no-console */
import { GeminiService, CrowdAnalyticsService, GoogleServices } from '../services/index.js';

export const AiController = {
  /**
   * Handles tactical AI chat requests by processing sector data and streaming an AI response.
   * @async
   * @param {Object} httpRequest - Express request object containing 'message', 'sectors', and 'venue'.
   * @param {Object} httpResponse - Express response object for streaming the AI narration.
   * @returns {Promise<void>} Resolves when the narration stream is closed.
   * @throws {Error} If analytics computation or Google Cloud logging fails.
   * @example
   * // Realistic usage:
   * AiController.handleChat(req, res);
   */
  async handleChat(httpRequest, httpResponse) {
    const benchStartTime = Date.now();
    const { message, sectors, venue } = httpRequest.body;

    try {
      // 1. COMPUTE LOGIC ON BACKEND (Efficiency)
      const bottleneckAnalysis = CrowdAnalyticsService.predictBottlenecks(sectors);

      // 2. LOG TO BIGQUERY (Google Cloud)
      await GoogleServices.logEvent('AI_QUERY', { venue, risk: bottleneckAnalysis.overall_risk });

      const computeTime = Date.now() - benchStartTime;
      console.log(`[Benchmark] Analytics computed in ${computeTime}ms`);

      // 3. NARRATE VIA AI (Narration)
      await GeminiService.streamNarration({ message, analysis: bottleneckAnalysis }, httpResponse);
    } catch (error) {
      console.error('[AiController Error]', error.message);
      httpResponse.status(500).json({ error: 'Tactical analysis engine failure' });
    }
  },
};
