import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Service for interacting with Google Gemini AI.
 * Encapsulates prompt engineering and streaming logic.
 */
export const GeminiService = {
    /**
     * Streams a tactical security assessment from Gemini.
     * 
     * @param {Object} params - The context for the AI.
     * @param {string} params.message - The operator's query.
     * @param {string} params.venue - Name of the stadium/venue.
     * @param {number} params.density - Current crowd occupancy percentage.
     * @param {string} params.mood - Current detected atmosphere (e.g., CALM, TENSE).
     * @param {Object} res - Express response object for streaming.
     * @returns {Promise<void>}
     */
    /**
     * Streams a tactical narration based on pre-computed analytical data.
     * 
     * @param {Object} params - The analytical context.
     * @param {string} params.message - The operator's query.
     * @param {Object} params.analysis - Pre-computed analysis from CrowdAnalyticsService.
     * @param {Object} res - Express response object.
     */
    async streamNarration({ message, analysis }, res) {
        const contextualPrompt = `You are CrowdSense AI, a tactical narrator. Your job is to PHRASE and COMMUNICATE the following pre-computed security data to the operator. Do NOT run your own calculations.

DATA FEED:
- Bottlenecks: ${JSON.stringify(analysis.bottlenecks)}
- Recommended Evacuation: ${analysis.evacuation_route}
- Risk Level: ${analysis.overall_risk}

OPERATOR QUERY: ${message}

Provide a concise, professional verbal readout of this data.`;

        try {
            const stream = await model.generateContentStream(contextualPrompt);
            for await (const chunk of stream.stream) {
                const text = chunk.text();
                if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
            res.write(`data: [DONE]\n\n`);
            res.end();
        } catch (error) {
            console.error('[GeminiService Error]', error.message);
            res.write(`data: ${JSON.stringify({ error: 'Narration Engine unavailable.' })}\n\n`);
            res.end();
        }
    }
};
