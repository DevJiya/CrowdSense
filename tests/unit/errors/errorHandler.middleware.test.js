/**
 * @module ErrorHandlerTest
 * @description Unit tests for the global error handling middleware.
 */

import { jest } from '@jest/globals';
import { logger } from '../../../src/config/logger.js';
import { errorHandler } from '../../../src/errors/errorHandler.middleware.js';
import { AppError } from '../../../src/errors/AppError.js';
import { ErrorCodes } from '../../../src/errors/ErrorCodes.js';

describe('ErrorHandler Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: { 'x-request-id': 'test-123' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.spyOn(logger, 'error').mockImplementation(() => {});
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    jest.spyOn(logger, 'info').mockImplementation(() => {});
    jest.spyOn(logger, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should return formatted JSON for operational AppError', () => {
    const error = new AppError('Validation failed', 400, ErrorCodes.VALIDATION_ERROR, true);
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Validation failed',
        requestId: 'test-123',
      },
    });
  });

  test('should return generic error message for non-operational errors', () => {
    const error = new Error('Database connection failed');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected internal error occurred.',
        requestId: 'test-123',
      },
    });
  });

  test('should include stack trace only in development environment', () => {
    process.env.NODE_ENV = 'development';
    const error = new AppError('Dev Error', 500, ErrorCodes.INTERNAL_ERROR, true);
    errorHandler(error, mockReq, mockRes, mockNext);

    const response = mockRes.json.mock.calls[0][0];
    expect(response.error.stack).toBeDefined();

    process.env.NODE_ENV = 'production'; // Reset
  });
});
