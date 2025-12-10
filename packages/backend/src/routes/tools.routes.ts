import { Router, Request, Response } from 'express';
import { toolRegistry } from '../tools';

const router = Router();

/**
 * GET /api/tools
 * List all available tools
 */
router.get('/', (req: Request, res: Response) => {
  const tools = toolRegistry.getAllTools();

  const toolsList = tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));

  res.json(toolsList);
});

/**
 * GET /api/tools/:name
 * Get specific tool details
 */
router.get('/:name', (req: Request, res: Response) => {
  const tool = toolRegistry.getTool(req.params.name);

  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  res.json({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  });
});

/**
 * POST /api/tools/:name/execute
 * Execute a tool directly (for testing)
 */
router.post('/:name/execute', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const parameters = req.body;

    const result = await toolRegistry.executeTool(name, parameters);

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
