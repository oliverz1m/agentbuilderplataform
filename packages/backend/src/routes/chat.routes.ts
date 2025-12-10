import { Router, Request, Response } from 'express';
import { ollamaClient } from '../services/ollama.service';
import { agentOrchestrator } from '../services/agent.service';
import { storage } from '../services/storage.service';
import { z } from 'zod';

const router = Router();

// Validation schema
const chatSchema = z.object({
  agentId: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  stream: z.boolean().default(false),
});

/**
 * POST /api/chat
 * Chat with an agent or direct LLM
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { agentId, messages, stream } = chatSchema.parse(req.body);

    // If agentId provided, use agent
    if (agentId) {
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Get last user message
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
      if (!lastUserMessage) {
        return res.status(400).json({ error: 'No user message found' });
      }

      if (stream) {
        // Setup SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const event of agentOrchestrator.executeAgentStream(
          agent,
          lastUserMessage.content
        )) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }

        res.end();
      } else {
        const execution = await agentOrchestrator.executeAgent(agent, lastUserMessage.content);
        res.json({ response: execution.output, execution });
      }
    } else {
      // Direct LLM chat
      if (stream) {
        // Setup SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of ollamaClient.chatStream({
          model: 'llama3.1',
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        })) {
          res.write(`data: ${JSON.stringify({ type: 'token', data: { chunk } })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ type: 'done', data: {} })}\n\n`);
        res.end();
      } else {
        const response = await ollamaClient.chat({
          model: 'llama3.1',
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        res.json({ response });
      }
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
