# 🔧 Troubleshooting Guide

## Problemas Comuns e Soluções

### 1. Ollama não conecta

#### Sintomas
- Health check falha para Ollama
- Erro: "Ollama API error: Failed to fetch"
- Backend não consegue gerar respostas

#### Diagnóstico
```powershell
# Teste se Ollama está rodando
curl http://localhost:11434/api/tags
```

#### Soluções

**a) Ollama não está rodando**
```powershell
# Inicie o Ollama
ollama serve
```

**b) Porta diferente**
```powershell
# Se Ollama roda em porta diferente
# Edite packages\backend\.env
OLLAMA_BASE_URL=http://localhost:PORTA_CORRETA
```

**c) Firewall bloqueando**
```powershell
# Permita Ollama no Firewall do Windows
# Configurações > Firewall > Permitir app
```

---

### 2. Modelo não encontrado

#### Sintomas
- Erro: "model 'llama3.1' not found"
- Chat não responde

#### Solução
```powershell
# Liste modelos instalados
ollama list

# Baixe o modelo necessário
ollama pull llama3.1

# Para embeddings
ollama pull nomic-embed-text
```

---

### 3. Porta em uso (3000 ou 3001)

#### Sintomas
- Erro: "EADDRINUSE: address already in use"
- Aplicação não inicia

#### Solução

**Para Backend (porta 3001):**
```powershell
# Encontre o processo
netstat -ano | findstr :3001

# Mate o processo (substitua PID)
taskkill /PID <PID> /F

# OU mude a porta em packages\backend\.env
PORT=3002
```

**Para Frontend (porta 3000):**
```powershell
# Mate o processo
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# OU edite packages\frontend\vite.config.ts
server: { port: 3005 }
```

---

### 4. ChromaDB não inicializa

#### Sintomas
- Warning: "Vector store initialization failed"
- RAG features não funcionam

#### Causa
ChromaDB requer Python. A aplicação funciona sem ele, mas sem RAG.

#### Solução (Opcional - para habilitar RAG)
```powershell
# Instale Python 3.8+
# https://www.python.org/downloads/

# Instale ChromaDB
pip install chromadb

# Reinicie o backend
npm run dev:backend
```

**Nota:** RAG é opcional. O resto funciona normalmente sem ele.

---

### 5. Dependências faltando

#### Sintomas
- Erro: "Cannot find module"
- Import errors

#### Solução
```powershell
# Na raiz do projeto
npm install

# Se persistir, limpe e reinstale
rm -r node_modules
rm -r packages/backend/node_modules
rm -r packages/frontend/node_modules
npm install
```

---

### 6. Build falha

#### Sintomas
- Erro durante `npm run build`
- TypeScript errors

#### Solução
```powershell
# Verifique erros de tipo
cd packages/backend
npm run lint

cd ../frontend
npm run lint

# Limpe e rebuilde
npm run clean
npm run build
```

---

### 7. Frontend não conecta ao backend

#### Sintomas
- Network errors no console
- API calls falham

#### Diagnóstico
```powershell
# Teste o backend diretamente
curl http://localhost:3001/api/health
```

#### Soluções

**a) Backend não está rodando**
```powershell
npm run dev:backend
```

