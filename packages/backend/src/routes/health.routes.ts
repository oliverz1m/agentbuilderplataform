import { Router, Request, Response } from 'express';
import { ollamaClient } from '../services/ollama.service';
import { vectorStore } from '../services/vector-store.service';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      ollama: false,
      vectorStore: false,
    },
  };

  // Check Ollama
  try {
    health.services.ollama = await ollamaClient.healthCheck();
  } catch {
    health.services.ollama = false;
  }

  // Check Vector Store
  try {
    await vectorStore.getStats();
    health.services.vectorStore = true;
  } catch {
    health.services.vectorStore = false;
  }

  // Always return 200 OK - the status of individual services is in the response body
  res.status(200).json(health);
});

export default router;
