# SPEC — Controle de Estoque Padaria (MVP)

> Documento técnico detalhado. Complementa o PRD e o `tech-decisions.md`.
> Data: 2026-07-23

---

## 1. Visão Geral

Sistema web Next.js + Supabase para controle de estoque de padaria pequena.
Foco em: cadastro (produtos/fornecedores), movimentação (entradas/saídas) e
visualização (dashboard). Single-role, sem permissões complexas no MVP.

---

## 2. Estrutura de Rotas

| Rota | Tipo | Auth | Descrição |
|------|------|------|-----------|
| `/login` | Page (público) | Não | Formulário de login |
| `/register` | Page (público, opcional) | Não | Formulário de registro (se habilitado) |
| `/` | Page (autenticado) | Sim | Dashboard |
| `/produtos` | Page | Sim | Listagem de produtos |
| `/produtos/novo` | Page | Sim | Criar produto |
| `/produtos/[id]` | Page | Sim | Editar produto |
| `/fornecedores` | Page | Sim | Listagem |
| `/fornecedores/novo` | Page | Sim | Criar |
| `/fornecedores/[id]` | Page | Sim | Editar |
| `/entradas` | Page | Sim | Listagem de notas de entrada |
| `/entradas/nova` | Page | Sim | Criar nota |
| `/entradas/[id]` | Page | Sim | Visualizar nota (read-only) |
| `/saidas` | Page | Sim | Listagem de saídas |
| `/saidas/nova` | Page | Sim | Criar saída |
| `/saidas/[id]` | Page | Sim | Visualizar saída (read-only) |

---

## 3. Contratos de Dados (TypeScript)

```ts
// Tipos principais (gerados via supabase gen types + overrides manuais)

type Unidade = 'kg' | 'g' | 'un' | 'L' | 'ml' | 'pacote';
type TipoSaida = 'venda' | 'consumo' | 'perda';

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  unidade: Unidade;
  preco_custo: number;
  preco_venda: number;
  estoque_minimo: number;
  estoque_atual: number;
  codigo_barras: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  contato: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  prazo_pagamento_dias: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface Entrada {
  id: string;
  fornecedor_id: string;
  numero_nf: string;
  data_entrada: string; // ISO date
  observacao: string | null;
  created_by: string;
  created_at: string;
  itens?: EntradaItem[];
  fornecedor?: Fornecedor;
}

interface EntradaItem {
  id: string;
  entrada_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  produto?: Produto;
}

interface Saida {
  id: string;
  tipo: TipoSaida;
  data_saida: string;
  observacao: string | null;
  created_by: string;
  created_at: string;
  itens?: SaidaItem[];
}

interface SaidaItem {
  id: string;
  saida_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario_venda: number;
  subtotal: number;
  produto?: Produto;
}
```

---

## 4. Server Actions (Contratos)

### `produtos.ts`

```ts
listarProdutos({ busca?, categoria?, page?, pageSize? }): Promise<{ data: Produto[], total: number }>
obterProduto(id: string): Promise<Produto | null>
criarProduto(input: ProdutoInput): Promise<Produto>
atualizarProduto(id: string, input: ProdutoInput): Promise<Produto>
desativarProduto(id: string): Promise<void>  // soft delete
```

**Regras:**
- `desativarProduto` lança erro se houver `entrada_itens` ou `saida_itens` referenciando o produto
- `criarProduto` valida com Zod antes de inserir
- `atualizarProduto` não permite alterar `estoque_atual` (mantido por trigger)

### `fornecedores.ts`

```ts
listarFornecedores({ busca?, page?, pageSize? }): Promise<{ data: Fornecedor[], total: number }>
obterFornecedor(id: string): Promise<Fornecedor | null>
criarFornecedor(input: FornecedorInput): Promise<Fornecedor>
atualizarFornecedor(id: string, input: FornecedorInput): Promise<Fornecedor>
desativarFornecedor(id: string): Promise<void>
```

**Regras:**
- CNPJ validado por máscara/formato (regex) + check de duplicidade
- `desativarFornecedor` lança erro se houver `entradas` referenciando o fornecedor

### `entradas.ts`

```ts
listarEntradas({ fornecedor_id?, data_inicio?, data_fim?, page?, pageSize? }): Promise<...>
obterEntrada(id: string): Promise<Entrada | null>
criarEntrada(input: { fornecedor_id, numero_nf, data_entrada, observacao?, itens: [{ produto_id, quantidade, preco_unitario }] }): Promise<Entrada>
```

