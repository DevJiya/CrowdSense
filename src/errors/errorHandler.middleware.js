/**
 * @module ErrorHandlerMiddleware
 * @description Centralized Express error handling middleware.
 */

/* eslint-disable no-console */
import { ErrorCodes } from './ErrorCodes.js';

/**
 * Global error handler middleware.
 * @param {Error} error - The error object.
 * @param {Object} httpRequest - Express request object.
 * @param {Object} httpResponse - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const errorHandler = (error, httpRequest, httpResponse, _next) => {
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || ErrorCodes.INTERNAL_ERROR;
  const message = error.isOperational ? error.message : 'An unexpected internal error occurred.';
  const requestId = httpRequest.headers['x-request-id'] || 'N/A';

  // Log non-operational errors as FATAL
  if (!error.isOperational) {
    console.error(`[FATAL ERROR] [ReqID: ${requestId}]`, {
      message: error.message,
      stack: error.stack,
      context: error.context,
    });
  } else {
    console.warn(`[OPERATIONAL ERROR] [ReqID: ${requestId}] [Code: ${errorCode}]`, {
      message: error.message,
      context: error.context,
    });
  }

  return httpResponse.status(statusCode).json({
    error: {
      code: errorCode,
      message,
      requestId,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};
