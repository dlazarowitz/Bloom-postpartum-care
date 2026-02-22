import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

// Initialize the Anthropic client — the API key is read from ANTHROPIC_API_KEY
// environment variable and NEVER exposed to the mobile client.
const client = new Anthropic();

const SYSTEM_PROMPT = `You are Bloom, a warm, knowledgeable, and supportive AI assistant
specialized in postpartum care. You help new parents with:

- Postpartum physical recovery (vaginal and c-section)
- Newborn care questions (feeding, sleep, diapering, health)
- Breastfeeding and bottle-feeding guidance
- Postpartum mental health awareness and support
- Nutrition and meal planning for recovery
- Baby developmental milestones
- General parenting questions for the first year

IMPORTANT GUIDELINES:
1. Always be empathetic, warm, and non-judgmental. New parents are often exhausted and anxious.
2. For medical questions, provide general educational information but ALWAYS recommend consulting
   their healthcare provider for specific medical advice.
3. If a user expresses thoughts of self-harm, harming their baby, or signs of severe postpartum
   depression, gently acknowledge their feelings, validate them, and provide crisis resources:
   - National Suicide Prevention Lifeline: 988
   - Postpartum Support International: 1-800-944-4773 (text 503-894-9453)
   - Crisis Text Line: Text HOME to 741741
4. Never diagnose conditions. You can discuss symptoms and suggest they talk to a provider.
5. Support all feeding choices (breast, formula, combo) without judgment.
6. Be culturally sensitive and inclusive of all family structures.
7. Provide practical, actionable advice when possible.
8. Keep responses concise but thorough — parents have limited time to read.
9. When discussing recipes or nutrition, focus on postpartum recovery and lactation support.
10. Use evidence-based information and note when practices vary by culture or preference.`;

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: string;
}

router.post('/', async (req: Request, res: Response) => {
  const { messages, context } = req.body as ChatRequestBody;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required and must not be empty.' });
    return;
  }

  // Build the system prompt with optional context
  let systemPrompt = SYSTEM_PROMPT;
  if (context) {
    systemPrompt += `\n\nADDITIONAL CONTEXT: The user is currently viewing the "${context}" section of the app.`;
  }

  try {
    // Use streaming for responsive UX in the mobile app
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      thinking: { type: 'adaptive' },
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Set headers for Server-Sent Events (SSE) streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    const finalMessage = await stream.finalMessage();
    res.write(
      `data: ${JSON.stringify({ done: true, usage: finalMessage.usage })}\n\n`
    );
    res.end();
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      res.status(429).json({
        error: 'The AI assistant is temporarily busy. Please try again in a moment.',
      });
    } else if (error instanceof Anthropic.AuthenticationError) {
      console.error('Anthropic API authentication error — check ANTHROPIC_API_KEY');
      res.status(500).json({ error: 'Service configuration error. Please contact support.' });
    } else {
      console.error('Chat API error:', error);
      res.status(500).json({
        error: 'Something went wrong. Please try again.',
      });
    }
  }
});

// Non-streaming endpoint for simpler use cases
router.post('/simple', async (req: Request, res: Response) => {
  const { messages, context } = req.body as ChatRequestBody;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required and must not be empty.' });
    return;
  }

  let systemPrompt = SYSTEM_PROMPT;
  if (context) {
    systemPrompt += `\n\nADDITIONAL CONTEXT: The user is currently viewing the "${context}" section of the app.`;
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      thinking: { type: 'adaptive' },
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textContent = response.content.find((block) => block.type === 'text');
    res.json({
      message: textContent?.text ?? '',
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export { router as chatRouter };
