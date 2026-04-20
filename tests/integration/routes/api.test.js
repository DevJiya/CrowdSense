/**
 * @module ApiIntegrationTest
 * @description Integration tests for all CrowdSense API routes using Supertest.
 * Verifies happy paths, validation failures, and authorization logic.
 */

import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../../../src/app.js';
import { ErrorCodes } from '../../../src/errors/ErrorCodes.js';

describe('API Routes Integration', () => {
  beforeEach(() => {
    process.env.MOCK_MODE = 'true';
    process.env.NODE_ENV = 'test';
  });
  describe('POST /api/ai-chat', () => {
    const validChatPayload = {
      message: 'Status check',
      venue: 'Wankhede',
      sectors: [{ name: 'Gate A', density: 45 }],
      language: 'English',
    };

    test('should return 200 and stream AI response for valid input', async () => {
      const response = await request(app).post('/api/ai-chat').send(validChatPayload);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toContain('text/event-stream');
    });

    test('should return 400 for missing required fields', async () => {
      const invalidPayload = { message: 'Incomplete' };
      const response = await request(app).post('/api/ai-chat').send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    test('should return 400 for invalid data types', async () => {
      const badTypePayload = { ...validChatPayload, sectors: 'not-an-array' };
      const response = await request(app).post('/api/ai-chat').send(badTypePayload);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/analytics', () => {
    test('should return 401 when unauthorized', async () => {
      process.env.MOCK_MODE = 'false';
      const response = await request(app)
        .post('/api/analytics')
        .send({ analyticsEventName: 'TEST', metadata: {} });

      expect(response.status).toBe(401);
    });

    test('should return 200 when authorized or in mock mode', async () => {
      process.env.MOCK_MODE = 'true';
      const response = await request(app)
        .post('/api/analytics')
        .send({ analyticsEventName: 'TEST', metadata: {} });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'logged' });
    });

    test('should return 400 for invalid analytics payload', async () => {
      const response = await request(app).post('/api/analytics').send({ analyticsEventName: null });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api', () => {
    test('should return status ok', async () => {
      const response = await request(app).get('/api');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('POST /api/telemetry/sync', () => {
    test('should return 200 for valid telemetry sync', async () => {
      process.env.MOCK_MODE = 'true';
      const response = await request(app)
        .post('/api/telemetry/sync')
        .send({ stadiumId: 'wankhede', telemetryPayload: { temp: 30 } });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('synced');
    });
  });
});
