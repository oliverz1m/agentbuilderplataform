import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '../tools';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it('should have default tools registered', () => {
    const tools = registry.getAllTools();
    expect(tools.length).toBeGreaterThan(0);
  });

  it('should get tool by name', () => {
    const tool = registry.getTool('search_products');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('search_products');
  });

  it('should execute search_products tool', async () => {
    const result = await registry.executeTool('search_products', {
      query: 'notebook',
      maxResults: 5,
    });

    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
  });

  it('should execute check_stock tool', async () => {
    const result = await registry.executeTool('check_stock', {
      productId: 'prod-001',
    });

    expect(result).toBeDefined();
    expect(result.productId).toBe('prod-001');
    expect(result.available).toBeDefined();
  });

  it('should throw error for unknown tool', async () => {
    await expect(registry.executeTool('unknown_tool', {})).rejects.toThrow();
  });

  it('should generate tool definitions', () => {
    const definitions = registry.getToolDefinitions(['search_products']);

    expect(definitions).toHaveLength(1);
    expect(definitions[0].type).toBe('function');
    expect(definitions[0].function.name).toBe('search_products');
  });

  it('should generate tools description', () => {
    const description = registry.getToolsDescription(['search_products']);

    expect(description).toContain('search_products');
    expect(description).toContain('Busca produtos');
  });
});
