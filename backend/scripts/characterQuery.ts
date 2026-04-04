import { getAnswer } from "../src/lib/groqClient";
import { delay } from "../src/utils/delay";

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

await queryCharacters();