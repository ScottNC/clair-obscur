import { CloudClient } from "chromadb";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory }  from "@google/generative-ai"
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: 'clair-obscur-chatbot'
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

const instructions = fs.readFileSync(
  path.join(__dirname, "./instructions.txt"), 
  "utf-8"
);

async function queryWithGemini(question: string, context: string): Promise<string | null> {
    const fullPrompt = `${instructions}

    RAG INFORMATION:
    ${context}

    USER QUESTION:
    ${question}`;

      try {
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    try {
      const json = JSON.parse(text);
      return json.message;
    } catch {
      // If response isn't valid JSON, return as is
      return text;
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}

async function queryCharacters() {
  try {
    const collection = await client.getCollection({ name: "character-data" });
    console.log(`📚 Querying collection: character-data\n`);
    
    const questions = [
      "Tell me about Lune",
      "What is Maelle's special ability?",
      "Who leads Expedition 33?",
      "Who is Sonic the Hedgehog"
    ];
    
    for (const question of questions) {
      console.log(`❓ Question: ${question}`);
      
      const results = await collection.query({
        queryTexts: [question],
        nResults: 1
      });
      
      const ragContext = results.documents[0]?.join("\n\n") || "No information found.";
      
      console.log(`📚 Found ${results.documents[0]?.length || 0} relevant chunks`);
      
      // Get answer from Gemini
      const answer = await queryWithGemini(question, ragContext);
      
      if (answer) {
        console.log(`✨ Answer: ${answer}`);
      } else {
        console.log(`❌ Failed to get answer`);
      }
    }
    
  } catch (error) {
    console.error("Error querying:", error);
  }
}

queryCharacters();