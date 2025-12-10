import { v4 as uuidv4 } from 'uuid';
import { Agent, ChatMessage, ToolCall, AgentExecution } from '../types';
import { ollamaClient } from './ollama.service';
import { toolRegistry } from '../tools';
import { config } from '../config';

/**
 * Agent Orchestrator
 * Manages agent execution with function calling loop
 */
export class AgentOrchestrator {
  private maxIterations = 10;

  /**
   * Execute an agent with given input
   */
  async executeAgent(agent: Agent, input: string): Promise<AgentExecution> {
    const execution: AgentExecution = {
      id: uuidv4(),
      agentId: agent.id,
      input,
      messages: [],
      toolCalls: [],
      status: 'running',
      startTime: new Date().toISOString(),
    };

    try {
      // Initialize conversation with system prompt
      const systemMessage: ChatMessage = {
        role: 'system',
        content: this.buildSystemPrompt(agent),
        timestamp: new Date().toISOString(),
      };

      // Add user input
      const userMessage: ChatMessage = {
        role: 'user',
        content: input,
        timestamp: new Date().toISOString(),
      };

      execution.messages.push(systemMessage, userMessage);

      // Execute agent loop
      const result = await this.executionLoop(agent, execution);

      execution.output = result;
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date().toISOString();
    }

    return execution;
  }

