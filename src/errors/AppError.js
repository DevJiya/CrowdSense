/**
 * @module AppError
 * @description Custom error class for operational and programming errors.
 */

import { ErrorCodes } from './ErrorCodes.js';

export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message.
   * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500).
   * @param {string} errorCode - Machine-readable error code from ErrorCodes enum.
   * @param {boolean} [isOperational=true] - Flag indicating if error is operational (expected) or programming (unexpected).
   * @param {Object} [context={}] - Additional context for debugging.
   */
  constructor(
    message,
    statusCode,
    errorCode = ErrorCodes.INTERNAL_ERROR,
    isOperational = true,
    context = {},
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}
