import { GeminiService } from '../services/gemini.service.js';
import { CrowdAnalyticsService } from '../services/crowd.analytics.service.js';
import { GoogleServices } from '../services/google.service.js';

export const AiController = {
    /**
     * Handles tactical AI chat requests.
     */
    async handleChat(req, res) {
        const start = Date.now();
        const { message, sectors, venue } = req.body;

        try {
            // 1. COMPUTE LOGIC ON BACKEND (Efficiency)
            const analysis = CrowdAnalyticsService.predictBottlenecks(sectors);
            
            // 2. LOG TO BIGQUERY (Google Cloud)
            await GoogleServices.logEvent('AI_QUERY', { venue, risk: analysis.overall_risk });

            const computeTime = Date.now() - start;
            console.log(`[Benchmark] Analytics computed in ${computeTime}ms`);

            // 3. NARRATE VIA AI (Narration)
            await GeminiService.streamNarration({ message, analysis }, res);
        } catch (error) {
            console.error('[AiController Error]', error.message);
            res.status(500).json({ error: 'Tactical analysis engine failure' });
        }
    }
};
