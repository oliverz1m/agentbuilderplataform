# 🛠️ Guia de Desenvolvimento

## Estrutura do Projeto

### Backend (`packages/backend`)

```
src/
├── config/           # Configurações (env vars, etc)
├── routes/           # Express routes (REST API)
├── services/         # Business logic
│   ├── ollama.service.ts      # Cliente Ollama
│   ├── agent.service.ts       # Orquestração de agentes
│   ├── vector-store.service.ts # ChromaDB/RAG
│   └── storage.service.ts     # Persistência JSON
├── tools/            # Tools customizadas
│   ├── index.ts               # Registry de tools
│   ├── search-products.tool.ts
│   ├── check-stock.tool.ts
│   └── ...
├── types/            # TypeScript types
└── index.ts          # Entry point
```

### Frontend (`packages/frontend`)

```
src/
├── components/       # React components
│   ├── ui/          # Componentes base (Button, Card, etc)
│   ├── AgentsList.tsx
│   ├── AgentEditor.tsx
│   ├── ChatInterface.tsx
│   └── Observability.tsx
├── store/           # Zustand stores
│   ├── agent.store.ts
│   └── chat.store.ts
├── lib/             # Utilities
│   ├── api.ts       # API client
│   └── utils.ts     # Helper functions
├── types/           # TypeScript types
└── main.tsx         # Entry point
```

## 🔧 Adicionando Novas Features

### Criar Nova Tool

1. Crie o arquivo da tool:
```typescript
// packages/backend/src/tools/minha-tool.tool.ts
import { Tool } from '../types';

export const minhaToolTool: Tool = {
  name: 'minha_tool',
  description: 'O que essa tool faz',
  parameters: [
    {
      name: 'parametro1',
      type: 'string',
      description: 'Descrição do parâmetro',
      required: true,
    },
  ],
  execute: async (params) => {
    const { parametro1 } = params;
    
    // Sua lógica aqui
    
    return {
      sucesso: true,
      dados: 'resultado',
    };
  },
};
```

2. Registre no ToolRegistry:
```typescript
// packages/backend/src/tools/index.ts
import { minhaToolTool } from './minha-tool.tool';

// No constructor:
this.register(minhaToolTool);
```

3. Teste:
```bash
curl -X POST http://localhost:3001/api/tools/minha_tool/execute \
  -H "Content-Type: application/json" \
  -d '{"parametro1": "valor"}'
```

### Adicionar Nova Rota

1. Crie o arquivo de rota:
```typescript
// packages/backend/src/routes/minha-rota.routes.ts
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  res.json({ message: 'Hello' });
});

export default router;
```

2. Registre no servidor:
```typescript
// packages/backend/src/index.ts
import minhaRota from './routes/minha-rota.routes';

app.use('/api/minha-rota', minhaRota);
```

### Criar Novo Componente React

1. Crie o componente:
```typescript
// packages/frontend/src/components/MeuComponente.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function MeuComponente() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Componente</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Conteúdo */}
      </CardContent>
    </Card>
  );
}
```

2. Adicione à rota (se necessário):
```typescript
// packages/frontend/src/main.tsx
import { MeuComponente } from './components/MeuComponente';

// Nas Routes:
<Route path="/minha-rota" element={<MeuComponente />} />
```

## 🧪 Testes

### Backend

```bash
cd packages/backend

# Rodar todos os testes
npm test

# Watch mode
npm test -- --watch

# Com coverage
npm run test:coverage
```

Exemplo de teste:
```typescript
import { describe, it, expect } from 'vitest';
import { minhaFuncao } from '../services/meu-service';

describe('MeuService', () => {
  it('should do something', () => {
    const result = minhaFuncao('input');
    expect(result).toBe('expected');
  });
});
```

### Frontend

```bash
cd packages/frontend

# Rodar testes
npm test

# Watch mode
npm test -- --watch
```

## 🎨 Estilização

Usamos Tailwind CSS. Exemplos:

```tsx
// Cores
<div className="bg-primary text-primary-foreground">

// Layout
<div className="flex items-center justify-between gap-4">

// Responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Estados
<button className="hover:bg-accent disabled:opacity-50">
```

Customização em `tailwind.config.js` e variáveis CSS em `src/index.css`.

## 📦 Gerenciamento de Estado

### Zustand Store

```typescript
// Criar nova store
import { create } from 'zustand';

interface MinhaStore {
  valor: string;
  setValor: (v: string) => void;
}

export const useMinhaStore = create<MinhaStore>((set) => ({
  valor: '',
  setValor: (v) => set({ valor: v }),
}));

// Usar no componente
function MeuComponente() {
  const { valor, setValor } = useMinhaStore();
  
  return <div>{valor}</div>;
}
```

### React Query

```typescript
// Fetch de dados
import { useQuery } from '@tanstack/react-query';

function MeuComponente() {
  const { data, isLoading } = useQuery({
    queryKey: ['meus-dados'],
    queryFn: async () => {
      const res = await api.get('/endpoint');
      return res.data;
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  return <div>{data}</div>;
}

// Mutation (POST, PUT, DELETE)
import { useMutation, useQueryClient } from '@tanstack/react-query';

function MeuComponente() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data) => api.post('/endpoint', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meus-dados'] });
    },
  });
  
  return (
    <button onClick={() => mutation.mutate({ x: 1 })}>
      Salvar
    </button>
  );
}
```

## 🔌 Integração com Ollama

### Adicionar Novo Modelo

```bash
# Baixar modelo
ollama pull nome-do-modelo

# Usar no backend
# Edite packages/backend/.env
OLLAMA_MODEL=nome-do-modelo
```

### Customizar Parâmetros do Modelo

```typescript
// Em services/ollama.service.ts
const response = await ollamaClient.chat({
  model: 'llama3.1',
  messages: [...],
  options: {
    temperature: 0.7,  // Criatividade (0-1)
    top_p: 0.9,        // Nucleus sampling
    top_k: 40,         // Top-k sampling
    num_predict: 512,  // Max tokens
  },
});
```

## 🐛 Debug

### Backend
```typescript
// Adicione logs
console.log('Debug:', variavel);

// Use debugger
debugger;
```

### Frontend
```typescript
// React DevTools (instale a extensão)
// Zustand DevTools
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools((set) => ({ ... }))
);
```

### API Debugging
```bash
# Teste endpoints
curl -X GET http://localhost:3001/api/agents

# Com body
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

## 📝 Convenções de Código

### Nomenclatura
- Componentes: `PascalCase` (ex: `AgentsList`)
- Arquivos: `kebab-case` (ex: `agent-service.ts`)
- Variáveis/Funções: `camelCase` (ex: `getUserData`)
- Types/Interfaces: `PascalCase` (ex: `Agent`, `ToolParameter`)

### Organização de Imports
```typescript
// 1. External
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal
import { api } from '@/lib/api';
import { useStore } from '@/store';

// 3. Components
import { Button } from '@/components/ui/button';

// 4. Types
import type { Agent } from '@/types';
```

### TypeScript
- Use tipos explícitos quando não for óbvio
- Prefira interfaces para objetos
- Use `type` para unions e primitivos
- Evite `any`, use `unknown` quando necessário

## 🚀 Performance

### Frontend
- Use `React.memo` para componentes pesados
- Lazy load rotas: `const Page = lazy(() => import('./Page'))`
- Optimize re-renders com `useMemo` e `useCallback`

### Backend
- Cache responses quando possível
- Use streaming para respostas grandes
- Implemente rate limiting se necessário

## 📚 Recursos

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)

## 💬 Dúvidas?

Consulte o README principal ou abra uma issue no repositório.

Happy coding! 🎉
