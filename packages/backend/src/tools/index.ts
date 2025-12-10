import { Tool } from '../types';
import { searchProductsTool } from './search-products.tool';
import { checkStockTool } from './check-stock.tool';
import { saveLogTool } from './save-log.tool';
import { sendMessageTool } from './send-message.tool';
import { getCurrentTimeTool } from './get-current-time.tool';

/**
 * Tool Registry
 * Manages all available tools for agents
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  /**
   * Register default tools
   */
  private registerDefaultTools(): void {
    this.register(searchProductsTool);
    this.register(checkStockTool);
    this.register(saveLogTool);
    this.register(sendMessageTool);
    this.register(getCurrentTimeTool);
  }

  /**
   * Register a tool
   */
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by names
   */
  getTools(names: string[]): Tool[] {
    return names.map((name) => this.getTool(name)).filter((tool): tool is Tool => !!tool);
  }

  /**
   * Execute a tool
   */
  async executeTool(name: string, parameters: Record<string, any>): Promise<any> {
    const tool = this.getTool(name);

    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      const result = await tool.execute(parameters);
      return result;
    } catch (error: any) {
      throw new Error(`Error executing tool ${name}: ${error.message}`);
    }
  }

  /**
   * Get tool definitions for LLM (function calling format)
   */
  getToolDefinitions(toolNames?: string[]): any[] {
    const tools = toolNames ? this.getTools(toolNames) : this.getAllTools();

    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.parameters.reduce(
            (acc, param) => {
              acc[param.name] = {
                type: param.type,
                description: param.description,
              };
              if (param.default !== undefined) {
                acc[param.name].default = param.default;
              }
              return acc;
            },
            {} as Record<string, any>
          ),
          required: tool.parameters.filter((p) => p.required).map((p) => p.name),
        },
      },
    }));
  }

  /**
   * Get tools description for system prompt
   */
  getToolsDescription(toolNames?: string[]): string {
    const tools = toolNames ? this.getTools(toolNames) : this.getAllTools();

    const descriptions = tools.map((tool) => {
      const params = tool.parameters
        .map((p) => {
          const required = p.required ? ' (required)' : ' (optional)';
          return `    - ${p.name}: ${p.type}${required} - ${p.description}`;
        })
        .join('\n');

      return `### ${tool.name}\n${tool.description}\n\nParameters:\n${params || '    (none)'}`;
    });

    return descriptions.join('\n\n');
  }
}

export const toolRegistry = new ToolRegistry();
