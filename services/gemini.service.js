import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const GeminiService = {
    /**
     * Streams a tactical narration of analytics results.
     * @param {Object} data - { message, analysis, language }
     * @param {Object} res - Express response object.
     */
    async streamNarration({ message, analysis, language = 'English' }, res) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
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
            const result = await model.generateContentStream(prompt);
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            for await (const chunk of result.stream) {
                const text = chunk.text();
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }

            res.write('data: [DONE]\n\n');
            res.end();
        } catch (error) {
            console.error('[Gemini Error]', error.message);
            res.write(`data: ${JSON.stringify({ error: 'AI narration failed' })}\n\n`);
            res.end();
        }
    }
};
