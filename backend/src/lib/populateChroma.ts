import dotenv from "dotenv";
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getChromaClient } from "../utils/getChromaClient";
import { COLLECTION_CONFIG } from "../config/urls";
import { TextChunk } from "../types/chunk";
import { chunkText } from "../utils/chuncker";

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

async function scrapeWikiPages(urlsToScrape: any[]): Promise<ScrapedContent[]> {
  const scrapedData: ScrapedContent[] = [];
  
  for (const pageInfo of urlsToScrape) {
    try {
      console.log(`📡 Scraping: ${pageInfo.url}`);
      
      const { data } = await axios.get(pageInfo.url);
      const $ = cheerio.load(data);
      
      let title = $('h1').first().text().trim();
      if (!title || title === 'Maxroll' || title === 'Home') {
        title = pageInfo.name;
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
        const id = `web_${pageInfo.collection}_${pageInfo.name.toLowerCase().replaceAll(/\s+/g, '_')}`;
        
        scrapedData.push({
          id: id,
          content: mainContent,
          metadata: {
            source: 'maxroll',
            type: pageInfo.type,
            title: title,
            url: pageInfo.url,
            collection: pageInfo.collection
          }
        });
        
        console.log(`✅ Scraped: ${title} (${mainContent.length} characters)`);
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