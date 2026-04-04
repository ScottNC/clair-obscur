// src/lib/groqClient.ts
import Groq from 'groq-sdk';
import dotenv from "dotenv";
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from "node:url";
import { delay } from "../utils/delay.js";
import { getChromaClient } from "../utils/getChromaClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

let mockGroq: any = null;
let mockChromaClient: any = null;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

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

// Build messages array with conversation history
function buildMessages(question: string, context: string, history: Message[] = []) : Message[] {
  const messages: Message[] = [
    {
      role: "system",
      content: instructions + "\n\n" + "Context:\n" + context
    }
  ];
  
  for (const msg of history) {
    messages.push({
      role: msg.role,
      content: msg.content
    });
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

export async function getAnswer(question: string, history: Message[] = []): Promise<string> {
  const client = getChroma();
  try {
    const collection = await client.getCollection({ name: "character-data" });
    const results = await collection.query({
      queryTexts: [question],
      nResults: 2
    });
    
    const ragContext = results.documents[0]?.join("\n\n") || "No information found.";

    const answer = await queryWithGroq(question, ragContext, history);
    
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
