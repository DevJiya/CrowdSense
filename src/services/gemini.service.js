/**
 * @module GeminiService
 * @description Interfaces with Google Gemini AI to provide real-time,
 * tactical narrations of crowd analytics data via Server-Sent Events (SSE).
 * @requires @google/generative-ai
 * @requires dotenv
 */

import { GoogleGenerativeAI } from '@google-cloud/generative-ai';
import dotenv from 'dotenv';

import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/ErrorCodes.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const GeminiService = {
  /**
   * Streams a tactical narration of analytics results to the client using SSE.
   * @async
   * @param {Object} narrationPayload - The data needed for narration.
   * @param {string} narrationPayload.message - The user's specific query or request.
   * @param {Object} narrationPayload.analysis - The bottleneck analysis data from CrowdAnalyticsService.
   * @param {string} [narrationPayload.language='English'] - The language for the AI response.
   * @param {Object} httpResponse - Express response object for streaming.
   * @returns {Promise<void>} Resolves when the stream is completed or closed.
   * @throws {AppError} If the Gemini API call fails or the stream is interrupted.
   */
  async streamNarration({ message, analysis, language = 'English' }, httpResponse) {
    if (!process.env.GEMINI_API_KEY || process.env.MOCK_MODE === 'true') {
      httpResponse.setHeader('Content-Type', 'text/event-stream');
      httpResponse.write(
        `data: ${JSON.stringify({ text: '[MOCK AI] Tactical assessment: Crowd density is nominal. All gates operational.' })}\n\n`,
      );
      httpResponse.write('data: [DONE]\n\n');
      httpResponse.end();
      return;
    }

    const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const tacticalPrompt = `
            You are the CrowdSense AI Tactical Assistant.
            
            CONTEXT:
            - Venue: ${analysis.venue || 'Active Stadium'}
            - Risk Level: ${analysis.overall_risk}
            - Bottlenecks: ${JSON.stringify(analysis.bottlenecks)}
            - Evacuation Route: ${analysis.evacuation_route}
            
            USER QUERY: "${message}"
            
            TASK:
            1. Respond in ${language}.
            2. Provide a concise, tactical assessment.
            3. Use a professional, security-oriented tone.
            4. Keep it under 100 words.
        `;

    try {
      const aiContentStream = await aiModel.generateContentStream(tacticalPrompt);
      httpResponse.setHeader('Content-Type', 'text/event-stream');
      httpResponse.setHeader('Cache-Control', 'no-cache');
      httpResponse.setHeader('Connection', 'keep-alive');

      for await (const streamChunk of aiContentStream.stream) {
        const chunkText = streamChunk.text();
        httpResponse.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }

      httpResponse.write('data: [DONE]\n\n');
      httpResponse.end();
    } catch (error) {
      throw new AppError(
        'Gemini AI narration failed',
        500,
        ErrorCodes.EXTERNAL_SERVICE_FAILURE,
        true,
        {
          service: 'Gemini',
          originalError: error.message,
        },
      );
    }
  },
};
