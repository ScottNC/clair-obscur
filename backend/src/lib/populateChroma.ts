// src/lib/populateChroma.ts
import dotenv from "dotenv";
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getChromaClient } from "../utils/getChromaClient.js";
import { GUIDE_URLS } from "../config/urls.js";

dotenv.config();

interface ScrapedContent {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: string;
    title: string;
    url?: string;
  };
}

async function scrapeWikiPages(urlsToScrape: typeof GUIDE_URLS) {
  const scrapedData: ScrapedContent[] = [];
  
  for (const pageInfo of urlsToScrape) {
    try {
      console.log(`📡 Scraping: ${pageInfo.url}`);
      
      const { data } = await axios.get(pageInfo.url);
      const $ = cheerio.load(data);
      
      let title = $('h1').first().text().trim();
      if (!title || title === 'Maxroll' || title === 'Home') {
        title = `${pageInfo.name} Skills Guide`;
      }
      
      let mainContent = $('article').text().trim();
      if (!mainContent) {
        mainContent = $('.main-content').text().trim();
      }
      if (!mainContent) {
        mainContent = $('body').text().trim();
      }
      
      mainContent = mainContent.replaceAll(/\s+/g, ' ').trim();
      
      if (mainContent && mainContent.length > 100) {
        const id = `web_${title.toLowerCase().replaceAll(/\s+/g, '_')}`;
        
        scrapedData.push({
          id: id,
          content: mainContent,
          metadata: {
            source: 'maxroll',
            type: pageInfo.type,
            title: title,
            url: pageInfo.url
          }
        });
        
        console.log(`✅ Scraped: ${title} (${mainContent.length} characters)`);
      } else {
        console.log(`⚠️ No substantial content found for: ${pageInfo.url}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to scrape ${pageInfo.url}:`, error);
    }
  }
  
  return scrapedData;
}

// Accept chromaClient as a parameter for testing
export async function populateCharacters(
  urlsToScrape = GUIDE_URLS,
  chromaClient = getChromaClient()
) {
  try {
    let collection;
    try {
      collection = await chromaClient.getCollection({ name: "character-data" });
      console.log("📁 Loaded existing collection");
      
      const count = await collection.count();
      console.log(`   Current documents: ${count}`);
      
    } catch {
      throw new Error("Error getting collection. Please make sure collection exists.")
    }
    
    console.log("\n🕷️ Starting web scraping with Cheerio...");
    const characterData = await scrapeWikiPages(urlsToScrape);
    
    if (characterData.length === 0) {
      console.log("⚠️ No data scraped. Check the URLs and selectors.");
      return;
    }
    
    console.log(`\n📝 Adding ${characterData.length} documents to database...`);
    
    await collection.add({
      ids: characterData.map(d => d.id),
      documents: characterData.map(d => d.content),
      metadatas: characterData.map(d => d.metadata)
    });
    
    const newCount = await collection.count();
    console.log(`✅ Successfully added! Total documents in Chroma: ${newCount}`);
    
  } catch (error) {
    console.error("❌ Error populating from web:", error);
    throw error;
  }
}