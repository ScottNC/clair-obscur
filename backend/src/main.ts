import readline from "readline";
import { getAnswer } from "./groqClient";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main () {
  console.log("\n🎮 CLAIR OBSCUR: EXPEDITION 33 - RAG ASSISTANT");
  console.log("\nAsk me anything about the game!\n");

  const askLoop = () => {
    rl.question("👤 You: ", async (input: string) => {
      if (!input.trim()) {
        console.log("\n🤖 Assistant: Please ask a question.\n");
        askLoop();
        return;
      }
      
      const answer = await getAnswer(input);

      console.log(`\n🤖 Assistant: ${answer}\n`);
      
      askLoop();
    });
  };
  
  askLoop();
}

main();