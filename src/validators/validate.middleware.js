/**
 * @module ValidationMiddleware
 * @description Higher-order middleware factory for Joi schema validation.
 */

import validator from 'validator';

import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/ErrorCodes.js';

/**
 * Recursively sanitizes string inputs in an object.
 * @param {Object} data - The data to sanitize.
 * @returns {Object} Sanitized data.
 */
const sanitizeData = (data) => {
  if (typeof data === 'string') {
    return validator.escape(data.trim());
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  if (data !== null && typeof data === 'object') {
    const sanitized = {};
    Object.keys(data).forEach((key) => {
      sanitized[key] = sanitizeData(data[key]);
    });
    return sanitized;
  }
  return data;
};

/**
 * Creates a validation middleware for a given Joi schema.
 * @param {Object} schema - Joi schema object.
 * @param {'body' | 'query' | 'params'} [source='body'] - Request property to validate.
 * @returns {Function} Express middleware.
 */
export const validate =
  (schema, source = 'body') =>
  (httpRequest, httpResponse, next) => {
    // 1. Sanitize raw input
    httpRequest[source] = sanitizeData(httpRequest[source]);

    // 2. Validate against schema
    const { error, value } = schema.validate(httpRequest[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new AppError('Validation failed', 400, ErrorCodes.VALIDATION_ERROR, true, { details });
    }

    // 3. Update request with validated/transformed values
    httpRequest[source] = value;
    return next();
  };
