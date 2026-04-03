import { CloudClient } from "chromadb";
import dotenv from "dotenv";

dotenv.config();

const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: 'clair-obscur-chatbot'
});

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
      
      if (results.documents[0][0]) {
        console.log(`📖 Answer: ${results.documents[0][0]}\n`);
        console.log(`📊 Metadata:`, results.metadatas[0][0]);
        console.log("-".repeat(50));
      } else {
        console.log("❌ No results found\n");
      }
    }
    
  } catch (error) {
    console.error("Error querying:", error);
  }
}

queryCharacters();