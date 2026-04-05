import express from 'express';
import cors from 'cors';
import { getAnswer } from './lib/groqClient';
import { Message } from './types/message';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/chat', async (req, res) => {
  try {
    const { question, history }: { question: string, history: Message[] } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    console.log(`\n📨 Received question: "${question}"`);
    console.log(`📜 History length: ${history?.length || 0} messages`);
    
    const answer = await getAnswer(question, history || []);
    
    res.json({
      answer,
    });
    
  } catch (error) {
    console.error('Error in /chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Ask endpoint: http://localhost:${PORT}/chat`);
});