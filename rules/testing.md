# Testes — Regras e Padrões

Estratégia e qualidade de testes para projetos web.

---

## Princípio fundamental

Testes derivam da **spec/critérios de aceite**, nunca do código já escrito.

## Tipos de teste

### 1. Testes de componente (React)

- Framework: Vitest + React Testing Library
- Testar: renderização, interação, estados, acessibilidade
- Mock de dados: fixtures dedicados, não inline

### 2. Testes de integração

- Testar fluxos completos: navegação → preenchimento → submissão → resposta
- Mock de APIs: MSW (Mock Service Worker) ou handlers dedicados

### 3. Testes E2E

- Framework: Playwright
- Testar: login, CRUD principal, fluxo de pagamento
- Screenshots: capturar em pontos-chave para regressão visual

### 4. Testes de acessibilidade

- `axe-core` via React Testing Library
- Verificar contraste, roles, labels, navegação por teclado

## Convenções

### Organização

```
src/
  __tests__/
    components/    # testes de componentes
    pages/         # testes de páginas
    fixtures/      # dados de teste
    mocks/         # mocks e handlers
```

### Nomenclatura

- Arquivo: `nome-do-componente.test.tsx`
- Describe: componente ou funcionalidade
- It/test: ação esperada em português

```tsx
describe("ProductForm", () => {
  it("deve validar campos obrigatórios", () => { ... })
  it("deve enviar dados ao submeter", () => { ... })
  it("deve mostrar erro quando preço é inválido", () => { ... })
})
```

### Dados de teste

- Fixtures em `__tests__/fixtures/`
- Dados realistas (nomes brasileiros, valores em R$, datas BR)
- Nunca usar "foo", "bar", "test" — usar "Maria Silva", "Pão Francês"

## Antes de declarar tarefa concluída

1. Todos os testes definidos na SPEC devem estar implementados
2. Todos os testes devem estar passando
3. Cobertura mínima: funções de negócio principais
4. Code review deve incluir verificação de testes

## chromium-devtools para validação

Após implementar qualquer componente UI:

1. Abrir a página no browser via chrome-devtools
2. Verificar `list_console_messages` — zero erros
3. Verificar `list_network_requests` — zero 4xx/5xx
4. `take_screenshot` para registro visual
5. `$impeccable audit` para verificação de qualidade

## Playwright MCP para testes E2E

O Playwright MCP está habilitado no workspace para automação de browser.

### Quando usar

- Testar fluxos de navegação (login → listagem → formulário →relatórios)
- Preencher formulários programaticamente
- Capturar screenshots em pontos-chave
- Testar responsividade (mobile/desktop)
- Validar interações complexas (drag, hover, scroll)

### Como usar

```
# Navegar para uma página
"abra http://localhost:3000"

# Clicar em elemento
"clique no botão 'Novo Item'"

# Preencher formulário
"preencha o campo nome com 'Produto Teste' e o preço com '5.50'"

# Tirar screenshot
"tire um screenshot da página atual"

# Verificar texto
"verifique se a mensagem de sucesso aparece na página"
```

### Fluxo de teste completo

```
1. playwright → navegar para a página
2. playwright → interagir (clique, preenchimento)
3. playwright → screenshot do resultado
4. chrome-devtools → verificar console (0 erros)
5. chrome-devtools → verificar rede (0 4xx/5xx)
6. impeccable → audit de qualidade
```
