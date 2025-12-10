import { ChromaClient, Collection } from 'chromadb';
import { config } from '../config';
import { ollamaClient } from './ollama.service';
import { MemoryEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Vector Store Service using ChromaDB
 */
export class VectorStoreService {
  private client: ChromaClient;
  private collection: Collection | null = null;

  constructor() {
    this.client = new ChromaClient({
      path: config.chroma.path,
    });
  }

  /**
   * Initialize collection
   */
  async initialize(): Promise<void> {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: config.chroma.collection,
        metadata: { 'hnsw:space': 'cosine' },
      });
    } catch (error: any) {
      console.error('Failed to initialize ChromaDB:', error.message);
      throw error;
    }
  }

  /**
   * Add memory entry
   */
  async addMemory(entry: Omit<MemoryEntry, 'id' | 'embedding'>): Promise<string> {
    if (!this.collection) {
      await this.initialize();
    }

    const id = uuidv4();

    // Generate embedding
    const embedding = await ollamaClient.embeddings({
      model: config.ollama.embeddingModel,
      prompt: entry.content,
    });

    // Add to ChromaDB
    await this.collection!.add({
      ids: [id],
      embeddings: [embedding],
      documents: [entry.content],
      metadatas: [
        {
          agentId: entry.agentId,
          timestamp: entry.timestamp,
          ...entry.metadata,
        },
      ],
    });

    return id;
  }

  /**
   * Search similar memories
   */
  async searchMemories(
    query: string,
    agentId?: string,
    limit: number = 5
  ): Promise<MemoryEntry[]> {
    if (!this.collection) {
      await this.initialize();
    }

    // Generate query embedding
    const queryEmbedding = await ollamaClient.embeddings({
      model: config.ollama.embeddingModel,
      prompt: query,
    });

    // Search
    const where = agentId ? { agentId } : undefined;

    const results = await this.collection!.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      where,
    });

    // Convert to MemoryEntry format
    const memories: MemoryEntry[] = [];

    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        const metadata = results.metadatas?.[0]?.[i] as any;
        memories.push({
          id: results.ids[0][i],
          agentId: metadata?.agentId || '',
          content: results.documents?.[0]?.[i] || '',
          embedding: results.embeddings?.[0]?.[i],
          metadata: metadata || {},
          timestamp: metadata?.timestamp || new Date().toISOString(),
        });
      }
    }

    return memories;
  }

  /**
   * Delete memory by ID
   */
  async deleteMemory(id: string): Promise<void> {
    if (!this.collection) {
      await this.initialize();
    }

    await this.collection!.delete({
      ids: [id],
    });
  }

  /**
   * Delete all memories for an agent
   */
  async deleteAgentMemories(agentId: string): Promise<void> {
    if (!this.collection) {
      await this.initialize();
    }

    await this.collection!.delete({
      where: { agentId },
    });
  }

  /**
   * Get collection stats
   */
  async getStats(): Promise<{ count: number }> {
    if (!this.collection) {
      await this.initialize();
    }

    const count = await this.collection!.count();
    return { count };
  }
}

export const vectorStore = new VectorStoreService();
