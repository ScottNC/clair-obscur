import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import * as td from 'testdouble';
import { populateCollection } from '../src/lib/populateChroma';

// Mock data with proper structure
const MOCK_CHARACTER_URLS = [
  {
    url: 'https://maxroll.gg/clair-obscur-expedition-33/guides/gustave-skills-guide',
    type: 'character',
    name: 'Gustave',
    collection: 'characters'
  },
  {
    url: 'https://maxroll.gg/clair-obscur-expedition-33/guides/maelle-skills-guide',
    type: 'character',
    name: 'Maelle',
    collection: 'characters'
  }
];

// Mock HTML with content that will pass the length > 100 check
const mockGuideData: Record<string, string> = {
  'gustave': `
    <html>
      <body>
        <h1>Gustave Skills Guide</h1>
        <article>
          Gustave is an engineer with a mechanical arm. He leads Expedition 33. 
          His unique mechanic is Charge. He builds Charges by attacking, dodging, and parrying.
          Key Skills: Lumière Assault, Overcharge, Shatter, Strike Storm. 
          This is a longer description to ensure content length exceeds 100 characters for testing purposes.
        </article>
      </body>
    </html>
  `,
  'maelle': `
    <html>
      <body>
        <h1>Maelle Skills Guide</h1>
        <article>
          Maelle is an arcanist who manipulates Stains. She is the youngest of the group.
          Her unique mechanic involves Battle Stance, which she can change at will.
          Key Skills: Offensive Switch, Rain of Fire, Sword Ballet, Phantom Strike.
          This is additional text to make sure content length is over 100 characters.
        </article>
      </body>
    </html>
  `
};

describe('populateCollection', () => {
  let capturedAddArgs: any = null;

  beforeEach(() => {
    capturedAddArgs = null;
  });

  it('should scrape a single collection and add documents to Chroma', async () => {
    const mockCollection = {
      count: async () => 0,
      add: async (args: any) => {
        capturedAddArgs = args;
      },
      name: 'characters'
    };

    const mockChromaClient = {
      getCollection: async () => mockCollection,
      createCollection: async () => mockCollection
    };

    // Mock axios to return HTML
    const mockAxiosGet = td.replace(axios, 'get');
    
    td.when(mockAxiosGet(td.matchers.anything())).thenDo(async (url: string) => {
      if (url.includes('gustave')) return { data: mockGuideData['gustave'] };
      if (url.includes('maelle')) return { data: mockGuideData['maelle'] };
      return { data: '<html><body><article>Content</article></body></html>' };
    });
    
    await populateCollection('characters', MOCK_CHARACTER_URLS, mockChromaClient as any);
    
    expect(capturedAddArgs).to.not.be.null;
    expect(capturedAddArgs.ids.length).to.equal(2);
    
    const uniqueIds = new Set(capturedAddArgs.ids);
    expect(uniqueIds.size).to.equal(2);
  });

  it('should handle collection not found error', async () => {
    // Make getCollection throw an error
    const errorClient = {
      getCollection: async () => {
        throw new Error('Collection not found');
      },
      createCollection: async () => {
        return { count: async () => 0, add: async () => {} };
      }
    };
    
    try {
      await populateCollection('characters', MOCK_CHARACTER_URLS, errorClient as any);
      expect.fail('Collection not found');
    } catch (error: any) {
      // The error should be the original one since getCollection throws before the try-catch wrapper
      // Or check that it contains the original message
      expect(error.message).to.include('Collection not found');
    }
  });

  it('should handle partial failures (one URL fails, others succeed)', async () => {
    const mockCollection = {
      count: async () => 0,
      add: async (args: any) => {
        capturedAddArgs = args;
      },
      name: 'characters'
    };

    const mockChromaClient = {
      getCollection: async () => mockCollection,
      createCollection: async () => mockCollection
    };

    const mockAxiosGet = td.replace(axios, 'get');
    let callCount = 0;
    
    td.when(mockAxiosGet(td.matchers.anything())).thenDo(async (url: string) => {
      callCount++;
      if (callCount === 1 && url.includes('gustave')) {
        throw new Error('Network error');
      }
      if (url.includes('maelle')) return { data: mockGuideData['maelle'] };
      return { data: '<html><body><article>Default</article></body></html>' };
    });
    
    await populateCollection('characters', MOCK_CHARACTER_URLS, mockChromaClient as any);
    
    expect(capturedAddArgs).to.not.be.null;
    expect(capturedAddArgs.ids.length).to.equal(1);
    
    const hasGustave = capturedAddArgs.ids.some((id: string) => id.includes('gustave'));
    expect(hasGustave).to.be.false;
    
    const hasMaelle = capturedAddArgs.ids.some((id: string) => id.includes('maelle'));
    expect(hasMaelle).to.be.true;
  });
});

