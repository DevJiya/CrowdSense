/**
 * @module AiValidator
 * @description Joi validation schemas for AI-related tactical routes.
 */

import Joi from 'joi';

export const AiSchemas = {
  chat: Joi.object({
    message: Joi.string().min(1).max(500).required(),
    venue: Joi.string().min(1).max(100).required(),
    sectors: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          density: Joi.number().min(0).max(100).required(),
        }),
      )
      .min(1)
      .required(),
    language: Joi.string()
      .valid('English', 'Spanish', 'French', 'German', 'Hindi')
      .default('English'),
  }),
};
