import { Router, Request, Response } from 'express';
import { vectorStore } from '../services/vector-store.service';
import { z } from 'zod';

const router = Router();

// Validation schemas
const addMemorySchema = z.object({
  agentId: z.string(),
  content: z.string().min(1),
  metadata: z.record(z.any()).optional().default({}),
});

const searchSchema = z.object({
  query: z.string().min(1),
  agentId: z.string().optional(),
  limit: z.number().min(1).max(50).default(5),
});

/**
 * POST /api/rag/add
 * Add memory entry
 */
router.post('/add', async (req: Request, res: Response) => {
  try {
    const data = addMemorySchema.parse(req.body);

    const id = await vectorStore.addMemory({
      agentId: data.agentId,
      content: data.content,
      metadata: data.metadata,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ id, success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rag/search
 * Search similar memories
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, agentId, limit } = searchSchema.parse(req.body);

    const results = await vectorStore.searchMemories(query, agentId, limit);

    res.json({ results, count: results.length });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/rag/:id
 * Delete memory by ID
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await vectorStore.deleteMemory(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rag/stats
 * Get vector store stats
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await vectorStore.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
