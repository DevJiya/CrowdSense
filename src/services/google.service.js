import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const MOCK_MODE = !process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (MOCK_MODE) {
    console.warn('⚠️ [Google Cloud] Running in OFFLINE MOCK MODE. No live cloud writes will occur.');
}

// Initialize Firebase Admin
if (!admin.apps.length && !MOCK_MODE) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    } catch (e) {
        console.error('Firebase Init Failed', e.message);
    }
}

const bq = MOCK_MODE ? null : new BigQuery();
const storage = MOCK_MODE ? null : new Storage();
const db = (MOCK_MODE || !admin.apps.length) ? null : admin.database();

export const GoogleServices = {
    /**
     * Logs an analytics event to BigQuery.
     */
    async logEvent(eventType, metadata) {
        if (MOCK_MODE) {
            console.log(`[MOCK BigQuery] Event: ${eventType}`, metadata);
            return;
        }
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
     */
    async updateTelemetry(stadiumId, data) {
        if (MOCK_MODE || !db) {
            console.log(`[MOCK RTDB] Telemetry for ${stadiumId}:`, data);
            return;
        }
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
     */
    async uploadFile(buffer, filename) {
        if (MOCK_MODE) {
            console.log(`[MOCK GCS] Uploaded ${filename}`);
            return `https://mock-storage.googleapis.com/${filename}`;
        }
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
