import { Router, Request, Response } from 'express';
import { storage } from '../services/storage.service';
import { createAgentSchema, updateAgentSchema } from '../validators/schemas';
import { ValidationError, NotFoundError } from '../types/errors';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/agents
 * List all agents
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const agents = await storage.getAllAgents();
    logger.info('Listed all agents', { count: agents.length });
    res.json(agents);
  } catch (error) {
    logger.error('Failed to list agents', error);
    res.status(500).json({ error: 'Failed to retrieve agents' });
  }
/**
 * GET /api/agents/:id
 * Get agent by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const agent = await storage.getAgent(req.params.id);

    if (!agent) {
      throw new NotFoundError('Agent');
    }

    logger.info('Retrieved agent', { agentId: req.params.id });
    res.json(agent);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    logger.error('Failed to get agent', error, { agentId: req.params.id });
    res.status(500).json({ error: 'Failed to retrieve agent' });
  }
}); res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agents
 * Create new agent
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createAgentSchema.parse(req.body);
    const agent = await storage.createAgent(data);
    logger.info('Agent created', { agentId: agent.id, name: agent.name });
    res.status(201).json(agent);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    logger.error('Failed to create agent', error, { body: req.body });
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

/**
 * PUT /api/agents/:id
 * Update agent
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data = updateAgentSchema.parse(req.body);
    const agent = await storage.updateAgent(req.params.id, data);

    if (!agent) {
      throw new NotFoundError('Agent');
    }

    logger.info('Agent updated', { agentId: req.params.id });
    res.json(agent);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/agents/:id
 * Delete agent
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await storage.deleteAgent(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