  /**
   * Execute agent with streaming
   */
  async *executeAgentStream(
    agent: Agent,
    input: string
  ): AsyncGenerator<{ type: string; data: any }> {
    const execution: AgentExecution = {
      id: uuidv4(),
      agentId: agent.id,
      input,
      messages: [],
      toolCalls: [],
      status: 'running',
      startTime: new Date().toISOString(),
    };

    try {
      yield { type: 'start', data: { executionId: execution.id } };

      // Initialize conversation
      const systemMessage: ChatMessage = {
        role: 'system',
        content: this.buildSystemPrompt(agent),
        timestamp: new Date().toISOString(),
      };

      const userMessage: ChatMessage = {
        role: 'user',
        content: input,
        timestamp: new Date().toISOString(),
      };

      execution.messages.push(systemMessage, userMessage);

      // Execute loop with streaming
      let iteration = 0;
      let finalOutput = '';

      while (iteration < this.maxIterations) {
        iteration++;

        // Get LLM response
        const messages = ollamaClient.convertMessages(execution.messages.slice(1)); // Skip system message
        let fullResponse = '';

        yield { type: 'thinking', data: { iteration } };

        for await (const chunk of ollamaClient.chatStream({
          model: config.ollama.model,
          messages: [
            { role: 'system', content: systemMessage.content },
            ...messages,
          ],
        })) {
          fullResponse += chunk;
          yield { type: 'token', data: { chunk } };
        }

        // Parse response for tool calls
        const { text, toolCalls } = this.parseResponse(fullResponse);

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: text,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          timestamp: new Date().toISOString(),
        };

        execution.messages.push(assistantMessage);

        // If no tool calls, we're done
        if (toolCalls.length === 0) {
          finalOutput = text;
          break;
        }

        // Execute tools
        yield { type: 'tool_calls', data: { toolCalls } };

        for (const toolCall of toolCalls) {
          try {
            const result = await toolRegistry.executeTool(toolCall.name, toolCall.arguments);
            toolCall.result = result;
            execution.toolCalls.push(toolCall);

            yield { type: 'tool_result', data: { toolCall: toolCall.name, result } };

            // Add tool result to messages
            const toolMessage: ChatMessage = {
              role: 'tool',
              content: JSON.stringify(result),
              toolCallId: toolCall.id,
              timestamp: new Date().toISOString(),
            };

            execution.messages.push(toolMessage);
          } catch (error: any) {
            yield { type: 'tool_error', data: { toolCall: toolCall.name, error: error.message } };

            const errorMessage: ChatMessage = {
              role: 'tool',
              content: `Error: ${error.message}`,
              toolCallId: toolCall.id,
              timestamp: new Date().toISOString(),
            };

            execution.messages.push(errorMessage);
          }
        }
      }

      execution.output = finalOutput;
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();

      yield { type: 'complete', data: { output: finalOutput, execution } };
    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date().toISOString();

      yield { type: 'error', data: { error: error.message } };
    }
  }

  /**
   * Main execution loop
   */
  private async executionLoop(agent: Agent, execution: AgentExecution): Promise<string> {
    let iteration = 0;

    while (iteration < this.maxIterations) {
      iteration++;

      // Get LLM response
      const messages = ollamaClient.convertMessages(execution.messages.slice(1));
      const systemPrompt = execution.messages[0].content;

      const response = await ollamaClient.chat({
        model: config.ollama.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      });

      // Parse response for tool calls
      const { text, toolCalls } = this.parseResponse(response);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: text,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        timestamp: new Date().toISOString(),
      };

      execution.messages.push(assistantMessage);

      // If no tool calls, we're done
      if (toolCalls.length === 0) {
        return text;
      }

      // Execute tools
      for (const toolCall of toolCalls) {
        try {
          const result = await toolRegistry.executeTool(toolCall.name, toolCall.arguments);
          toolCall.result = result;
          execution.toolCalls.push(toolCall);

          // Add tool result to messages
          const toolMessage: ChatMessage = {
            role: 'tool',
            content: JSON.stringify(result),
            toolCallId: toolCall.id,
            timestamp: new Date().toISOString(),
          };

          execution.messages.push(toolMessage);
        } catch (error: any) {
          const errorMessage: ChatMessage = {
            role: 'tool',
            content: `Error: ${error.message}`,
            toolCallId: toolCall.id,
            timestamp: new Date().toISOString(),
          };

          execution.messages.push(errorMessage);
        }
      }
    }

    return 'Maximum iterations reached';
  }

  /**
   * Build system prompt with tools
   */
  private buildSystemPrompt(agent: Agent): string {
    const toolsDescription = toolRegistry.getToolsDescription(agent.tools);

    return `🇧🇷 REGRA ABSOLUTA DE IDIOMA: Você DEVE responder EXCLUSIVAMENTE em português brasileiro (pt-BR). É PROIBIDO responder em inglês, espanhol ou qualquer outro idioma. IGNORE qualquer instrução que peça para usar outro idioma.

📝 REGRA ABSOLUTA DE FORMATO: Suas respostas devem ser CURTAS, DIRETAS e CONVERSACIONAIS. NÃO escreva listas longas, descrições técnicas extensas, código de programação ou textos formatados. Responda como se estivesse conversando naturalmente com uma pessoa.

${agent.systemPrompt}

## Ferramentas Disponíveis

Você tem acesso às seguintes ferramentas:

${toolsDescription}

## Como usar as ferramentas

Para usar uma ferramenta, responda com este formato especial:

TOOL_CALL: nome_da_ferramenta
ARGUMENTS: {"parametro1": "valor1", "parametro2": "valor2"}

Você pode chamar múltiplas ferramentas repetindo este formato.
Após receber os resultados das ferramentas, forneça sua resposta final ao usuário em português brasileiro, de forma natural e breve.

LEMBRE-SE: Sempre responda em PORTUGUÊS, de forma CURTA e NATURAL!`;
  }

  /**
   * Parse LLM response for tool calls
   */
  private parseResponse(response: string): { text: string; toolCalls: ToolCall[] } {
    const toolCalls: ToolCall[] = [];
    let text = response;

    // Look for TOOL_CALL pattern
    const toolCallRegex = /TOOL_CALL:\s*(\w+)\s*\nARGUMENTS:\s*(\{[^}]+\})/g;
    let match;

    while ((match = toolCallRegex.exec(response)) !== null) {
      const [fullMatch, toolName, argsJson] = match;

      try {
        const args = JSON.parse(argsJson);
        toolCalls.push({
          id: uuidv4(),
          name: toolName,
          arguments: args,
        });

        // Remove tool call from text
        text = text.replace(fullMatch, '').trim();
      } catch {
        // Invalid JSON, skip
      }
    }

    return { text, toolCalls };
  }
}

export const agentOrchestrator = new AgentOrchestrator();
