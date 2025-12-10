# 🚀 Guia de Otimização de Performance

## ⚡ OTIMIZAÇÕES JÁ APLICADAS

### Backend
- ✅ Compression middleware adicionado
- ✅ Limites de request body (1mb)
- ✅ Logs apenas em desenvolvimento
- ✅ CORS otimizado
- ✅ Timeout configurável no Ollama
- ✅ Context window reduzido (2048 tokens)

### Frontend
- ✅ RefetchInterval aumentado (30s ao invés de 5s)
- ✅ StaleTime configurado (20-60s)
- ✅ Vector stats desabilitado por padrão
- ✅ Retry reduzido (1 tentativa)
- ✅ Limite de logs (20 ao invés de 50)

---

## 🔧 CONFIGURAÇÕES RECOMENDADAS NO OLLAMA

### 1. Usar Modelo Mais Leve
```bash
# Ao invés de llama3.1 (8B), use:
ollama pull phi3          # 3.8B - Muito mais rápido
ollama pull phi3:mini     # 2.7B - Ultra rápido
ollama pull tinyllama     # 1.1B - Extremamente rápido
```

### 2. Limitar Uso de CPU/RAM
Edite `.env` no backend:
```env
# Reduzir context window
OLLAMA_MAX_TOKENS=1024

# Aumentar timeout se necessário
OLLAMA_TIMEOUT=60000

# Usar modelo leve
OLLAMA_MODEL=phi3
```

### 3. Configurar Ollama com Menos Threads
```bash
# Windows
$env:OLLAMA_NUM_THREAD=4
ollama serve

# Ou criar variável permanente
setx OLLAMA_NUM_THREAD 4
```

---

## 💻 OTIMIZAÇÕES DO SISTEMA OPERACIONAL

### Windows 10/11

#### 1. Aumentar Prioridade do Node.js
```powershell
# Rodar backend com prioridade alta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Gabriel.TI\Desktop\VTEX'; $p = Start-Process node -ArgumentList 'node_modules\.bin\tsx', 'watch', 'packages\backend\src\index.ts' -PassThru; $p.PriorityClass = 'High'"
```

#### 2. Desabilitar Programas em Background
```powershell
# Ver processos consumindo recursos
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10

# Fechar programas desnecessários
# - Navegadores com muitas abas
# - Programas de chat (Slack, Teams)
# - IDEs pesadas (se não estiver usando)
```

#### 3. Liberar RAM
```powershell
# Limpar cache do sistema
Clear-RecycleBin -Force
ipconfig /flushdns

# Ver uso de memória
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10
```

---

## ⚙️ CONFIGURAÇÕES NO CÓDIGO

### 1. Desabilitar Features Opcionais

Edite `packages/frontend/src/main.tsx`:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,                    // Sem retry
      staleTime: 60000,            // Cache por 1 minuto
      gcTime: 300000,              // Garbage collection em 5 min
    },
  },
});
```

### 2. Lazy Loading de Componentes

Edite `packages/frontend/src/main.tsx`:
```typescript
import { lazy, Suspense } from 'react';

const AgentsList = lazy(() => import('./components/AgentsList').then(m => ({ default: m.AgentsList })));
const AgentEditor = lazy(() => import('./components/AgentEditor').then(m => ({ default: m.AgentEditor })));
const ChatInterface = lazy(() => import('./components/ChatInterface').then(m => ({ default: m.ChatInterface })));
const Observability = lazy(() => import('./components/Observability').then(m => ({ default: m.Observability })));

// No App:
<Suspense fallback={<div>Carregando...</div>}>
  <Routes>
    <Route path="/agents" element={<AgentsList />} />
    ...
  </Routes>
</Suspense>
```

### 3. Memoização no Chat

Edite `packages/frontend/src/components/ChatInterface.tsx`:
```typescript
import { useMemo } from 'react';

// Dentro do componente:
const sortedMessages = useMemo(() => messages, [messages]);
```

---

## 🎯 PLANO DE AÇÃO IMEDIATO

### Nível 1: Rápido (5 minutos)
```bash
# 1. Trocar modelo para mais leve
ollama pull phi3
# Editar .env: OLLAMA_MODEL=phi3

# 2. Reiniciar serviços
# Ctrl+C nos terminais e rodar novamente:
npm run dev:backend
npm run dev:frontend
```

### Nível 2: Médio (15 minutos)
```bash
# 1. Instalar compression
cd packages/backend
npm install compression @types/compression