**Regras:**
- Validação Zod: `itens.length >= 1`, cada item `quantidade > 0`, `preco_unitario >= 0`
- Operação atômica: INSERT em `entradas` + INSERTs em `entrada_itens` em transação
- Trigger atualiza `produtos.estoque_atual` automaticamente
- `revalidatePath('/entradas')` e `revalidatePath('/produtos')` e `revalidatePath('/')`

### `saidas.ts`

```ts
listarSaidas({ tipo?, data_inicio?, data_fim?, page?, pageSize? }): Promise<...>
obterSaida(id: string): Promise<Saida | null>
criarSaida(input: { tipo, data_saida, observacao?, itens: [{ produto_id, quantidade, preco_unitario_venda }] }): Promise<Saida>
```

**Regras:**
- Validação Zod: `quantidade > 0`
- `preco_unitario_venda` é o preço de venda do produto **no momento** (snapshot)
- Operação atômica: INSERT em `saidas` + INSERTs em `saida_itens` em transação
- Trigger atualiza `produtos.estoque_atual` (pode ficar negativo)
- `revalidatePath('/saidas')` e `revalidatePath('/produtos')` e `revalidatePath('/')`

---

## 5. Telas e Componentes

### 5.1 Layout Global (`(app)/layout.tsx`)

- AuthGuard: redirect `/login` se não autenticado
- Sidebar fixa (desktop) / Sheet drawer (mobile)
- Header com nome do usuário + botão logout
- Toaster (sonner) para feedback

### 5.2 Sidebar

Itens:
- 🏠 Dashboard
- 📦 Produtos
- 🚚 Fornecedores
- ⬇️ Entradas
- ⬆️ Saídas

Badge vermelha no ícone de Produtos quando há alertas de estoque mínimo (qtd > 0).

### 5.3 Dashboard (`/`)

**Layout:** grid responsivo

**Linha 1 — Cards de métrica (3-4 colunas):**
| Card | Conteúdo |
|------|----------|
| Total de Itens | Soma de `estoque_atual` (numérico) |
| Valor Total (R$) | Soma de `estoque_atual * preco_custo` (formato BR R$) |
| Alertas Mínimo | Contador de produtos com `estoque_atual <= estoque_minimo AND ativo=true` |
| Movimentações (30d) | Soma de entradas + saídas dos últimos 30 dias |

**Linha 2 — Gráfico:**
- BarChart: entradas vs saídas por dia (últimos 30 dias)
- Usar `recharts` (já validado leve e compatível com shadcn)

**Linha 3 — Tabela de alertas:**
- Produtos com `estoque_atual <= estoque_minimo AND ativo=true`
- Colunas: Nome | Categoria | Estoque Atual | Estoque Mínimo | Diferença | Ações (link para editar)
- Sem ordenação default — por nome
- Max 20 itens (top 20 críticos)

**Filtro de período (header da página):**
- Seletor 7d / 30d / 90d (afeta gráfico e contador de movimentações)
- Default: 30d

### 5.4 Produtos (`/produtos`)

- Tabela com colunas: Nome | Categoria | Unidade | Estoque | Mínimo | Preço Custo | Preço Venda | Status | Ações
- Status: badge verde (estoque > mínimo) / vermelho (estoque ≤ mínimo) / cinza (inativo)
- Busca textual por nome
- Filtro por categoria (Select)
- Filtro: "Apenas com estoque baixo" (checkbox)
- Botão "Novo Produto" no header
- Ações por linha: Editar / Desativar
- Paginação 20 itens/página

### 5.5 Formulário de Produto (`/produtos/novo`, `/produtos/[id]`)

Campos:
- Nome (Input)
- Categoria (Input — datalist de categorias existentes + livre)
- Unidade (Select: kg, g, un, L, ml, pacote)
- Preço Custo (Input number, com prefixo R$)
- Preço Venda (Input number, com prefixo R$)
- Estoque Mínimo (Input number, permite decimais conforme unidade)
- Código de Barras (Input, opcional)
- Ativo (Switch, default true; só visível na edição)

Validações: Zod + mensagens PT-BR inline.

Submit: Server Action. Loading state. Toast de sucesso/erro. Redirect para `/produtos` após sucesso.

### 5.6 Fornecedores

