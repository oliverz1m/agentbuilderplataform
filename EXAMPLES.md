# Agent Builder Platform - Exemplos de Uso

## 🎯 Casos de Uso

### 1. Assistente de E-commerce

**Objetivo:** Ajudar clientes a encontrar produtos e fazer compras

**Configuração:**
```json
{
  "name": "Shopping Assistant",
  "systemPrompt": "Você é um assistente de compras online. Ajude os clientes a encontrar produtos, compare opções e forneça recomendações personalizadas.",
  "tools": ["search_products", "check_stock"]
}
```

**Exemplos de Interação:**
```
User: "Preciso de um setup completo para home office"
Agent: [Usa search_products para buscar: notebook, monitor, teclado, mouse]
      "Encontrei algumas opções excelentes! Para um setup completo, recomendo:
       - Notebook Dell Inspiron (R$ 3.499,99) - 15 em estoque
       - Monitor LG UltraWide (R$ 2.199,99) - 8 em estoque
       ..."

User: "O notebook Dell está disponível?"
Agent: [Usa check_stock com prod-001]
      "Sim! Temos 15 unidades disponíveis do Notebook Dell Inspiron."
```

### 2. Agente de Suporte Técnico

**Objetivo:** Responder dúvidas e registrar tickets

**Configuração:**
```json
{
  "name": "Tech Support",
  "systemPrompt": "Você é um agente de suporte técnico experiente. Diagnostique problemas, forneça soluções e registre todos os casos.",
  "tools": ["save_log", "send_message", "get_current_time"]
}
```

**Exemplos de Interação:**
```
User: "Meu pedido não chegou ainda"
Agent: [Usa get_current_time para verificar data]
      [Usa save_log para registrar o caso]
      "Entendo sua preocupação. Registrei seu caso como prioridade.
       Ticket #12345 criado às 14:30.
       Vou enviar uma atualização por email em até 2 horas."
```

### 3. Analista de Inventário

**Objetivo:** Monitorar estoque e gerar alertas

**Configuração:**
```json
{
  "name": "Inventory Analyst",
  "systemPrompt": "Você é um analista de inventário. Monitore níveis de estoque, identifique produtos críticos e sugira ações.",
  "tools": ["check_stock", "search_products", "save_log"]
}
```

**Exemplos de Interação:**
```
User: "Analise o estoque de eletrônicos"
Agent: [Usa search_products com query="eletrônicos"]
      [Para cada produto, usa check_stock]
      [Usa save_log para registrar análise]
      "Análise de Estoque - Eletrônicos:
       ⚠️ CRÍTICO: Monitor LG (8 unidades) - Reabastecer urgente
       ✅ OK: Notebook Dell (15 unidades)
       ✅ OK: Webcam Logitech (30 unidades)"
```

## 🎨 Templates de System Prompts

### E-commerce
```
Você é um consultor de vendas virtual especializado em [categoria].
Seu objetivo é ajudar os clientes a encontrar produtos perfeitos para suas necessidades.

Diretrizes:
- Sempre pergunte sobre as necessidades específicas do cliente
- Use as tools para buscar produtos atualizados
- Compare opções quando apropriado
- Seja honesto sobre disponibilidade
- Finalize sugerindo próximos passos claros
```

### Suporte Técnico
```
Você é um especialista em suporte técnico com [X] anos de experiência.
Sua missão é resolver problemas rapidamente e com excelência.

Processo:
1. Entenda o problema completamente
2. Faça perguntas diagnósticas
3. Proponha soluções passo a passo
4. Registre todos os casos nos logs
5. Confirme a resolução com o cliente
```

### Análise de Dados
```
Você é um analista de dados especializado em [área].
Transforme dados brutos em insights acionáveis.

Metodologia:
1. Colete dados usando as tools disponíveis
2. Analise padrões e tendências
3. Identifique problemas e oportunidades
4. Forneça recomendações específicas
5. Documente suas análises nos logs
```

## 🔧 Combinações de Tools

### Combo: Vendas Completas
```typescript
tools: [
  "search_products",  // Buscar produtos
  "check_stock",      // Verificar disponibilidade
  "send_message",     // Enviar confirmação
  "save_log"          // Registrar venda
]
```

**Fluxo:**
1. Cliente pede produto
2. Agent busca com `search_products`
3. Verifica estoque com `check_stock`
4. Envia confirmação com `send_message`
5. Registra tudo com `save_log`

### Combo: Suporte Proativo
```typescript
tools: [
  "get_current_time", // Timestamp de eventos
  "save_log",         // Documentar casos
  "send_message"      // Notificar cliente
]
```

### Combo: Gestão de Inventário
```typescript
tools: [
  "search_products",  // Listar produtos
  "check_stock",      // Analisar níveis
  "save_log"          // Relatórios
]
```

## 💡 Dicas de Otimização

### 1. System Prompts Efetivos
- Seja específico sobre o papel do agente
- Defina o tom de comunicação
- Liste etapas de processo quando aplicável
- Inclua exemplos do comportamento esperado

### 2. Seleção de Tools
- Escolha apenas tools relevantes para o caso de uso
- Evite sobrecarregar com muitas opções
- Combine tools que complementam o fluxo

### 3. Testes Iterativos
- Teste com casos reais
- Ajuste o prompt baseado nos resultados
- Monitore logs para identificar problemas
- Refine continuamente

## 📊 Métricas de Sucesso

### Para E-commerce
- Taxa de conversão de consultas
- Produtos encontrados vs. buscados
- Tempo médio de atendimento

### Para Suporte
- Tickets resolvidos
- Tempo de primeira resposta
- Taxa de reincidência

### Para Análise
- Insights gerados
- Precisão das previsões
- Ações implementadas

## 🚀 Casos Avançados

### Multi-Step Reasoning
```
User: "Preciso montar um setup gamer com orçamento de R$ 5000"
Agent: 
  1. [search_products: "notebook gamer"]
  2. [search_products: "monitor gamer"]
  3. [check_stock para cada item]
  4. Calcula combinações dentro do orçamento
  5. Apresenta 3 opções otimizadas
```

### Análise Preditiva
```
User: "Quais produtos vão precisar de reabastecimento?"
Agent:
  1. [search_products: busca todos]
  2. [check_stock: para cada um]
  3. Identifica padrões de consumo
  4. [save_log: registra previsões]
  5. Gera relatório com prioridades
```

---

Para mais exemplos, consulte a documentação ou explore os agentes de exemplo em `data/agents.example.json`.
