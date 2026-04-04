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

// Helper function for delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function queryWithGemini(question: string, context: string, retryCount: number = 0): Promise<string | null> {
  const fullPrompt = `${instructions}

  RAG INFORMATION:
  ${context}

  USER QUESTION:
  ${question}`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    let cleanedText = text.trim();
    
    // Remove ```json at the start
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '');
    }
    // Remove ``` at the end
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.replace(/\n?```$/, '');
    }
    // Remove any other markdown code block markers
    cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');

    console.log(cleanedText);
    
    try {
      const json = JSON.parse(cleanedText);
      if (json.message && typeof json.message === 'string') {
        return json.message;
      } else {
        throw new Error('Invalid JSON structure: missing "message" field');
      }
    } catch (parseError) {
      console.error(parseError);
      if (retryCount < 3) {
        console.log(`⚠️ Invalid JSON response, retrying... (attempt ${retryCount + 1}/3)`);
        console.log(`Received: ${text.substring(0, 100)}...`);
        
        const delayMs = 2000;
        console.log(`⏳ Waiting ${delayMs/1000} seconds before retry...`);
        await delay(delayMs);
        
        return queryWithGemini(question, context, retryCount + 1);
      } else {
        console.error("Failed to get valid JSON after 3 retries");
        return null;
      }
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    if (retryCount < 3) {
      console.log(`⚠️ API error, retrying... (attempt ${retryCount + 1}/3)`);
      const delayMs = Math.pow(2, retryCount) * 1000;
      await delay(delayMs);
      return queryWithGemini(question, context, retryCount + 1);
    }
    return null;
  }
}

async function getAnswer(question: string): Promise<string> {
  try {
    const collection = await client.getCollection({ name: "character-data" });
    const results = await collection.query({
      queryTexts: [question],
      nResults: 2
    });
    
    const ragContext = results.documents[0]?.join("\n\n") || "No information found.";
    
    const answer = await queryWithGemini(question, ragContext);
    
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

async function queryCharacters() {
  try {
    const questions = [
      "Tell me about Lune",
      "What is Maelle's special ability?",
      "Who leads Expedition 33?",
      "Who is Sonic the Hedgehog?",
      "Tell me about Maelle's foster brother"
    ];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n${"=".repeat(50)}`);
      console.log(`❓ Question ${i + 1}/${questions.length}: ${question}`);
      console.log(`${"=".repeat(50)}`);
      
      const answer = await getAnswer(question);
      
      if (answer) {
        console.log(`✨ Answer: ${answer}`);
      } else {
        console.log(`❌ Failed to get answer`);
      }
      
      if (i < questions.length - 1) {
        console.log(`\n⏳ Waiting 2 seconds before next question...\n`);
        await delay(2000);
      }
    }
    
    console.log(`\n✅ All questions processed!`);
    
  } catch (error) {
    console.error("Error querying:", error);
  }
}

queryCharacters();