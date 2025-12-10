import axios from 'axios';
import { Agent, Tool, AgentExecution, LogEntry, StreamEvent } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// === Health ===
export const healthApi = {
  check: () => api.get('/health'),
};

// === Agents ===
export const agentsApi = {
  getAll: () => api.get<Agent[]>('/agents'),
  getById: (id: string) => api.get<Agent>(`/agents/${id}`),
  create: (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Agent>('/agents', data),
  update: (id: string, data: Partial<Agent>) => api.put<Agent>(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
};

// === Execute ===
export const executeApi = {
  run: (agentId: string, input: string) =>
    api.post<AgentExecution>('/agent/run', { agentId, input }),
  runStream: async function* (agentId: string, input: string): AsyncGenerator<StreamEvent> {
    const response = await fetch(`${API_BASE_URL}/agent/run-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, input }),
    });

    if (!response.ok) throw new Error('Stream failed');
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim().startsWith('data:'));

        for (const line of lines) {
          const data = line.replace('data:', '').trim();
          if (data) {
            try {
              yield JSON.parse(data);
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

// === Chat ===
export const chatApi = {
  send: (messages: any[], agentId?: string, stream?: boolean) =>
    api.post('/chat', { messages, agentId, stream }),
  sendStream: async function* (
    messages: any[],
    agentId?: string
  ): AsyncGenerator<StreamEvent> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, agentId, stream: true }),
    });

    if (!response.ok) throw new Error('Stream failed');
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim().startsWith('data:'));

        for (const line of lines) {
          const data = line.replace('data:', '').trim();
          if (data) {
            try {
              yield JSON.parse(data);
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

// === Tools ===
export const toolsApi = {
  getAll: () => api.get<Tool[]>('/tools'),
  getById: (name: string) => api.get<Tool>(`/tools/${name}`),
  execute: (name: string, parameters: Record<string, any>) =>
    api.post(`/tools/${name}/execute`, parameters),
};

// === RAG ===
export const ragApi = {
  add: (agentId: string, content: string, metadata?: Record<string, any>) =>
    api.post('/rag/add', { agentId, content, metadata }),
  search: (query: string, agentId?: string, limit?: number) =>
    api.post('/rag/search', { query, agentId, limit }),
  delete: (id: string) => api.delete(`/rag/${id}`),
  stats: () => api.get('/rag/stats'),
};

// === Logs ===
export const logsApi = {
  getAll: (limit?: number) => api.get<LogEntry[]>('/logs', { params: { limit } }),
  clear: () => api.delete('/logs'),
};