- Tabela: Nome | CNPJ | Contato | Telefone | Email | Prazo (dias) | Status | Ações
- Busca por nome/CNPJ
- Formulário: Nome, CNPJ (Input com máscara), Contato, Telefone, Email, Endereço, Prazo Pagamento (dias), Ativo (Switch)

### 5.7 Entradas (`/entradas`)

- Tabela: Data | NF | Fornecedor | Itens | Valor Total | Ações
- Valor total = soma dos subtotais dos itens
- Busca/filtro por fornecedor e período
- Botão "Nova Entrada"

### 5.8 Formulário de Entrada (`/entradas/nova`)

- Header: Select Fornecedor (combobox), Input NF, Input Data (default hoje), Textarea Observação
- Itens: Tabela editável
  - Colunas: Produto (Select), Quantidade (Input number), Preço Unitário (Input R$), Subtotal (calculado, read-only)
  - Botão "Adicionar Item" abaixo
  - Cada item pode ser removido
  - Total geral no rodapé
- Submit: Server Action. Transação. Atualiza estoque. Revalida paths.

### 5.9 Saídas

- Tabela: Data | Tipo | Itens | Valor Total | Ações
- Filtros: tipo, período
- Botão "Nova Saída"

### 5.10 Formulário de Saída (`/saidas/nova`)

- Header: Select Tipo (venda/consumo/perda), Input Data (default hoje), Textarea Observação
- Itens: Tabela editável
  - Colunas: Produto (Select), Quantidade (Input number), Preço Venda (Input R$, auto-fill do produto selecionado, editável)
  - Total geral no rodapé
- Submit: Server Action. Transação. Estoque -= qtd. Revalida paths.

---

## 6. Estados de UI

Cada lista/tela deve tratar:

- **Loading:** skeleton (shadcn `<Skeleton>`)
- **Vazio:** empty state com ícone Lucide + texto PT-BR + CTA (ex: "Nenhum produto cadastrado. [Cadastrar primeiro]")
- **Erro:** toast vermelho com mensagem clara + opção de retry
- **Sucesso:** toast verde (sonner) com mensagem específica

Cada formulário deve ter:

- **Loading no submit:** botão desabilitado com spinner
- **Validação inline:** mensagens de erro abaixo do campo, em vermelho
- **Erro do server:** toast vermelho com mensagem retornada

---

## 7. Validações de Domínio

| Caso | Regra | Mensagem |
|------|-------|----------|
| CNPJ duplicado | unique constraint | "CNPJ já cadastrado" |
| CNPJ inválido | regex 00.000.000/0000-00 | "CNPJ inválido" |
| Quantidade ≤ 0 | Zod | "Quantidade deve ser maior que zero" |
| Preço < 0 | Zod | "Preço não pode ser negativo" |
| Entrada sem itens | Zod | "Adicione ao menos um item" |
| Excluir produto com histórico | Server check | "Produto possui movimentações; desative em vez de excluir" |
| Estoque negativo | Permitido (apenas alerta) | sem erro |

---

## 8. Permissões e Segurança (RNF-009)

- Middleware verifica sessão em todas as rotas `(app)`
- Server Actions re-verificam `auth.getUser()` (não confiar no client)
- `created_by` em `entradas`/`saidas` sempre = `auth.uid()`
- RLS habilitado em todas as tabelas
- `service_role` NUNCA no client
- Inputs validados com Zod no server (mesmo que client valide também)
- Nenhum SQL dinâmico concatenado — sempre parametrizado via Supabase client

---

## 9. Performance

- Server Components para listagens e dashboard (sem JS desnecessário)
- Paginação server-side (20/página default)
- Índices: `produtos(nome)`, `produtos(ativo)`, `entrada_itens(produto_id)`, `saida_itens(produto_id)`, `entradas(data_entrada)`, `saidas(data_saida)`
- Dashboard: queries agregadas (`COUNT`, `SUM`) com `gte/lte` em `created_at`
- Cache: `unstable_cache` em queries de dashboard com tag invalidada nas mutations

---

## 10. Acessibilidade (RNF-006)

- shadcn/ui já fornece base acessível
- Adicionar `aria-label` em todos botões de ação (ícones)
- `htmlFor` em labels de formulário
- Foco visível em todos elementos focáveis
- Navegação por teclado testada (Tab/Shift+Tab, Enter, Esc)
- Skip-to-content link (shadcn tem padrão)
- `prefers-reduced-motion` em transições

