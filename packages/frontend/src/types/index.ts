// Type Definitions for Frontend

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  workflow: WorkflowStep[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  type: 'llm' | 'tool' | 'condition';
  config: any;
  nextStep?: string;
}

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
}

export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  input: string;
  messages: ChatMessage[];
  toolCalls: ToolCall[];
  output?: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  error?: string;
}

export interface StreamEvent {
  type: 'start' | 'thinking' | 'token' | 'tool_calls' | 'tool_result' | 'tool_error' | 'complete' | 'error';
  data: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, any>;
}