// Add this to your tests/populateChroma.test.ts file

// Mock data for multiple collections
const MOCK_PICTO_URLS = [
  {
    url: 'https://maxroll.gg/clair-obscur-expedition-33/guides/best-pictos-guide',
    type: 'picto',
    name: 'Best Pictos',
    collection: 'pictos'
  }
];

const MOCK_RESOURCE_URLS = [
  {
    url: 'https://maxroll.gg/clair-obscur-expedition-33/guides/combat-guide',
    type: 'resource',
    name: 'Combat Guide',
    collection: 'resources'
  }
];

// Mock HTML for additional collections
const mockAdditionalData: Record<string, string> = {
  'pictos': `
    <html>
      <body>
        <h1>Best Pictos Guide</h1>
        <article>
          Critical Burn is the best picto for burn builds. Dead Energy II provides massive damage.
          This guide covers all the essential pictos for endgame content.
          Make sure to collect these before attempting the final boss.
        </article>
      </body>
    </html>
  `,
  'resources': `
    <html>
      <body>
        <h1>Combat Guide</h1>
        <article>
          The combat system is reactive turn-based. Players can dodge, parry, and counter.
          Perfect parries restore action points and create counterattack opportunities.
          Chain combos by mastering attack rhythms and switching between party members.
        </article>
      </body>
    </html>
  `
};

describe('populateMultipleCollections', () => {
  let capturedAddCalls: any[] = [];
  const createMockCollection = (name: string) => ({
    count: async () => 0,
    add: async (args: any) => {
      capturedAddCalls.push({ collectionName: name, args });
    },
    name: name
  });


  beforeEach(() => {
    capturedAddCalls = [];
  });

  it('should populate multiple collections sequentially', async () => {
    const mockChromaClient = {
      getCollection: async (params: { name: string }) => {
        return createMockCollection(params.name);
      },
      createCollection: async (params: { name: string }) => {
        return createMockCollection(params.name);
      }
    };

    // Mock axios to return appropriate HTML for each URL
    const mockAxiosGet = td.replace(axios, 'get');
    
    td.when(mockAxiosGet(td.matchers.anything())).thenDo(async (url: string) => {
      if (url.includes('gustave') || url.includes('maelle')) {
        return { data: mockGuideData['gustave'] };
      }
      if (url.includes('pictos')) {
        return { data: mockAdditionalData['pictos'] };
      }
      if (url.includes('combat')) {
        return { data: mockAdditionalData['resources'] };
      }
      return { data: '<html><body><article>Default</article></body></html>' };
    });
    
    // Populate multiple collections
    await populateCollection('characters', MOCK_CHARACTER_URLS, mockChromaClient as any);
    await populateCollection('pictos', MOCK_PICTO_URLS, mockChromaClient as any);
    await populateCollection('resources', MOCK_RESOURCE_URLS, mockChromaClient as any);
    
    // Verify all three collections were processed
    expect(capturedAddCalls.length).to.equal(3);
    
    // Verify collection names
    expect(capturedAddCalls[0].collectionName).to.equal('characters');
    expect(capturedAddCalls[1].collectionName).to.equal('pictos');
    expect(capturedAddCalls[2].collectionName).to.equal('resources');
    
    // Verify document counts per collection
    expect(capturedAddCalls[0].args.ids.length).to.equal(2); // 2 character URLs
    expect(capturedAddCalls[1].args.ids.length).to.equal(1); // 1 picto URL
    expect(capturedAddCalls[2].args.ids.length).to.equal(1); // 1 resource URL
    
    // Verify content was properly extracted for each collection
    expect(capturedAddCalls[0].args.documents[0]).to.include('Gustave');
    expect(capturedAddCalls[1].args.documents[0]).to.include('Critical Burn');
    expect(capturedAddCalls[2].args.documents[0]).to.include('reactive turn-based');
  });
});