---

## 11. Internacionalização

- Idioma: PT-BR (padrão do workspace)
- Formatação monetária: `R$ 1.234,56` (locale `pt-BR`)
- Datas: `dd/MM/yyyy` (locale `pt-BR`)
- Números: vírgula como decimal

---

## 12. Testes (AD-009)

**Unit (Vitest):**
- `lib/utils/format.ts` — formatação moeda, data
- `lib/utils/stock.ts` — cálculo de valor de estoque, alertas
- `lib/validations/*.ts` — schemas Zod (happy path + edge cases)

**Componentes (RTL):**
- `produto-form.tsx` — validações inline, submit, loading
- `entrada-form.tsx` — adicionar/remover itens, total calculado
- `metric-card.tsx` — renderização e formatação
- `stock-alerts-card.tsx` — tabela com top 20

**E2E (Playwright):**
- `auth.spec.ts` — login, logout, redirect
- `produtos.spec.ts` — CRUD completo
- `entradas.spec.ts` — criar entrada e ver estoque atualizado
- `saidas.spec.ts` — criar saída e ver estoque atualizado
- `dashboard.spec.ts` — alertas refletem dados reais

---

## 13. Critérios de Pronto por Feature

Cada feature está pronta quando:
1. Todos os testes passam (unit + E2E)
2. AC da user story correspondente atendidos
3. Code review proporcional ao risco (`rules/code-review.md`) aprovado
4. Validação manual via browser (chrome-devtools) com 0 erros de console e 0 4xx/5xx
5. Impeccable audit (se UI) sem achados bloqueadores
6. Documentação atualizada (se houver)
7. Commit atômico com mensagem semântica

---

## 14. Estrutura de Pastas Final

```
controle-estoque-padaria/
├── .specs/                          # Gerado pelo tlc-spec-driven
│   └── features/controle-estoque-padaria/
│       ├── prd.md
│       ├── tech-decisions.md
│       ├── spec.md                  # este arquivo
│       ├── context.md               # (se discuss for acionado)
│       ├── design.md                # (se Large/Complex)
│       ├── tasks.md                 # (gerado no planejamento)
│       └── validation.md            # (gerado pelo Verifier)
├── docs/
│   └── template-decision.md         # (gerado em stack-selection)
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx           # AuthGuard + Sidebar
│   │   │   ├── page.tsx             # Dashboard
│   │   │   ├── produtos/
│   │   │   ├── fornecedores/
│   │   │   ├── entradas/
│   │   │   └── saidas/
│   │   ├── api/
│   │   │   └── auth/callback/route.ts
│   │   ├── layout.tsx               # Root
│   │   └── globals.css
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   ├── __tests__/
│   └── middleware.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20260723_000001_create_produtos.sql
│   │   ├── 20260723_000002_create_fornecedores.sql
│   │   ├── 20260723_000003_create_entradas.sql
│   │   ├── 20260723_000004_create_saidas.sql
│   │   ├── 20260723_000005_create_triggers.sql
│   │   └── 20260723_000006_create_rls_policies.sql
│   └── config.toml
├── e2e/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.mjs
└── components.json
```

---

## 15. Dependências Principais (package.json)

**dependencies:**
- `next@^16.0.0`
- `react@^19.0.0`
- `react-dom@^19.0.0`
- `@supabase/supabase-js@^2.x`
- `@supabase/ssr@^0.5.x`
- `react-hook-form@^7.x`
- `zod@^4.x`
- `@hookform/resolvers@^3.x`
- `lucide-react@^0.x`
- `recharts@^2.x`
- `sonner@^1.x`
- `clsx@^2.x`
- `tailwind-merge@^2.x`
- `date-fns@^3.x`
- `@radix-ui/react-*` (via shadcn init)

**devDependencies:**
- `typescript@^5.x`
- `@types/react`, `@types/node`
- `tailwindcss@^4.x`
- `vitest@^2.x`
- `@testing-library/react@^16.x`
- `@playwright/test@^1.x`
- `supabase@^1.x` (CLI)
- `eslint`, `prettier`

---

## 16. Próximos Passos

1. **Planejamento** — gerar `tasks.md` com tasks atômicas
2. **Sprint Validator** — verificar cobertura, dependências, riscos
3. **APROVAR PLANO E INICIAR** — aguardar aprovação explícita do usuário