import dotenv from "dotenv";
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getChromaClient } from "../utils/getChromaClient";
import { COLLECTION_CONFIG } from "../config/urls";
import { TextChunk } from "../types/chunk";
import { chunkText } from "./chuncker";

dotenv.config();

interface ScrapedContent {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: string;
    title: string;
    url?: string;
    collection: string;
  };
}

// Source detection
function isIgnUrl(url: string): boolean {
  return url.includes('ign.com');
}

function isMaxrollUrl(url: string): boolean {
  return url.includes('maxroll.gg');
}

// Extract title based on source
function extractTitle($: cheerio.CheerioAPI, url: string, fallbackName: string): string {
  let title = '';
  
  if (isIgnUrl(url)) {
    // IGN: look for h1 inside main-content or with display-title class
    const mainContent = $('#main-content');
    if (mainContent.length) {
      title = mainContent.find('h1.display-title').first().text().trim();
      if (!title) {
        title = mainContent.find('h1').first().text().trim();
      }
    }
    if (!title) {
      title = $('h1.display-title').first().text().trim();
    }
    if (!title) {
      title = $('h1').first().text().trim();
    }
  } else if (isMaxrollUrl(url)) {
    // Maxroll: standard h1
    title = $('h1').first().text().trim();
  } else {
    // Generic fallback
    title = $('h1').first().text().trim();
  }
  
  // Fallback to provided name if title is generic or empty
  if (!title || title === 'Maxroll' || title === 'Home' || title === 'IGN' || title === 'Wikis') {
    title = fallbackName;
  }
  
  return title;
}

// Extract content from Maxroll
function extractMaxrollContent($: cheerio.CheerioAPI): string {
  let content = $('article').text().trim();
  if (!content) {
    content = $('.main-content').text().trim();
  }
  if (!content) {
    content = $('body').text().trim();
  }
  return content;
}

// Extract content from IGN
function extractIgnContent($: cheerio.CheerioAPI): string {
  const mainElement = $('#main-content');
  if (mainElement.length) {
    // Clone to avoid modifying original
    const clone = mainElement.clone();
    // Remove unwanted elements
    clone.find('script, style, iframe, .ad, .advertisement, nav, header, footer, .related-content, .sidebar, .social-share').remove();
    return clone.text().trim();
  }
  return $('article').text().trim();
}

// Clean text: normalize whitespace and fix concatenated words
function cleanText(text: string): string {
  return text
    .replaceAll(/\s+/g, ' ')
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

async function scrapeWikiPages(urlsToScrape: any[]): Promise<ScrapedContent[]> {
  const scrapedData: ScrapedContent[] = [];
  
  for (const pageInfo of urlsToScrape) {
    try {
      console.log(`📡 Scraping: ${pageInfo.url}`);
      
      const { data } = await axios.get(pageInfo.url);
      const $ = cheerio.load(data);
      
      // Extract title based on source
      const title = extractTitle($, pageInfo.url, pageInfo.name);
      
      // Extract content based on source
      let mainContent = '';
      if (isIgnUrl(pageInfo.url)) {
        mainContent = extractIgnContent($);
      } else {
        mainContent = extractMaxrollContent($);
      }
      
      // Clean the content
      mainContent = cleanText(mainContent);
      
      if (mainContent && mainContent.length > 100) {
        const id = `web_${pageInfo.collection}_${pageInfo.name.toLowerCase().replaceAll(/\s+/g, '_')}`;
        
        scrapedData.push({
          id: id,
          content: mainContent,
          metadata: {
            source: isIgnUrl(pageInfo.url) ? 'ign' : 'maxroll',
            type: pageInfo.type,
            title: title,
            url: pageInfo.url,
            collection: pageInfo.collection
          }
        });
        
        console.log(`✅ Scraped: ${title} (${mainContent.length} characters) from ${isIgnUrl(pageInfo.url) ? 'IGN' : 'Maxroll'}`);
      } else {
        console.log(`⚠️ No substantial content found for: ${pageInfo.url}`);
      }
      
      // Be respectful - delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to scrape ${pageInfo.url}:`, error);
    }
  }
  
  return scrapedData;
}

export async function populateCollection(
  collectionName: string,
  urlsToScrape: any[],
  chromaClient = getChromaClient()
) {
  try {
    let collection;
    try {
      collection = await chromaClient.getCollection({ name: collectionName });
      console.log(`📁 Loaded existing collection: ${collectionName}`);
    } catch {
      collection = await chromaClient.createCollection({ name: collectionName });
      console.log(`✨ Created new collection: ${collectionName}`);
    }
    
    const count = await collection.count();
    console.log(`   Current documents in ${collectionName}: ${count}`);
    
    console.log(`\n🕷️ Starting web scraping for ${collectionName}...`);
    const scrapedData = await scrapeWikiPages(urlsToScrape);
    
    if (scrapedData.length === 0) {
      console.log(`⚠️ No data scraped for ${collectionName}. Check the URLs and selectors.`);
      return;
    }
    
    console.log(`\n✂️ Chunking ${scrapedData.length} documents...`);
    const allChunks: TextChunk[] = [];
    
    for (const item of scrapedData) {
      const chunks = chunkText(item.content, item.metadata, 1000);
      
      const chunkedItems = chunks.map((chunk, index) => ({
        id: `${item.id}_chunk_${index}`,
        content: chunk.content,
        metadata: {
          ...chunk.metadata,
          chunkIndex: index,
          totalChunks: chunks.length,
          originalId: item.id
        }
      }));
      
      allChunks.push(...chunkedItems);
      
      if (chunks.length > 1) {
        console.log(`   📄 ${item.metadata.title}: split into ${chunks.length} chunks`);
      }
    }
    
    console.log(`\n📝 Adding ${allChunks.length} chunks to ${collectionName}...`);
    
    await collection.add({
      ids: allChunks.map(c => c.id || `chunk_${Math.random().toString(36).substring(2, 15)}`),
      documents: allChunks.map(c => c.content),
      metadatas: allChunks.map(c => c.metadata)
    });
    
    const newCount = await collection.count();
    console.log(`✅ Successfully added! Total documents in ${collectionName}: ${newCount}`);
    
  } catch (error) {
    console.error(`❌ Error populating ${collectionName}:`, error);
    throw error;
  }
}

export async function populateAllCollections(chromaClient = getChromaClient()) {
  for (const config of COLLECTION_CONFIG) {
    await populateCollection(config.name, config.urls, chromaClient);
  }
  console.log("\n🎉 All collections populated successfully!");
}