**b) Proxy não configurado**
Verifique `packages/frontend/vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

**c) CORS issues**
Verifique `packages/backend/src/index.ts`:
```typescript
app.use(cors());
```

---

### 8. Agente não responde / Fica travado

#### Sintomas
- Chat fica "pensando" infinitamente
- Execution não completa

#### Causas Comuns

**a) Ollama lento**
- Modelo muito grande
- Hardware insuficiente

**Solução:**
```powershell
# Use modelo menor
ollama pull phi3
# Edite .env
OLLAMA_MODEL=phi3
```

**b) Loop infinito de tools**
- Agent chama tools repetidamente

**Solução:**
Ajuste o system prompt para ser mais direto:
```
Seja objetivo. Use tools apenas quando necessário.
Após obter informações, responda diretamente ao usuário.
```

**c) Timeout**
```typescript
// Aumente timeout em services/agent.service.ts
private maxIterations = 15; // Era 10
```

---

### 9. Stream interrompido

#### Sintomas
- Resposta para no meio
- SSE connection drops

#### Soluções

**a) Timeout do navegador**
```typescript
// Aumente em lib/api.ts
const response = await fetch(url, {
  // ...
  signal: AbortSignal.timeout(60000) // 60 segundos
});
```

**b) Buffer cheio**
```typescript
// Em services/agent.service.ts
// Force flush do stream periodicamente
```

---

### 10. Logs não aparecem

#### Sintomas
- Observabilidade vazia
- save_log não funciona

#### Solução
```powershell
# Verifique permissões da pasta data
# Crie manualmente se necessário
mkdir packages\backend\data

# Verifique se o arquivo existe
ls packages\backend\data\logs.json

# Se não existir, crie vazio
echo "[]" > packages\backend\data\logs.json
```

---

### 11. Performance Lenta

#### Sintomas
- UI travando
- Respostas demoradas

#### Soluções

**a) Otimizar Ollama**
```powershell
# Use modelo menor
ollama pull phi3

# Reduza contexto
# Em system prompt, seja mais conciso
```

**b) Limpar cache**
```powershell
# Frontend
cd packages/frontend
rm -r .vite
rm -r dist

# Backend
cd packages/backend
rm -r dist
rm -r chroma  # Se ChromaDB estiver muito grande

# Rebuilde
npm run build
```

**c) Limitar histórico**
```typescript
// Em chat.store.ts
// Limite mensagens
const MAX_MESSAGES = 50;
if (state.messages.length > MAX_MESSAGES) {
  // Remova mensagens antigas
}
```

---

### 12. TypeScript Errors

#### Sintomas
- Red squiggles no VS Code
- Type errors

#### Soluções
```powershell
# Reinicie TypeScript server no VS Code
# Ctrl+Shift+P > "TypeScript: Restart TS Server"

# Limpe e reinstale types
rm -r node_modules/@types
npm install

# Verifique tsconfig.json está correto
```

---

## Debugging Avançado

### Habilitar Debug Logs

**Backend:**
```typescript
// Em config/index.ts
export const config = {
  debug: true, // Adicione isto
  // ...
};

// Use em services
if (config.debug) {
  console.log('[DEBUG]', data);
}
```

**Frontend:**
```typescript
// No console do navegador
localStorage.setItem('debug', 'true');
```

### Inspecionar Network

1. Abra DevTools (F12)
2. Aba Network
3. Filtre por "api/"
4. Veja requests/responses
5. Para SSE: filtre por "EventStream"

### Logs do Ollama

```powershell
# Veja logs do Ollama
ollama logs
```

### Health Check Completo

```powershell
# Script de diagnóstico
curl http://localhost:3001/api/health
curl http://localhost:11434/api/tags
curl http://localhost:3000

# Tudo deve retornar 200 OK
```

---

## Quando pedir ajuda

Se após tentar as soluções acima o problema persistir:

1. **Colete informações:**
   - Versão do Node: `node --version`
   - Versão do Ollama: `ollama --version`
   - Sistema Operacional
   - Erro completo (stack trace)
   - Logs relevantes

2. **Reproduza o problema:**
   - Passos exatos para reproduzir
   - Comportamento esperado
   - Comportamento atual

3. **Abra uma issue:**
   - GitHub Issues do projeto
   - Inclua todas as informações acima
   - Screenshots se aplicável

---

## Recursos Úteis

- [Ollama Docs](https://github.com/ollama/ollama/tree/main/docs)
- [Node.js Docs](https://nodejs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Dica:** Mantenha um log das soluções que funcionaram para você. Cada ambiente pode ter peculiaridades!
