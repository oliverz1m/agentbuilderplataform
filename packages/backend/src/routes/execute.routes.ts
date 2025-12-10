import { Router, Request, Response } from 'express';
import { agentOrchestrator } from '../services/agent.service';
import { storage } from '../services/storage.service';
import { z } from 'zod';

const router = Router();

// Validation schema
const executeAgentSchema = z.object({
  agentId: z.string(),
  input: z.string().min(1),
});

/**
 * POST /api/agent/run
 * Execute an agent (non-streaming)
 */
router.post('/run', async (req: Request, res: Response) => {
  try {
    const { agentId, input } = executeAgentSchema.parse(req.body);

    const agent = await storage.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const execution = await agentOrchestrator.executeAgent(agent, input);
    res.json(execution);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent/run-stream
 * Execute an agent with streaming
 */
router.post('/run-stream', async (req: Request, res: Response) => {
  try {
    const { agentId, input } = executeAgentSchema.parse(req.body);

    const agent = await storage.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Setup SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Execute agent with streaming
    for await (const event of agentOrchestrator.executeAgentStream(agent, input)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.end();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }

    // Send error as SSE
    res.write(`data: ${JSON.stringify({ type: 'error', data: { error: error.message } })}\n\n`);
    res.end();
  }
});

export default router;
