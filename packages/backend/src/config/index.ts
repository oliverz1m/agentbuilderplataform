import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'phi3',
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '60000', 10),
    maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS || '1024', 10),
  },
  chroma: {
    path: process.env.CHROMA_PATH || './chroma',
    collection: process.env.CHROMA_COLLECTION || 'agent_memory',
  },
  data: {
    path: process.env.DATA_PATH || './data',
    maxLogEntries: parseInt(process.env.MAX_LOG_ENTRIES || '50', 10),
  },
  performance: {
    compressionEnabled: process.env.COMPRESSION_ENABLED !== 'false',
  },
};
