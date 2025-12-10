import { describe, it, expect } from 'vitest';
import { OllamaClient } from '../services/ollama.service';

describe('OllamaClient', () => {
  const client = new OllamaClient();

  it('should create client instance', () => {
    expect(client).toBeDefined();
  });

  it('should convert messages correctly', () => {
    const messages = [
      { role: 'system' as const, content: 'System prompt', timestamp: '2024-01-01' },
      { role: 'user' as const, content: 'Hello', timestamp: '2024-01-01' },
      { role: 'assistant' as const, content: 'Hi', timestamp: '2024-01-01' },
    ];

    const converted = client.convertMessages(messages);

    expect(converted).toHaveLength(2);
    expect(converted[0]).toEqual({ role: 'user', content: 'Hello' });
    expect(converted[1]).toEqual({ role: 'assistant', content: 'Hi' });
  });
});
