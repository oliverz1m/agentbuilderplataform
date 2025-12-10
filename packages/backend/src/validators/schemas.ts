/**
 * Validation Schemas with Zod
 * Provides runtime validation for API requests
 */

import { z } from 'zod';

// Agent Validation
export const createAgentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(10, 'System prompt must be at least 10 characters'),
  tools: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateAgentSchema = createAgentSchema.partial();

// Execution Validation
export const executeAgentSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID format'),
  input: z.string().min(1, 'Input cannot be empty').max(2000, 'Input too long'),
});

// Chat Validation
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  agentId: z.string().uuid().optional(),
});

// Tool Validation
export const executeToolSchema = z.object({
  parameters: z.record(z.unknown()),
});

// RAG Validation
export const addMemorySchema = z.object({
  agentId: z.string().uuid(),
  content: z.string().min(1, 'Content cannot be empty'),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const searchMemorySchema = z.object({
  agentId: z.string().uuid().optional(),
  query: z.string().min(1, 'Query cannot be empty'),
  limit: z.number().min(1).max(50).default(10),
});

// Type exports
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type ExecuteAgentInput = z.infer<typeof executeAgentSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ExecuteToolInput = z.infer<typeof executeToolSchema>;
export type AddMemoryInput = z.infer<typeof addMemorySchema>;
export type SearchMemoryInput = z.infer<typeof searchMemorySchema>;
