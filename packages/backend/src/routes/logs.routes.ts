import { Router, Request, Response } from 'express';
import { storage } from '../services/storage.service';

const router = Router();

/**
 * GET /api/logs
 * Get recent logs
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await storage.getLogs(limit);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/logs
 * Clear all logs
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    await storage.clearLogs();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
