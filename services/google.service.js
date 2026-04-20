import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const bq = new BigQuery();
const storage = new Storage();
const db = admin.database();

export const GoogleServices = {
    /**
     * Logs an analytics event to BigQuery.
     * @param {string} eventType - Type of action (e.g., 'SEARCH', 'AI_QUERY').
     * @param {Object} metadata - Additional event data.
     */
    async logEvent(eventType, metadata) {
        try {
            const datasetId = 'crowdsense_analytics';
            const tableId = 'events';
            const row = {
                event_type: eventType,
                timestamp: new Date().toISOString(),
                ...metadata
            };
            await bq.dataset(datasetId).table(tableId).insert([row]);
            console.log(`[BigQuery] Logged ${eventType}`);
        } catch (error) {
            console.error('[BigQuery Error]', error.message);
        }
    },

    /**
     * Updates real-time telemetry in Firebase RTDB.
     * @param {string} stadiumId - ID of the stadium.
     * @param {Object} data - Telemetry data.
     */
    async updateTelemetry(stadiumId, data) {
        try {
            await db.ref(`telemetry/${stadiumId}`).set({
                ...data,
                last_updated: admin.database.ServerValue.TIMESTAMP
            });
        } catch (error) {
            console.error('[Firebase RTDB Error]', error.message);
        }
    },

    /**
     * Uploads a file to Google Cloud Storage.
     * @param {Buffer} buffer - File content.
     * @param {string} filename - Destination filename.
     */
    async uploadFile(buffer, filename) {
        try {
            const bucketName = process.env.GCS_BUCKET_NAME;
            const file = storage.bucket(bucketName).file(filename);
            await file.save(buffer);
            return `https://storage.googleapis.com/${bucketName}/${filename}`;
        } catch (error) {
            console.error('[GCS Error]', error.message);
            throw error;
        }
    }
};
