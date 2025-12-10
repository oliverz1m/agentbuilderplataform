# ✅ Checklist de Instalação e Verificação

Use este checklist para garantir que tudo está funcionando corretamente.

## 📋 Pré-Instalação

- [ ] Node.js 18+ instalado
  ```powershell
  node --version  # Deve mostrar v18.x ou superior
  ```

- [ ] npm 9+ instalado
  ```powershell
  npm --version  # Deve mostrar 9.x ou superior
  ```

- [ ] Ollama instalado
  ```powershell
  ollama --version
  ```

## 🔧 Instalação

- [ ] Projeto clonado/baixado
- [ ] Dependências instaladas
  ```powershell
  npm install
  ```

- [ ] Backend configurado
  ```powershell
  # Arquivo .env existe?
  Test-Path packages\backend\.env
  ```

- [ ] Modelos Ollama baixados
  ```powershell
  ollama list
  # Deve mostrar: llama3.1, nomic-embed-text
  ```

## 🚀 Primeira Execução

- [ ] Ollama rodando
  ```powershell
  # Em terminal separado
  ollama serve
  ```

- [ ] Backend inicia sem erros
  ```powershell
  npm run dev:backend
  # Aguarde: "Server running on port 3001"
  ```

- [ ] Frontend inicia sem erros
  ```powershell
  # Em outro terminal
  npm run dev:frontend
  # Aguarde: "Local: http://localhost:3000"
  ```

## 🌐 Verificação de Serviços

### Backend API

- [ ] Health check OK
  ```powershell
  curl http://localhost:3001/api/health
  # Deve retornar status 200
  ```

- [ ] Root endpoint OK
  ```powershell
  curl http://localhost:3001
  # Deve mostrar info da API
  ```

- [ ] Agents endpoint OK
  ```powershell
  curl http://localhost:3001/api/agents
  # Deve retornar array []
  ```

- [ ] Tools endpoint OK
  ```powershell
  curl http://localhost:3001/api/tools
  # Deve retornar lista de tools
  ```

### Ollama

- [ ] Ollama responde
  ```powershell
  curl http://localhost:11434/api/tags
  # Deve listar modelos
  ```

### Frontend

- [ ] Página carrega
  - Abra http://localhost:3000
  - [ ] Sem erros no console (F12)
  - [ ] UI renderiza corretamente

- [ ] Navegação funciona
  - [ ] Menu lateral visível
  - [ ] Links clicáveis
  - [ ] Troca de páginas funciona

## 🧪 Testes Funcionais

### Criar Agente

- [ ] Acessar "Agentes"
- [ ] Clicar "Novo Agente"
- [ ] Preencher formulário:
  - [ ] Nome: "Teste"
  - [ ] Descrição: "Agente de teste"
  - [ ] System Prompt: "Você é um assistente útil"
  - [ ] Tools: Marcar "search_products"
- [ ] Clicar "Criar Agente"
- [ ] Agente aparece na lista

### Testar Agente

- [ ] Na lista, clicar "Testar" no agente criado
- [ ] Chat interface abre
- [ ] Digitar: "Olá, mostre produtos disponíveis"
- [ ] Enviar mensagem
- [ ] Resposta aparece
- [ ] Tool call visível (se aplicável)
- [ ] Conversa flui naturalmente

### Observabilidade

- [ ] Acessar "Observabilidade"
- [ ] Status dos serviços visível:
  - [ ] Ollama: Online (verde)
  - [ ] Vector Store: Online ou Offline
- [ ] Logs aparecem
- [ ] Logs atualizam em tempo real

### Tools

- [ ] Testar busca de produtos
  ```powershell
  curl -X POST http://localhost:3001/api/tools/search_products/execute `
    -H "Content-Type: application/json" `
    -d '{"query": "notebook"}'
  # Deve retornar produtos
  ```

- [ ] Testar verificação de estoque
  ```powershell
  curl -X POST http://localhost:3001/api/tools/check_stock/execute `
    -H "Content-Type: application/json" `
    -d '{"productId": "prod-001"}'
  # Deve retornar estoque
  ```

## 🔍 Verificações Adicionais

### Arquivos Criados

- [ ] Backend data folder
  ```powershell
  Test-Path packages\backend\data
  ```

- [ ] Logs file (após criar agente)
  ```powershell
  Test-Path packages\backend\data\logs.json
  ```

- [ ] Agents file (após criar agente)
  ```powershell
  Test-Path packages\backend\data\agents.json
  ```

### Performance

- [ ] Frontend carrega em < 3 segundos
- [ ] Backend responde em < 1 segundo
- [ ] Chat responde (considerando Ollama pode ser lento)
- [ ] Navegação é fluida
- [ ] Sem travamentos

### Logs

- [ ] Backend mostra logs no terminal
- [ ] Erros são legíveis
- [ ] Requests aparecem no log
- [ ] Frontend console sem erros críticos

## 🐛 Se Algo Falhar

### Backend não inicia
- [ ] Verificar porta 3001 livre
- [ ] Conferir .env existe
- [ ] Ver logs de erro
- [ ] Consultar TROUBLESHOOTING.md

### Frontend não carrega
- [ ] Verificar porta 3000 livre
- [ ] Backend está rodando?
- [ ] Limpar cache do navegador
- [ ] Verificar console do navegador

### Ollama não conecta
- [ ] `ollama serve` está rodando?
- [ ] Porta 11434 livre?
- [ ] Firewall permitindo?
- [ ] Testar: `curl http://localhost:11434/api/tags`

### Agent não responde
- [ ] Ollama está rodando?
- [ ] Modelo correto instalado?
- [ ] System prompt faz sentido?
- [ ] Ver logs do backend

### ChromaDB falha
- [ ] Ignorar se Python não instalado
- [ ] RAG não funciona, mas resto sim
- [ ] Opcional para uso básico

## ✅ Tudo OK?

Se todos os checks acima passaram:

**🎉 PARABÉNS! Sistema está funcionando perfeitamente!**

Você pode:
1. Criar agentes personalizados
2. Testar diferentes prompts
3. Explorar as tools
4. Monitorar via Observabilidade
5. Customizar conforme necessário

## 📚 Próximos Passos

- [ ] Ler EXAMPLES.md para casos de uso
- [ ] Ver DEVELOPMENT.md para customizar
- [ ] Experimentar diferentes modelos
- [ ] Criar suas próprias tools
- [ ] Contribuir com o projeto

## 🆘 Precisa de Ajuda?

1. Consulte TROUBLESHOOTING.md
2. Veja logs para detalhes
3. Teste componentes individualmente
4. Abra issue no GitHub

---

**Data do Check:** _______________

**Versão:** 1.0.0

**Status:** ___ Tudo OK ___ Problemas encontrados

**Notas:**
_____________________________________________
_____________________________________________
_____________________________________________
