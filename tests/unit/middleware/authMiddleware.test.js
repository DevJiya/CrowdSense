/**
 * @module AuthMiddlewareTest
 * @description Unit tests for authentication and authorization middleware.
 */

import { jest } from '@jest/globals';
import { AuthMiddleware } from '../../../src/middleware/authMiddleware.js';

describe('AuthMiddleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    process.env.MOCK_MODE = 'false';
  });

  test('should call next() if MOCK_MODE is true', () => {
    process.env.MOCK_MODE = 'true';
    AuthMiddleware.requireAuth(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('should call next() if Authorization header is present', () => {
    mockReq.headers.authorization = 'Bearer token123';
    AuthMiddleware.requireAuth(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('should return 401 if unauthorized and NOT in mock mode', () => {
    AuthMiddleware.requireAuth(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Unauthorized',
      }),
    );
  });

  test('should allow admin routes (currently a pass-through)', () => {
    AuthMiddleware.requireAdmin(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
