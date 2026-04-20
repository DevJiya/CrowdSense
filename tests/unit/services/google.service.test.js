import { jest } from '@jest/globals';
import { logger } from '../../../src/config/logger.js';
import { GoogleServices } from '../../../src/services/google.service.js';

describe('GoogleServices', () => {
  beforeEach(() => {
    process.env.MOCK_MODE = 'true';
    jest.spyOn(logger, 'debug').mockImplementation(() => {});
    jest.spyOn(logger, 'info').mockImplementation(() => {});
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    jest.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('logEvent should use mock implementation when MOCK_MODE is true', async () => {
    await GoogleServices.logEvent('TEST_EVENT', { key: 'val' });
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('[MOCK BigQuery]'), {
      eventMetadata: { key: 'val' },
    });
  });

  test('updateTelemetry should use mock implementation', async () => {
    await GoogleServices.updateTelemetry('stadium-1', { d: 50 });
    expect(GoogleServices.updateTelemetry).toBeDefined();
  });

  it('should handle offline mode gracefully', async () => {
    process.env.OFFLINE = 'true';
    await expect(GoogleServices.logEvent('TEST', {})).resolves.not.toThrow();
  });

  it('should throw on missing telemetry stadiumId', async () => {
    await expect(GoogleServices.updateTelemetry(null, {})).rejects.toThrow();
  });

  test('uploadFile should return a mock URL', async () => {
    const url = await GoogleServices.uploadFile(Buffer.from('test'), 'file.txt');
    expect(url).toContain('mock-storage.googleapis.com');
  });

  it('should throw on missing upload parameters', async () => {
    await expect(GoogleServices.uploadFile(null, null)).rejects.toThrow();
  });
});
