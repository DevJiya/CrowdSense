/**
 * @module GoogleServices
 * @description Centralized interface for Google Cloud Platform and Firebase services.
 * Handles BigQuery event logging, Firebase Realtime Database telemetry, and
 * Google Cloud Storage file uploads. Operates in MOCK_MODE if credentials are missing.
 * @requires @google-cloud/bigquery
 * @requires @google-cloud/storage
 * @requires firebase-admin
 * @requires dotenv
 */

/* eslint-disable no-console */
import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

/** @const {boolean} MOCK_MODE - Indicates if the service is running without live cloud credentials. */
const MOCK_MODE = !process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (MOCK_MODE) {
  console.warn('⚠️ [Google Cloud] Running in OFFLINE MOCK MODE. No live cloud writes will occur.');
}

// Initialize Firebase Admin
if (!admin.apps.length && !MOCK_MODE) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch (initError) {
    console.error('Firebase Init Failed', initError.message);
  }
}

/** @const {BigQuery|null} bigQueryClient - Instance of BigQuery client or null in MOCK_MODE. */
const bigQueryClient = MOCK_MODE ? null : new BigQuery();

/** @const {Storage|null} googleStorageClient - Instance of Storage client or null in MOCK_MODE. */
const googleStorageClient = MOCK_MODE ? null : new Storage();

/** @const {admin.database.Database|null} firebaseDatabase - Instance of Firebase RTDB or null in MOCK_MODE. */
const firebaseDatabase = MOCK_MODE || !admin.apps.length ? null : admin.database();

export const GoogleServices = {
  /**
   * Logs an analytics event to Google BigQuery.
   * @async
   * @param {string} eventType - The category of the event (e.g., 'AI_QUERY').
   * @param {Object} eventMetadata - Additional data payload for the event.
   * @returns {Promise<void>} Resolves when the log operation is complete.
   * @example
   * await GoogleServices.logEvent('SECURITY_ALERT', { zone: 'North Gate', risk: 'High' });
   */
  async logEvent(eventType, eventMetadata) {
    if (MOCK_MODE) {
      console.log(`[MOCK BigQuery] Event: ${eventType}`, eventMetadata);
      return;
    }
    try {
      const datasetId = 'crowdsense_analytics';
      const tableId = 'events';
      const row = {
        event_type: eventType,
        timestamp: new Date().toISOString(),
        ...eventMetadata,
      };
      await bigQueryClient.dataset(datasetId).table(tableId).insert([row]);
      console.log(`[BigQuery] Logged ${eventType}`);
    } catch (error) {
      console.error('[BigQuery Error]', error.message);
    }
  },

  /**
   * Updates real-time telemetry data in Firebase Realtime Database.
   * @async
   * @param {string} stadiumId - The unique identifier for the stadium.
   * @param {Object} telemetryPayload - The live sensor data and metrics.
   * @returns {Promise<void>} Resolves when the RTDB update is complete.
   */
  async updateTelemetry(stadiumId, telemetryPayload) {
    if (MOCK_MODE || !firebaseDatabase) {
      console.log(`[MOCK RTDB] Telemetry for ${stadiumId}:`, telemetryPayload);
      return;
    }
    try {
      await firebaseDatabase.ref(`telemetry/${stadiumId}`).set({
        ...telemetryPayload,
        last_updated: admin.database.ServerValue.TIMESTAMP,
      });
    } catch (error) {
      console.error('[Firebase RTDB Error]', error.message);
    }
  },

  /**
   * Uploads a file buffer to Google Cloud Storage.
   * @async
   * @param {Buffer} fileBuffer - The raw file data to upload.
   * @param {string} destinationFilename - The target filename/path in the bucket.
   * @returns {Promise<string>} The public URL of the uploaded file.
   * @throws {Error} If the storage bucket is not configured or upload fails.
   */
  async uploadFile(fileBuffer, destinationFilename) {
    if (MOCK_MODE) {
      console.log(`[MOCK GCS] Uploaded ${destinationFilename}`);
      return `https://mock-storage.googleapis.com/${destinationFilename}`;
    }
    try {
      const bucketName = process.env.GCS_BUCKET_NAME;
      if (!bucketName) {
        throw new Error('GCS_BUCKET_NAME environment variable is not set');
      }
      const file = googleStorageClient.bucket(bucketName).file(destinationFilename);
      await file.save(fileBuffer);
      return `https://storage.googleapis.com/${bucketName}/${destinationFilename}`;
    } catch (error) {
      console.error('[GCS Error]', error.message);
      throw error;
    }
  },
};
