import { jest } from '@jest/globals';
import { GeminiService } from '../../../src/services/gemini.service.js';

// Mock the GoogleGenerativeAI dependency
jest.unstable_mockModule('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      generateContentStream: jest.fn().mockImplementation(() =>
        Promise.resolve({
          stream: [{ text: () => 'Tactical ' }, { text: () => 'Insight' }],
        }),
      ),
    })),
  })),
}));

describe('GeminiService', () => {
  let mockResponse;

  beforeEach(() => {
    mockResponse = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };
  });

  it('should stream tactical narration in mock mode', async () => {
    const data = {
      message: 'Test',
      analysis: {
        venue: 'Stadium',
        overall_risk: 'LOW',
        bottlenecks: [],
        evacuation_route: 'Gate A',
      },
    };

    process.env.MOCK_MODE = 'true';
    await GeminiService.streamNarration(data, mockResponse);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(mockResponse.write).toHaveBeenCalledWith(expect.stringContaining('[MOCK AI]'));
    expect(mockResponse.end).toHaveBeenCalled();
  });

  it('should stream tactical narration in production mode (mocked SDK)', async () => {
    const data = {
      message: 'Test',
      analysis: {
        venue: 'Stadium',
        overall_risk: 'LOW',
        bottlenecks: [],
        evacuation_route: 'Gate A',
      },
    };

    process.env.MOCK_MODE = 'false';
    process.env.GEMINI_API_KEY = 'REAL_KEY';

    await GeminiService.streamNarration(data, mockResponse);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(mockResponse.write).toHaveBeenCalled();
    expect(mockResponse.end).toHaveBeenCalled();
  });
});
