/**
 * @module GeminiService
 * @description Interfaces with Google Gemini AI to provide real-time,
 * tactical narrations of crowd analytics data via Server-Sent Events (SSE).
 * @requires @google/generative-ai
 * @requires dotenv
 */

/* eslint-disable no-console */
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

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
   * @throws {Error} If the Gemini API call fails or the stream is interrupted.
   * @example
   * await GeminiService.streamNarration({ message: "Status check", analysis: bottleneckData }, res);
   */
  async streamNarration({ message, analysis, language = 'English' }, httpResponse) {
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
      console.error('[Gemini Error]', error.message);
      httpResponse.write(`data: ${JSON.stringify({ error: 'AI narration failed' })}\n\n`);
      httpResponse.end();
    }
  },
};
