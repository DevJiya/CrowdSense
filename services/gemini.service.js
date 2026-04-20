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
    async streamTacticalAssessment({ message, venue, density, mood }, res) {
        const contextualPrompt = `You are CrowdSense AI, an expert tactical intelligence analyst for stadium crowd safety. Give concise, actionable security assessments. Use CAPITALS for critical risks.

VENUE CONTEXT:
- Venue: ${venue}
- Current Crowd Density: ${density}%
- System Mood Alert: ${mood}

OPERATOR QUERY: ${message}

Provide a tactical assessment and direct response.`;

        try {
            const stream = await model.generateContentStream(contextualPrompt);
            for await (const chunk of stream.stream) {
                const text = chunk.text();
                if (text) {
                    res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
            }
            res.write(`data: [DONE]\n\n`);
            res.end();
        } catch (error) {
            console.error('[GeminiService Error]', error.message);
            res.write(`data: ${JSON.stringify({ error: 'Tactical Intelligence Engine temporarily unavailable.' })}\n\n`);
            res.end();
        }
    }
};
