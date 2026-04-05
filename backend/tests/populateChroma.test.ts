// tests/populateCharacters.test.ts
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import * as td from 'testdouble';
import { populateCharacters } from '../src/lib/populateChroma';

const MOCK_TEST_URLS = [
  {
    url: 'https://maxroll.gg/clair-obscur-expedition-33/guides/gustave-skills-guide',
    type: 'character',
    name: 'Gustave'
  },
  {
    url: 'https://maxroll.gg/clair-obscur-expedition-33/guides/maelle-skills-guide',
    type: 'character',
    name: 'Maelle'
  },
  {
    url: 'https://maxroll.gg/clair-obscur-expedition-33/guides/lune-skills-guide',
    type: 'character',
    name: 'Lune'
  }
];

// Fixed mock HTML - now matches Maxroll's actual structure with <article> tags
const mockGuideData: Record<string, string> = {
  'gustave': `
    <html>
      <body>
        <h1>Gustave Skills Guide</h1>
        <article>
          Gustave is an engineer and the inventor of the Lumina Converter. 
          He wields a blade and pistol, but his true weapon is hidden within his mechanical arm.
          Gustave's unique mechanic is Charge. He builds Charges by attacking, dodging, parrying.
          Key Skills: Lumière Assault, Overcharge, Shatter, Strike Storm.
        </article>
      </body>
    </html>
  `,
  'maelle': `
    <html>
      <body>
        <h1>Maelle Skills Guide</h1>
        <article>
          Maelle is the third party member. She is the youngest of the group.
          Maelle's unique mechanic involves her Battle Stance, which she can change at will.
          Key Skills: Offensive Switch, Rain of Fire, Sword Ballet, Phantom Strike.
        </article>
      </body>
    </html>
  `,
  'lune': `
    <html>
      <body>
        <h1>Lune Skills Guide</h1>
        <article>
          Lune is a mysterious warrior who joins Expedition 33.
          She has amnesia and cannot remember her past before the Paintress's curse.
          Key Skills: Blade Dance, Shadow Step, Moonlight Strike.
        </article>
      </body>
    </html>
  `
};

describe('populateCharacters', () => {
  let capturedAddArgs: any = null;

  beforeEach(() => {
    capturedAddArgs = null;
  });

  it('should scrape 3 mock guides and add unique documents to Chroma', async () => {
    // Create a mock collection that captures the add call
    const mockCollection = {
      count: async () => 0,
      add: async (args: any) => {
        capturedAddArgs = args;
      },
      name: 'character-data'
    };

    const mockChromaClient = {
      getCollection: async (params: { name: string }) => {
        if (params.name === 'character-data') {
          return mockCollection;
        }
        throw new Error('Collection not found');
      }
    };

    // Mock axios
    const mockAxiosGet = td.replace(axios, 'get');
    
    td.when(mockAxiosGet(td.matchers.anything())).thenDo(async (url: string) => {
      if (url.includes('gustave')) return { data: mockGuideData['gustave'] };
      if (url.includes('maelle')) return { data: mockGuideData['maelle'] };
      if (url.includes('lune')) return { data: mockGuideData['lune'] };
      return { data: '<html><body><article>Default content</article></body></html>' };
    });
    
    await populateCharacters(MOCK_TEST_URLS, mockChromaClient as any);
    
    // Verify results
    expect(capturedAddArgs).to.not.be.null;
    expect(capturedAddArgs.ids.length).to.equal(3);
    
    // Verify all IDs are unique
    const uniqueIds = new Set(capturedAddArgs.ids);
    expect(uniqueIds.size).to.equal(3);
    
    // Verify content was extracted
    expect(capturedAddArgs.documents[0]).to.include('Gustave');
    expect(capturedAddArgs.documents[1]).to.include('Maelle');
    expect(capturedAddArgs.documents[2]).to.include('Lune');
  });

  it('should handle collection not found error', async () => {
    const errorClient = {
      getCollection: async (params: { name: string }) => {
        throw new Error('Collection not found');
      }
    };
    
    try {
      await populateCharacters(MOCK_TEST_URLS, errorClient as any);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).to.include('Error getting collection');
    }
  });

  it('should handle partial failures and still add successful ones', async () => {
    const mockCollection = {
      count: async () => 0,
      add: async (args: any) => {
        capturedAddArgs = args;
      },
      name: 'character-data'
    };

    const mockChromaClient = {
      getCollection: async (params: { name: string }) => {
        if (params.name === 'character-data') {
          return mockCollection;
        }
        throw new Error('Collection not found');
      }
    };

    const mockAxiosGet = td.replace(axios, 'get');
    let callCount = 0;
    
    td.when(mockAxiosGet(td.matchers.anything())).thenDo(async (url: string) => {
      callCount++;
      // First URL (Gustave) fails
      if (callCount === 1 && url.includes('gustave')) {
        throw new Error('Network error');
      }
      if (url.includes('maelle')) return { data: mockGuideData['maelle'] };
      if (url.includes('lune')) return { data: mockGuideData['lune'] };
      return { data: '<html><body><article>Default</article></body></html>' };
    });
    
    await populateCharacters(MOCK_TEST_URLS, mockChromaClient as any);
    
    expect(capturedAddArgs).to.not.be.null;
    // Should have 2 documents (Gustave failed)
    expect(capturedAddArgs.ids.length).to.equal(2);
    
    const hasGustave = capturedAddArgs.ids.some((id: string) => id.includes('gustave'));
    expect(hasGustave).to.be.false;
    
    const hasMaelle = capturedAddArgs.ids.some((id: string) => id.includes('maelle'));
    expect(hasMaelle).to.be.true;
  });
});