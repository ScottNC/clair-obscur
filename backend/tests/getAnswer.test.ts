import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { setMockGroq, setMockChromaClient, getAnswer } from '../src/lib/groqClient.js';

describe('getAnswer (simple mocks)', function() {
  beforeEach(() => {
    // Create mock Chroma collection
    const mockQuery = async () => ({
      documents: [['Gustave is a 32-year-old engineer who leads Expedition 33.']],
      metadatas: [[{ name: 'Gustave' }]]
    });
    
    const mockCollection = { query: mockQuery };
    const mockClient = { getCollection: async () => mockCollection };
    
    // Create mock Groq
    const mockCreate = async () => ({
      choices: [{ message: { content: '{"message": "Gustave leads Expedition 33."}' } }]
    });
    
    const mockGroq = { chat: { completions: { create: mockCreate } } };
    
    // Inject mocks
    setMockChromaClient(mockClient);
    setMockGroq(mockGroq);
  });

  it('should return answer', async () => {
    const answer = await getAnswer('Who is Gustave?');
    console.log('Answer:', answer);
    expect(answer).to.include('Gustave');
  });
});