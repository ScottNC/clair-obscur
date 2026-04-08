import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { setMockGroq, setMockChromaClient, getAnswer, setMockCollectionConfig } from '../src/lib/groqClient';

describe('getAnswer', function() {
  beforeEach(() => {
    // Create mock Chroma collection
    const mockQuery = async () => ({
      documents: [['Gustave is a 32-year-old engineer who leads Expedition 33.']],
      metadatas: [[{ name: 'Gustave', title: 'Gustave, the Engineer', type: 'character', collection: 'mock' }]],
      distances: [[1.2]]
    });

    const mockCollectionConfig = [
      { name: 'mock-characters', urls: {
        url: 'https://example.com',
        type: 'character',
        name: 'Mock Test',
        collection: 'mock'
      }},
    ];

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
    setMockCollectionConfig(mockCollectionConfig);
  });

  it.only('should return the message from the LLM', async () => {
    const answer = await getAnswer('Who is Gustave?');
    expect(answer).to.equal('Gustave leads Expedition 33.');
  });
});

describe('getAnswer - 401 Unauthorized', () => {
  it('should handle invalid API key gracefully', async () => {
    // Mock successful Chroma response
    const mockQuery = async () => ({
      documents: [['Gustave is an engineer']],
      metadatas: [[{ name: 'Gustave' }]]
    });
    
    const mockCollection = { query: mockQuery };
    const mockClient = { getCollection: async () => mockCollection };
    
    // Create a 401 error exactly like the real one
    const authError = new Error('Invalid API Key');
    (authError as any).status = 401;
    (authError as any).error = {
      error: {
        message: 'Invalid API Key',
        type: 'invalid_request_error',
        code: 'invalid_api_key'
      }
    };
    
    const mockCreate = async () => { throw authError; };
    const mockGroq = { chat: { completions: { create: mockCreate } } };
    
    setMockChromaClient(mockClient);
    setMockGroq(mockGroq);
    
    const answer = await getAnswer('Who is Gustave?');
    
    // Should return the fallback message
    expect(answer).to.equal('I couldn\'t find any information about that in the game guides. Please try asking something else about Clair Obscur: Expedition 33.');
  });
});