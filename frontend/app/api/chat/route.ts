import { UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Extract the last user message as the question
  const userMessages = messages.filter((m) => m.role === 'user');
  const lastUserMessage = userMessages.at(-1);
  const question = lastUserMessage?.parts?.find(p => p.type === 'text')?.text?.trim();

  if (!question) {
    return new Response('No question found', { status: 400 });
  }

  // Build history from previous messages
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    content: m.parts?.find(p => p.type === 'text')?.text || ''
  }));

  try {
    // Call the backend
    const response = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const { answer } = await response.json();

    // Create a stream response mimicking the AI SDK format
    const encoder = new TextEncoder();
    const messageId = `msg_${Date.now()}`;
    const stream = new ReadableStream({
      start(controller) {
        // Send text-start
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text-start', id: messageId })}\n\n`));
        // Send the text content
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text-delta', id: messageId, delta: answer })}\n\n`));
        // Send text-end
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text-end', id: messageId })}\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error calling backend:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
