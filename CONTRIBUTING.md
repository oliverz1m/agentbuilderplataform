# 🤝 Contribuindo para o Agent Builder Platform

Obrigado por considerar contribuir! Este projeto é open source e aceita contribuições de todos.

## 📋 Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

## 🚀 Como Contribuir

### Reportar Bugs

1. Verifique se o bug já não foi reportado
2. Use o template de issue
3. Inclua:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots se aplicável
   - Ambiente (OS, Node version, etc)

### Sugerir Features

1. Abra uma issue com tag `enhancement`
2. Descreva o problema que a feature resolve
3. Proponha uma solução
4. Discuta alternativas consideradas

### Enviar Pull Requests

#### Setup Inicial

```bash
# Fork o projeto
# Clone seu fork
git clone https://github.com/SEU_USUARIO/agent-builder-platform.git
cd agent-builder-platform

# Adicione o upstream
git remote add upstream https://github.com/ORIGINAL/agent-builder-platform.git

# Instale dependências
npm install
```

#### Workflow

1. **Crie uma branch**
```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bugfix
```

2. **Faça suas mudanças**
   - Escreva código claro e comentado
   - Siga o style guide do projeto
   - Adicione testes se aplicável
   - Atualize documentação

3. **Commit**
```bash
git add .
git commit -m "Add: descrição da mudança"
```

Padrão de commits:
- `Add:` Nova feature
- `Fix:` Correção de bug
- `Update:` Mudanças em código existente
- `Docs:` Apenas documentação
- `Style:` Formatação, lint
- `Refactor:` Refatoração de código
- `Test:` Adicionar/modificar testes
- `Chore:` Tarefas de manutenção

4. **Push**
```bash
git push origin feature/minha-feature
```

5. **Abra Pull Request**
   - Vá para o repositório no GitHub
   - Clique "New Pull Request"
   - Preencha o template
   - Aguarde review

## 🎨 Style Guide

### TypeScript

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
}

async function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Evite
function getUser(id) {
  // sem tipos
}
```

### React

```tsx
// ✅ Bom - Functional component com tipos
interface Props {
  name: string;
  onAction: () => void;
}

export function MyComponent({ name, onAction }: Props) {
  return <button onClick={onAction}>{name}</button>;
}

// ❌ Evite - Sem tipos
export function MyComponent({ name, onAction }) {
  return <button onClick={onAction}>{name}</button>;
}
```

### Nomenclatura

```typescript
// Componentes: PascalCase
MyComponent.tsx

// Services/Utils: camelCase
myService.ts

// Types: PascalCase
interface MyType {}
type MyUnion = 'a' | 'b';

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Funções: camelCase
function fetchUserData() {}

// Booleanos: is/has prefixo
const isLoading = true;
const hasError = false;
```

### Estrutura de Arquivos

```typescript
// ✅ Um export principal por arquivo
// user.service.ts
export class UserService {
  // ...
}

// ❌ Múltiplos exports não relacionados
export class UserService {}
export class ProductService {}
```

## 🧪 Testes

### Backend

```typescript
import { describe, it, expect } from 'vitest';

describe('MyService', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle errors', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### Frontend

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent name="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Rodar Testes

```bash
# Backend
cd packages/backend
npm test

# Frontend
cd packages/frontend
npm test

# Com coverage
npm run test:coverage
```

## 📝 Documentação

### Comentários

```typescript
/**
 * Busca usuário por ID
 * 
 * @param id - ID do usuário
 * @returns Promise com dados do usuário
 * @throws Error se usuário não existe
 */
async function getUser(id: string): Promise<User> {
  // ...
}
```

### README Updates

Se sua mudança afeta como usar o projeto:
- Atualize README.md
- Adicione exemplos
- Atualize screenshots se necessário

### Changelog

Adicione entrada em CHANGELOG.md:
```markdown
## [Unreleased]

### Added
- Nova feature X que faz Y
```

## 🔍 Code Review

Seu PR será revisado. Esperamos:

### Código
- ✅ Funciona corretamente
- ✅ Segue o style guide
- ✅ Testes passam
- ✅ Sem warnings do linter
- ✅ Comentários claros onde necessário

### Commits
- ✅ Mensagens descritivas
- ✅ Commits atômicos (uma mudança lógica por commit)
- ✅ Histórico limpo

### PR
- ✅ Descrição clara do que muda e por quê
- ✅ Referencia issues relacionadas
- ✅ Screenshots se mudanças visuais
- ✅ Testes adicionados/atualizados

## 🎯 Áreas que Precisam de Ajuda

### Alta Prioridade
- [ ] Editor visual de workflows
- [ ] Mais tools prontas
- [ ] Melhorias de performance
- [ ] Testes end-to-end

### Média Prioridade
- [ ] Internacionalização (i18n)
- [ ] Dark mode improvements
- [ ] Acessibilidade (a11y)
- [ ] Mobile responsiveness

### Baixa Prioridade
- [ ] Exemplos adicionais
- [ ] Melhorias de UX
- [ ] Documentação expandida

## 🏆 Reconhecimento

Contribuidores serão:
- Listados no README
- Creditados em release notes
- Mencionados no CHANGELOG

## ❓ Dúvidas?

- 💬 Abra uma [Discussion](link)
- 📧 Email: [seu-email]
- 💡 Issues: Para dúvidas técnicas

## 📚 Recursos Úteis

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Obrigado por contribuir! 🎉**

Cada contribuição, não importa o tamanho, ajuda a tornar este projeto melhor.
