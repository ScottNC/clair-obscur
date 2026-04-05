import Groq from 'groq-sdk';
import dotenv from "dotenv";
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from "node:url";
import { delay } from "../utils/delay";
import { getChromaClient } from "../utils/getChromaClient";
import { COLLECTION_CONFIG } from '../config/urls';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

let mockGroq: any = null;
let mockChromaClient: any = null;

export function setMockGroq(mock: any) {
  mockGroq = mock;
}

export function setMockChromaClient(mock: any) {
  mockChromaClient = mock;
}

function getGroq() {
  return mockGroq || new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function getChroma() {
  return mockChromaClient || getChromaClient();
}

const instructions = fs.readFileSync(
  path.join(__dirname, "../../prompts/instructions.txt"), 
  "utf-8"
);

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Build messages array with conversation history
function buildMessages(question: string, context: string, history: Message[] = []): Message[] {
  const messages: Message[] = [
    {
      role: "system",
      content: instructions + "\n\n" + "Relevant Game Information:\n" + context
    }
  ];
  
  // Add conversation history (excluding the system message)
  for (const msg of history) {
    if (msg.role !== 'system') {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
  }
  
  messages.push({
    role: "user",
    content: question
  });
  
  return messages;
}

async function queryWithGroq(
  question: string, 
  context: string, 
  history: Message[] = [],
  retryCount: number = 0
): Promise<string | null> {
  const groq = getGroq();
  
  const messages = buildMessages(question, context, history);
  
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const text = chatCompletion.choices[0].message.content || "";  
    
    try {
      const json = JSON.parse(text);
      if (json.message && typeof json.message === 'string') {
        return json.message;
      } else {
        throw new Error('Invalid JSON structure: missing "message" field');
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      if (retryCount < 3) {
        console.log(`⚠️ Invalid JSON response, retrying... (attempt ${retryCount + 1}/3)`);
        console.log(`Received: ${text.substring(0, 100)}...`);
        
        const delayMs = 2000;
        console.log(`⏳ Waiting ${delayMs/1000} seconds before retry...`);
        await delay(delayMs);
        return queryWithGroq(question, context, history, retryCount + 1);
      } else {
        console.error("Failed to get valid JSON after 3 retries");
        return null;
      }
    }
  } catch (error) {
    console.error("Groq API error:", error);
    if (retryCount < 3) {
      console.log(`⚠️ API error, retrying... (attempt ${retryCount + 1}/3)`);
      const delayMs = Math.pow(2, retryCount) * 1000;
      await delay(delayMs);
      return queryWithGroq(question, context, history, retryCount + 1);
    }
    return null;
  }
}

// Search across multiple collections and combine results
async function searchAllCollections(question: string, chromaClient: any) {
  const allResults: { document: string; metadata: any; distance: number }[] = [];
  
  for (const config of COLLECTION_CONFIG) {
    try {
      const collection = await chromaClient.getCollection({ name: config.name });
      const results = await collection.query({
        queryTexts: [question],
        nResults: 5
      });
      
      if (results.documents[0] && results.documents[0].length > 0) {
        for (let i = 0; i < results.documents[0].length; i++) {
          allResults.push({
            document: results.documents[0][i],
            metadata: results.metadatas[0][i],
            distance: results.distances[0]?.[i] || 1
          });
        }
        console.log(`   📚 Found ${results.documents[0].length} results in ${config.name}`);
      }
    } catch (error) {
      console.error(`Error querying collection ${config.name}:`, error);
    }
  }
  
  allResults.sort((a, b) => a.distance - b.distance);
  
  const topResults = allResults.slice(0, 10);
  const context = topResults.map(r => r.document).join("\n\n---\n\n");
  const sources = topResults.map(r => ({
    title: r.metadata.title,
    type: r.metadata.type,
    collection: r.metadata.collection
  }));
  
  return { context, sources };
}

export async function getAnswer(question: string, history: Message[] = []): Promise<string> {
  const client = getChroma();
  try {
    console.log("\n🔍 Searching all collections for relevant information...");
    const { context, sources } = await searchAllCollections(question, client);
    
    if (!context || context === "No information found.") {
      console.log("   No relevant information found in any collection.");
      return "I couldn't find any information about that in the game guides. Please try asking something else about Clair Obscur: Expedition 33.";
    }
    
    console.log(`   📖 Using context from ${sources.length} sources:`);
    sources.forEach(source => {
      console.log(`      - ${source.title} (${source.type})`);
    });
    
    const answer = await queryWithGroq(question, context, history);
    
    if (answer) {
      return answer;
    } else {
      return "Sorry, I couldn't generate a proper response. Please try again.";
    }
    
  } catch (error) {
    console.error("Error in getAnswer:", error);
    return "Sorry, an error occurred while processing your question.";
  }
}