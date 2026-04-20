import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Validates initialization of the Generative AI client.
 * Uses official Google SDK.
 */
function getAIClient() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in the environment.');
    }
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Builds the tactical system prompt injected into the AI context.
 * 
 * @param {string} venue - Name of the venue
 * @param {number} density - Current occupancy percentage
 * @param {string} mood - Current calculated mood state
 * @param {string} message - User query
 * @returns {string} The fully compiled prompt text
 */
function buildTacticalPrompt(venue, density, mood, message) {
    return `You are CrowdSense AI, an expert tactical intelligence analyst for stadium crowd safety. Give concise, actionable security assessments. Use CAPITALS for critical risks.

VENUE CONTEXT:
- Venue: ${venue}
- Current Crowd Density: ${density}%
- System Mood Alert: ${mood}

OPERATOR QUERY: ${message}

Provide a tactical assessment and direct response.`;
}

/**
 * Streams the response from Gemini based on venue context.
 * Uses the official Google Generative AI SDK, bypassing raw fetch calls.
 * 
 * @param {Object} context - Venue metrics context
 * @param {string} context.message - User prompt
 * @param {string} context.venue - Venue name
 * @param {number} context.density - Occupancy density
 * @param {string} context.mood - Mood string
 * @returns {Promise<any>} An async iterable stream of text chunks
 */
export async function streamTacticalAIResponse({ message, venue, density, mood }) {
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = buildTacticalPrompt(venue, density, mood, message);
    
    // Use the official SDK generateContentStream
    const streamResult = await model.generateContentStream(prompt);
    return streamResult.stream;
}
