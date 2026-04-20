import { BigQuery } from '@google-cloud/bigquery';

let bigqueryClient;

try {
    bigqueryClient = new BigQuery();
} catch (err) {
    console.warn('BigQuery initialization failed. Running in degraded mode.', err.message);
}

const DATASET_ID = 'crowdsense_analytics';
const TABLE_ID = 'event_logs';

/**
 * Logs real-time events to Google Cloud BigQuery.
 * 
 * @param {string} eventType - The category of the event
 * @param {Object} eventData - JSON payload
 */
export async function logAnalyticsEvent(eventType, eventData) {
    if (!bigqueryClient) return; // Fail gracefully if no credentials
    
    try {
        const row = {
            timestamp: new Date().toISOString(),
            event_type: eventType,
            payload: JSON.stringify(eventData)
        };
        
        await bigqueryClient
            .dataset(DATASET_ID)
            .table(TABLE_ID)
            .insert([row]);
            
        console.log(`[BigQuery] Logged event: ${eventType}`);
    } catch (err) {
        console.error('[BigQuery] Failed to insert row:', err.message);
    }
}
