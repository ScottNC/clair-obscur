// ign.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

interface WalkthroughUrl {
  url: string;
  type: string;
  name: string;
  collection: string;
}

async function getIgnWalkthroughUrls(): Promise<WalkthroughUrl[]> {
  const url = 'https://www.ign.com/wikis/clair-obscur-expedition-33/Walkthrough';
  
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    const walkthroughUrls: WalkthroughUrl[] = [];
    
    // Look for links to walkthrough sections
    $('a[href*="Walkthrough"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      
      // Filter for actual walkthrough sections (not the main page)
      if (href && href !== '/wikis/clair-obscur-expedition-33/Walkthrough' && 
          href.includes('_Walkthrough')) {
        walkthroughUrls.push({
          url: 'https://www.ign.com' + href,
          type: 'resource',
          name: text,
          collection: 'resources'
        });
      }
    });
    
    return walkthroughUrls;
    
  } catch (error) {
    console.error('Failed to fetch IGN walkthrough page:', error);
    return [];
  }
}

const IGN_WALKTHROUGH_URLS = await getIgnWalkthroughUrls();
console.log(IGN_WALKTHROUGH_URLS);