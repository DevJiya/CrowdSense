/**
 * @module E2ETest
 * @description End-to-end test simulating a full user navigation flow:
 * 1. User syncs telemetry
 * 2. User requests a tactical AI path
 * 3. User logs a success event
 */

import request from 'supertest';
import app from '../../src/app.js';

describe('End-to-End Navigation Flow', () => {
  beforeAll(() => {
    process.env.MOCK_MODE = 'true';
  });

  test('should complete a full telemetry -> routing -> analytics cycle', async () => {
    // 1. Sync Telemetry
    const syncRes = await request(app)
      .post('/api/telemetry/sync')
      .send({
        stadiumId: 'eden-gardens',
        telemetryPayload: { gate_density: 85, section_b_risk: 'LOW' },
      });
    expect(syncRes.status).toBe(200);

    // 2. Request AI Tactical Chat
    const aiRes = await request(app)
      .post('/api/ai-chat')
      .send({
        message: 'Calculate safest route to Gate B',
        venue: 'Eden Gardens',
        sectors: [
          { name: 'North Stand', density: 90 },
          { name: 'South Stand', density: 20 },
        ],
      });
    expect(aiRes.status).toBe(200);
    expect(aiRes.header['content-type']).toContain('text/event-stream');

    // 3. Log Analytics Event
    const logRes = await request(app)
      .post('/api/analytics')
      .send({
        analyticsEventName: 'NAVIGATION_COMPLETED',
        metadata: { path_found: true, time_saved: '4m' },
      });
    expect(logRes.status).toBe(200);
  });
});
