import { jest } from '@jest/globals';

// Mock Google Generative AI
jest.unstable_mockModule('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockImplementation(() => ({
            generateContentStream: jest.fn().mockImplementation(() => Promise.resolve({
                stream: (async function* () {
                    yield { text: () => 'Mocked AI response chunk' };
                })()
            }))
        }))
    }))
}));

// Mock Environment Variables
process.env.GEMINI_API_KEY = 'test-key-123';
process.env.PORT = '3001';

// Global Test Context
global.MOCK_SECTORS = [
    { name: 'Gate A', density: 85 },
    { name: 'Gate B', density: 40 },
    { name: 'Gate C', density: 10 }
];
