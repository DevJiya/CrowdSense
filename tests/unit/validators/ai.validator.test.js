/**
 * @module AiValidatorTest
 * @description Unit tests for AI chat request validation schemas.
 */

import { ApiSchemas } from '../../../src/validators/api.validator.js';

describe('ApiSchemas Validation', () => {
  describe('aiChat Schema', () => {
    test('should validate a correct payload', () => {
      const payload = {
        message: 'Hello',
        venue: 'Stadium',
        sectors: [{ name: 'A', density: 10 }],
      };
      const { error } = ApiSchemas.aiChat.validate(payload);
      expect(error).toBeUndefined();
    });

    test('should reject missing message', () => {
      const payload = { venue: 'Stadium', sectors: [] };
      const { error } = ApiSchemas.aiChat.validate(payload);
      expect(error).toBeDefined();
    });
  });
});
