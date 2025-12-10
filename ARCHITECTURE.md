# 🏗️ Arquitetura do Agent Builder Platform

## Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                      (React + TypeScript)                       │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Agents    │  │    Test     │  │ Observ.     │           │
│  │   Manager   │  │    Chat     │  │ Dashboard   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  State: Zustand + React Query                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP/REST + SSE
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│                     (Express + TypeScript)                      │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Agents   │  │  Chat    │  │  Tools   │  │   RAG    │      │
│  │ CRUD     │  │ Execute  │  │ Execute  │  │  Search  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Agent Orchestrator                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  1. Receive Input                                │   │  │
│  │  │  2. Build System Prompt + Tools                  │   │  │
│  │  │  3. Call LLM (Ollama)                           │   │  │
│  │  │  4. Parse Response for Tool Calls               │   │  │
│  │  │  5. Execute Tools if needed                     │   │  │
│  │  │  6. Return to step 3 (until done)              │   │  │
│  │  │  7. Return Final Response                       │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Ollama     │  │    Vector    │  │   Storage    │        │
│  │   Service    │  │    Store     │  │   Service    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Ollama     │  │   ChromaDB   │  │  JSON Files  │        │
│  │ (localhost)  │  │   (local)    │  │   (local)    │        │
│  │              │  │              │  │              │        │
│  │ - LLM        │  │ - Embeddings │  │ - Agents     │        │
│  │ - Embedding  │  │ - Vector DB  │  │ - Logs       │        │
│  │ - Streaming  │  │ - Similarity │  │ - Memory     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Execução do Agente

```
┌──────────┐
│   User   │
└────┬─────┘
     │ "Find me a notebook"
     ▼
┌─────────────────┐
│  Chat Interface │
└────┬────────────┘
     │ POST /api/agent/run-stream
     ▼
┌─────────────────────────────────────────────────────┐
│              Agent Orchestrator                     │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  System Prompt + User Message               │  │
│  └─────────────────────┬───────────────────────┘  │
│                        ▼                           │
│  ┌─────────────────────────────────────────────┐  │
│  │       LLM (via Ollama)                      │  │
│  │  "I need to search for notebooks"           │  │
│  │  TOOL_CALL: search_products                 │  │
│  │  ARGUMENTS: {"query": "notebook"}           │  │
│  └─────────────────────┬───────────────────────┘  │
│                        ▼                           │
│  ┌─────────────────────────────────────────────┐  │
│  │     Tool Registry                           │  │
│  │  Execute: search_products                   │  │
│  │  Returns: [prod-001, prod-004, ...]        │  │
│  └─────────────────────┬───────────────────────┘  │
│                        ▼                           │
│  ┌─────────────────────────────────────────────┐  │
│  │     Back to LLM with Tool Result           │  │
│  │  "Based on the results, I found..."        │  │
│  └─────────────────────┬───────────────────────┘  │
└────────────────────────┼───────────────────────────┘
                         │
                         ▼
                  ┌──────────┐
                  │   User   │
                  │ (Stream) │
                  └──────────┘
```

## Estrutura de Dados

### Agent
```typescript
{
  id: string
  name: string
  description: string
  systemPrompt: string        // Define comportamento
  tools: string[]             // ['search_products', 'check_stock']
  workflow: WorkflowStep[]    // Passos opcionais
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}
```

### Tool
```typescript
{
  name: string                // Identificador único
  description: string         // O que faz
  parameters: [               // Parâmetros aceitos
    {
      name: string
      type: 'string' | 'number' | 'boolean' | 'object'
      description: string
      required: boolean
    }
  ]
  execute: async (params) => result  // Implementação
}
```

### Execution Flow
```typescript
{
  id: string
  agentId: string
  input: string               // Mensagem do usuário
  messages: [                 // Histórico da conversa
    { role: 'system', content: '...' },
    { role: 'user', content: '...' },
    { role: 'assistant', content: '...' },
    { role: 'tool', content: '...' }
  ],
  toolCalls: [                // Calls executadas
    {
      id: string
      name: string
      arguments: {...}
      result: {...}
    }
  ],
  output: string              // Resposta final
  status: 'running' | 'completed' | 'failed'
}
```

## Comunicação entre Componentes

### Frontend → Backend (HTTP)
```
GET    /api/agents           → Lista agentes
POST   /api/agents           → Cria agente
PUT    /api/agents/:id       → Atualiza agente
DELETE /api/agents/:id       → Remove agente

POST   /api/agent/run        → Executa agente
POST   /api/agent/run-stream → Executa com streaming (SSE)

POST   /api/chat             → Chat direto
POST   /api/rag/search       → Busca semântica
GET    /api/tools            → Lista tools
```

### Backend → Ollama (HTTP)
```
POST /api/chat      → Conversação
POST /api/generate  → Geração de texto
POST /api/embeddings → Geração de embeddings
GET  /api/tags      → Lista modelos
```

### SSE Events (Streaming)
```javascript
// Durante execução do agente:
{ type: 'start', data: { executionId } }
{ type: 'thinking', data: { iteration } }
{ type: 'token', data: { chunk } }          // Tokens da resposta
{ type: 'tool_calls', data: { toolCalls } } // Tools a executar
{ type: 'tool_result', data: { result } }   // Resultado da tool
{ type: 'complete', data: { output } }
{ type: 'error', data: { error } }
```

## Dependências Principais

### Backend
```json
{
  "express": "REST API server",
  "langchain": "LLM utilities (futuro)",
  "chromadb": "Vector database",
  "zod": "Validation"
}
```

### Frontend
```json
{
  "react": "UI framework",
  "@tanstack/react-query": "Data fetching",
  "zustand": "State management",
  "tailwindcss": "Styling",
  "lucide-react": "Icons"
}
```

## Segurança & Boas Práticas

1. **Validação**: Zod schemas em todas as rotas
2. **CORS**: Configurado para localhost (dev)
3. **Rate Limiting**: Implementar em produção
4. **Sanitização**: Inputs validados antes de processar
5. **Logs**: Todas ações importantes registradas

## Escalabilidade

### Atual (MVP)
- Single instance
- Local storage (JSON)
- Local LLM (Ollama)

### Futuro
- Multi-instance com load balancer
- PostgreSQL para persistência
- Redis para cache
- Kubernetes deployment
- Multiple LLM providers

## Performance

### Otimizações Implementadas
- ✅ Streaming de respostas (SSE)
- ✅ React Query caching
- ✅ Lazy loading de componentes
- ✅ Debounce em inputs

### Próximas Otimizações
- [ ] Response caching no backend
- [ ] Connection pooling para ChromaDB
- [ ] CDN para assets estáticos
- [ ] Service Workers para offline

## Monitoramento

### Métricas Disponíveis
- Health check endpoints
- Logs estruturados
- Vector store statistics
- Tool execution tracking

### Futuro
- Prometheus metrics
- Grafana dashboards
- Error tracking (Sentry)
- Performance monitoring

---

Esta arquitetura foi projetada para ser:
- 🎯 **Simples**: Fácil de entender e modificar
- 🚀 **Escalável**: Pode crescer conforme necessário
- 🔒 **Segura**: Validações e boas práticas
- 💪 **Robusta**: Error handling em todas camadas
- 📚 **Documentada**: Código e arquitetura bem documentados
