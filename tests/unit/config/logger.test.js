import { logger } from '../../../src/config/logger.js';

describe('Logger', () => {
  it('should log info messages', () => {
    expect(() => logger.info('Test info')).not.toThrow();
  });

  it('should log error messages with metadata', () => {
    expect(() => logger.error('Test error', { meta: 'data' })).not.toThrow();
  });

  it('should log debug messages', () => {
    expect(() => logger.debug('Test debug')).not.toThrow();
  });
});
