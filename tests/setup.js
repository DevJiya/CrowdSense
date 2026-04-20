/**
 * @module TestSetup
 * @description Global setup for Jest tests. Mocks external dependencies like
 * Firebase, Google Cloud SDKs, and Gemini AI.
 */

import { jest } from '@jest/globals';

// 1. Mock Google Generative AI (Gemini)
jest.unstable_mockModule('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContentStream: jest.fn().mockResolvedValue({
        stream: (async function* () {
          yield { text: () => 'Mocked AI Response' };
        })(),
      }),
    }),
  })),
}));

// 2. Mock Firebase Admin
jest.unstable_mockModule('firebase-admin', () => ({
  default: {
    apps: [],
    initializeApp: jest.fn(),
    credential: {
      applicationDefault: jest.fn(),
    },
    database: jest.fn().mockReturnValue({
      ref: jest.fn().mockReturnThis(),
      set: jest.fn().mockResolvedValue(true),
      once: jest.fn().mockResolvedValue({ val: () => ({}) }),
    }),
  },
}));

// 3. Mock BigQuery
jest.unstable_mockModule('@google-cloud/bigquery', () => ({
  BigQuery: jest.fn().mockImplementation(() => ({
    dataset: jest.fn().mockReturnThis(),
    table: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue([{}]),
  })),
}));

// 4. Mock Storage
jest.unstable_mockModule('@google-cloud/storage', () => ({
  Storage: jest.fn().mockImplementation(() => ({
    bucket: jest.fn().mockReturnThis(),
    file: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(true),
  })),
}));

// 5. Global Environment Mocks
process.env.GEMINI_API_KEY = 'test-key';
process.env.GCS_BUCKET_NAME = 'test-bucket';
process.env.FIREBASE_DATABASE_URL = 'https://test.firebaseio.com';
process.env.MOCK_MODE = 'true';
process.env.NODE_ENV = 'test';
