import { jest } from '@jest/globals';
import { SecurityMiddleware } from '../../../src/middleware/security.middleware.js';

describe('SecurityMiddleware', () => {
  it('should have helmet configured', () => {
    expect(SecurityMiddleware.helmet).toBeDefined();
  });

  it('should have rate limiters defined', () => {
    expect(SecurityMiddleware.globalRateLimit).toBeDefined();
    expect(SecurityMiddleware.aiRateLimit).toBeDefined();
  });
});
