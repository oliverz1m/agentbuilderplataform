# 🎯 Guia de Início Rápido

## Passos para rodar o projeto pela primeira vez

### 1. Instalar Ollama

**Windows:**
```powershell
# Baixe em: https://ollama.com/download/windows
# Execute o instalador

# Após instalar, abra PowerShell e execute:
ollama pull llama3.1
ollama pull nomic-embed-text
```

**Linux/Mac:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1
ollama pull nomic-embed-text
```

### 2. Instalar Dependências do Projeto

```bash
# Na raiz do projeto
npm install
```

### 3. Configurar o Backend

```bash
cd packages\backend
copy .env.example .env
cd ..\..
```

### 4. Iniciar o Ollama (deixe rodando)

```powershell
# Abra um novo terminal e execute:
ollama serve
```

### 5. Rodar a Aplicação

```powershell
# Na raiz do projeto
npm run dev
```

Pronto! Acesse:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📝 Testar com Agentes de Exemplo

### Criar Agente de Vendas

1. Acesse http://localhost:3000
2. Clique em "Novo Agente"
3. Preencha:
   - Nome: `Assistente de Vendas`
   - Descrição: `Ajuda clientes a encontrar produtos`
   - System Prompt:
     ```
     Você é um assistente de vendas prestativo.
     Ajude os clientes a encontrar produtos e verificar estoque.
     Seja educado e objetivo.
     ```
   - Tools: marque `search_products` e `check_stock`
4. Salve e clique em "Testar"

### Mensagens de Teste

```
"Olá, preciso de um notebook para programação"
"Quais notebooks vocês têm disponíveis?"
"Qual o estoque do prod-001?"
"Mostre os periféricos disponíveis"
```

## 🔍 Verificar se está funcionando

### Teste o Backend
```powershell
curl http://localhost:3001/api/health
```

### Teste o Ollama
```powershell
curl http://localhost:11434/api/tags
```

## ❗ Problemas Comuns

### Ollama não conecta
```powershell
# Verifique se está rodando
ollama list

# Se não estiver, inicie
ollama serve
```

### Porta em uso
```powershell
# Se a porta 3001 ou 3000 estiver em uso
# Edite:
# packages\backend\.env -> PORT=3002
# packages\frontend\vite.config.ts -> port: 3005
```

### Modelo não encontrado
```powershell
ollama pull llama3.1
```

## 📚 Próximos Passos

1. Explore a interface
2. Crie diferentes tipos de agentes
3. Teste as tools disponíveis
4. Veja os logs em Observabilidade
5. Experimente diferentes prompts

Divirta-se construindo agentes! 🚀
