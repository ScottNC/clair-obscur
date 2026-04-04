import readline from "node:readline";
import { getAnswer } from "./lib/groqClient.js";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

let conversationHistory: Message[] = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log("\n🎮 CLAIR OBSCUR: EXPEDITION 33 - RAG ASSISTANT");
  console.log("\nAsk me anything about the game!");

  const askLoop = () => {
    rl.question("👤 You: ", async (input: string) => {
      if (!input.trim()) {
        console.log("\n🤖 Assistant: Please ask a question.\n");
        askLoop();
        return;
      }
      
      conversationHistory.push({
        role: 'user',
        content: input
      });
      
      const answer = await getAnswer(input, conversationHistory);
      
      conversationHistory.push({
        role: 'assistant',
        content: answer
      });
      
      console.log(`\n🤖 Assistant: ${answer}\n`);
      
      askLoop();
    });
  };
  
  askLoop();
}

await main();