# 2. Limpar node_modules e reinstalar
cd ../..
rm -rf node_modules packages/*/node_modules
npm install

# 3. Fechar abas/programas desnecessários no Windows
```

### Nível 3: Avançado (30 minutos)
```bash
# 1. Build de produção (muito mais rápido)
npm run build:backend
npm run build:frontend

# 2. Rodar versão otimizada
cd packages/backend
npm start

# 3. Servir frontend via nginx ou http-server
```

---

## 📊 MONITORAMENTO DE PERFORMANCE

### 1. Verificar Uso de Recursos
```powershell
# CPU e RAM do Node
Get-Process node | Select-Object CPU, WorkingSet, ProcessName

# CPU e RAM do Ollama
Get-Process ollama* | Select-Object CPU, WorkingSet, ProcessName
```

### 2. Métricas no Navegador
Abra DevTools (F12) > Performance:
- **LCP (Largest Contentful Paint)**: Deve ser < 2.5s
- **FID (First Input Delay)**: Deve ser < 100ms
- **CLS (Cumulative Layout Shift)**: Deve ser < 0.1

### 3. Logs de Performance
Adicione no backend `src/index.ts`:
```typescript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log(`SLOW: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});
```

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### 1. "Ollama está demorando muito"
**Causa**: Modelo grande demais para o hardware
**Solução**:
```bash
ollama pull phi3:mini
# Ou
ollama pull tinyllama
```

### 2. "Frontend travando ao digitar"
**Causa**: Re-renders desnecessários
**Solução**: Já aplicado - aumentei staleTime e reduzi refetch

### 3. "RAM em 100%"
**Causa**: Muitos processos rodando
**Solução**:
```powershell
# Fechar tudo e reiniciar apenas o necessário
taskkill /F /IM chrome.exe
taskkill /F /IM code.exe
# Reabrir apenas o necessário
```

### 4. "CPU em 100%"
**Causa**: Ollama processando muito contexto
**Solução**: Já aplicado - reduzi num_ctx para 2048

### 5. "Backend caindo"
**Causa**: Out of memory
**Solução**:
```bash
# Aumentar limite do Node
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run dev:backend
```

---

## 🔥 MODO ULTRA PERFORMANCE

Se mesmo assim estiver lento, use esta configuração extrema:

### backend/.env
```env
OLLAMA_MODEL=tinyllama
OLLAMA_MAX_TOKENS=512
OLLAMA_TIMEOUT=30000
MAX_LOG_ENTRIES=10
CACHE_ENABLED=true
COMPRESSION_ENABLED=true
```

### frontend/src/main.tsx
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 0,
      staleTime: Infinity,  // Nunca refetch automático
    },
  },
});
```

---

## 📈 MELHORIAS FUTURAS (Roadmap)

### Curto Prazo
- [ ] Implementar cache Redis para respostas
- [ ] Adicionar Web Workers para processamento
- [ ] Service Worker para cache offline
- [ ] Virtualização de listas longas

### Médio Prazo
- [ ] Migrar para PostgreSQL (mais rápido que JSON)
- [ ] Adicionar CDN para assets estáticos
- [ ] Implementar SSR (Server-Side Rendering)
- [ ] Code splitting automático

### Longo Prazo
- [ ] Migrar para modelo quantizado (GGUF Q4)
- [ ] Cluster de Ollama (load balancing)
- [ ] Edge computing para respostas
- [ ] GPU acceleration

---

## ✅ CHECKLIST DE OTIMIZAÇÃO

Marque o que você já fez:

**Backend:**
- [ ] Instalou compression
- [ ] Configurou .env com modelo leve
- [ ] Reduziu MAX_LOG_ENTRIES
- [ ] Configurou OLLAMA_NUM_THREAD

**Frontend:**
- [ ] Aumentou staleTime
- [ ] Desabilitou refetch desnecessários
- [ ] Implementou lazy loading
- [ ] Fechou abas do navegador

**Sistema:**
- [ ] Fechou programas em background
- [ ] Limpou cache do Windows
- [ ] Aumentou prioridade do Node
- [ ] Reiniciou o computador

**Ollama:**
- [ ] Trocou para modelo menor (phi3/tinyllama)
- [ ] Configurou NUM_THREAD
- [ ] Reduziu context window
- [ ] Verificou que está usando CPU (não GPU se não tiver)

---

## 🎯 RESULTADO ESPERADO

Com todas as otimizações aplicadas:

| Métrica | Antes | Depois |
|---------|-------|--------|
| Tempo de resposta da API | 500ms | < 100ms |
| Tempo de resposta do LLM | 10-15s | 3-5s |
| Uso de RAM | 2-3GB | 1-1.5GB |
| Uso de CPU | 80-100% | 40-60% |
| Travamentos | Frequentes | Raros/Nenhum |

---

## 📞 SUPORTE

Se continuar com problemas:

1. **Verifique specs do hardware**:
   ```powershell
   Get-WmiObject Win32_ComputerSystem | Select-Object TotalPhysicalMemory
   Get-WmiObject Win32_Processor | Select-Object Name, NumberOfCores
   ```

2. **Mande logs**:
   - Backend: Console onde rodou `npm run dev:backend`
   - Frontend: DevTools > Console (F12)
   - Ollama: `ollama logs`

3. **Hardware mínimo recomendado**:
   - CPU: 4 cores
   - RAM: 8GB
   - Disco: SSD (HDD deixa muito lento)

---

**Última atualização**: Dezembro 2025
**Versão**: 1.1.0 - Performance Optimized
