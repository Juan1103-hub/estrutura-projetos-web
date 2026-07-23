# Decisões Técnicas — Controle de Estoque Padaria (v2)

> Versão revisada. Data: 2026-07-23
> Inclui RPCs transacionais, RLS multi-org, imutabilidade de movimentações.

---

## AD-001: Stack Next.js + Supabase (sem Prisma)

**Decisão:**
- **Next.js 16** (App Router, Server Components, Server Actions) — bootstrap a partir de `templates/next-shadcn-admin-dashboard/` (ver `docs/template-decision.md`)
- **Supabase** (Postgres + Auth)
- **@supabase/supabase-js** + **@supabase/ssr**
- **Tailwind v4** + **shadcn/ui (radix-nova)** + **Lucide React** + **Inter font**
- **TypeScript** strict
- **React Hook Form** + **Zod v4**
- **recharts** (gráficos dashboard) — já no template
- **@tanstack/react-table** — já no template
- **Vitest** + **React Testing Library** + **Playwright**
- **Biome** (lint/format) — já no template

---

## AD-002: Estrutura de Pastas

Herdada do template com adaptações:

```
controle-estoque-padaria/
├── .specs/                          # tlc-spec-driven
├── docs/
│   └── template-decision.md
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx           # AuthGuard + SidebarProvider
│   │   │   ├── dashboard/           # rota /dashboard
│   │   │   │   ├── page.tsx
│   │   │   │   └── _components/
│   │   │   ├── produtos/
│   │   │   │   ├── page.tsx         # listagem
│   │   │   │   ├── novo/page.tsx
│   │   │   │   ├── [id]/page.tsx   # editar
│   │   │   │   └── _components/
│   │   │   ├── fornecedores/
│   │   │   ├── entradas/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nova/page.tsx
│   │   │   │   ├── [id]/page.tsx   # visualizar (read-only)
│   │   │   │   └── _components/
│   │   │   └── saidas/
│   │   │       ├── page.tsx
│   │   │       ├── nova/page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── api/
│   │   │   └── auth/callback/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      # shadcn (intacto, regra do template)
│   │   ├── forms/
│   │   │   ├── produto-form.tsx
│   │   │   ├── fornecedor-form.tsx
│   │   │   ├── entrada-form.tsx
│   │   │   └── saida-form.tsx
│   │   └── dashboard/
│   │       ├── metric-card.tsx
│   │       ├── stock-alerts-card.tsx
│   │       └── movement-chart.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   ├── actions/                 # Server Actions (thin wrappers)
│   │   │   ├── produtos.ts
│   │   │   ├── fornecedores.ts
│   │   │   ├── entradas.ts          # chama rpc('registrar_entrada', ...)
│   │   │   ├── saidas.ts            # chama rpc('registrar_saida', ...)
│   │   │   └── organizations.ts
│   │   ├── validations/             # Zod schemas
│   │   ├── rpc/                     # Tipos e contratos das RPCs
│   │   │   ├── entradas.ts
│   │   │   └── saidas.ts
│   │   └── utils/
│   │       ├── format.ts
│   │       ├── stock.ts
│   │       └── cnpj.ts
│   ├── navigation/
│   │   └── sidebar/
│   │       └── sidebar-items.ts     # adicionar nossos itens
│   ├── hooks/
│   ├── __tests__/
│   └── middleware.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20260723_000001_create_organizations.sql
│   │   ├── 20260723_000002_create_organization_members.sql
│   │   ├── 20260723_000003_create_users_profile.sql
│   │   ├── 20260723_000004_create_produtos.sql
│   │   ├── 20260723_000005_create_fornecedores.sql
│   │   ├── 20260723_000006_create_entradas.sql
│   │   ├── 20260723_000007_create_saidas.sql
│   │   ├── 20260723_000008_create_helpers_cnpj.sql
│   │   ├── 20260723_000009_create_rpcs_movimento.sql
│   │   ├── 20260723_000010_create_triggers_audit.sql
│   │   └── 20260723_000011_create_rls_policies.sql
│   └── config.toml
├── e2e/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── next.config.mjs
├── biome.json
└── components.json
```

---

## AD-003: Schema Multiempresa (organizacional)

### `organizations`
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id | uuid | PK, default `gen_random_uuid()` |
| nome | text | NOT NULL |
| slug | text | UNIQUE NOT NULL |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

### `organization_members`
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id | uuid | PK |
| organization_id | uuid | FK → organizations.id ON DELETE CASCADE, NOT NULL |
| user_id | uuid | FK → auth.users.id ON DELETE CASCADE, NOT NULL |
| role | text | NOT NULL DEFAULT 'member', CHECK in ('owner','member') |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| | | UNIQUE (organization_id, user_id) |

### `users_profile` (espelha `auth.users` com dados extras)
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id | uuid | PK, FK → auth.users.id ON DELETE CASCADE |
| full_name | text | |
| created_at | timestamptz | NOT NULL DEFAULT now() |

### `produtos`
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id | uuid | PK |
| organization_id | uuid | FK → organizations.id ON DELETE CASCADE, NOT NULL |
| nome | text | NOT NULL |
| categoria | text | NOT NULL |
| unidade | text | NOT NULL, CHECK in ('kg','g','un','L','ml','pacote') |
| preco_custo | numeric(10,2) | NOT NULL, >= 0 |
| preco_venda | numeric(10,2) | NOT NULL, >= 0 |
| estoque_minimo | numeric(10,3) | NOT NULL DEFAULT 0, >= 0 |
| estoque_atual | numeric(10,3) | NOT NULL DEFAULT 0 |
| codigo_barras | text | nullable |
| ativo | boolean | NOT NULL DEFAULT true |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |
| | | UNIQUE (organization_id, codigo_barras) WHERE codigo_barras IS NOT NULL |

### `fornecedores`
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id | uuid | PK |
| organization_id | uuid | FK → organizations.id ON DELETE CASCADE, NOT NULL |
| nome | text | NOT NULL |
| cnpj | text | NOT NULL, CHECK (cnpj_valido(cnpj)) |
| contato | text | |
| telefone | text | |
| email | text | |
| endereco | text | |
| prazo_pagamento_dias | integer | NOT NULL DEFAULT 0, >= 0 |
| ativo | boolean | NOT NULL DEFAULT true |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |
| | | UNIQUE (organization_id, cnpj) |

### `entradas`
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id | uuid | PK |
| organization_id | uuid | FK → organizations.id, NOT NULL |
| fornecedor_id | uuid | FK → fornecedores.id, NOT NULL |
| numero_nf | text | NOT NULL |
| data_entrada | date | NOT NULL DEFAULT current_date |
| observacao | text | |
| valor_total | numeric(12,2) | GENERATED ALWAYS AS (sum(itens.subtotal)) STORED |
| created_by | uuid | FK → auth.users.id, NOT NULL |
| created_at | timestamptz | NOT NULL DEFAULT now() |

### `entrada_itens`
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id | uuid | PK |
| entrada_id | uuid | FK → entradas.id ON DELETE RESTRICT, NOT NULL |
| produto_id | uuid | FK → produtos.id, NOT NULL |
| quantidade | numeric(10,3) | NOT NULL, > 0 |
| preco_unitario | numeric(10,2) | NOT NULL, >= 0 |
| subtotal | numeric(10,2) | GENERATED ALWAYS AS (quantidade * preco_unitario) STORED |
| | | UNIQUE (entrada_id, produto_id) |

### `saidas`
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id | uuid | PK |
| organization_id | uuid | FK → organizations.id, NOT NULL |
| tipo | text | NOT NULL, CHECK in ('venda','consumo','perda') |
| data_saida | date | NOT NULL DEFAULT current_date |
| observacao | text | |
| valor_total | numeric(12,2) | GENERATED ALWAYS AS (sum(itens.subtotal)) STORED |
| created_by | uuid | FK → auth.users.id, NOT NULL |
| created_at | timestamptz | NOT NULL DEFAULT now() |

### `saida_itens`
| Coluna | Tipo | Restrição |
|--------|------|-----------|
| id | uuid | PK |
| saida_id | uuid | FK → saidas.id ON DELETE RESTRICT, NOT NULL |
| produto_id | uuid | FK → produtos.id, NOT NULL |
| quantidade | numeric(10,3) | NOT NULL, > 0 |
| preco_unitario_venda | numeric(10,2) | NOT NULL, >= 0 |
| subtotal | numeric(10,2) | GENERATED ALWAYS AS (quantidade * preco_unitario_venda) STORED |
| | | UNIQUE (saida_id, produto_id) |

---

## AD-004: RPCs Transacionais (atomicidade real)

**Decisão:** Toda operação que envolve múltiplas escritas em movimentações é executada via **função PostgreSQL RPC** em uma única transação.

### `registrar_entrada(p_fornecedor_id uuid, p_numero_nf text, p_data_entrada date, p_observacao text, p_itens jsonb) returns entradas`

Responsabilidades:
1. Verificar `auth.uid()` não nulo
2. Verificar membership do user em `organization_id` da entrada
3. Verificar fornecedor pertence à mesma org
4. Para cada item em `p_itens`:
   - Verificar produto existe, pertence à mesma org e está ativo
   - **Bloquear produto repetido** (validação adicional)
5. Inserir em `entradas` (com `organization_id` resolvido e `created_by = auth.uid()`)
6. Inserir `entrada_itens` em lote
7. Para cada item: `UPDATE produtos SET estoque_atual = estoque_atual + item.quantidade WHERE id = item.produto_id AND organization_id = ...`
8. Atualizar `entradas.valor_total` (recomputed)
9. Retornar `entradas` completa com `itens`

Tudo em uma única transação. Se qualquer passo falhar, `ROLLBACK` total.

### `registrar_saida(p_tipo text, p_data_saida date, p_observacao text, p_itens jsonb) returns saidas`

Mesmo padrão, com:
- `saidas.estoque_atual -= item.quantidade` (pode ficar negativo)
- `saida_itens.preco_unitario_venda` é **snapshot** do preço de venda do produto no momento (obtido dentro da RPC, não no client)
- Bloqueio de produto repetido

### `helper_cnpj_valido(cnpj text) returns boolean`

Função SQL com algoritmo real (módulo 11) para validar CNPJ.

---

## AD-005: Imutabilidade de Movimentações

**Decisão:** Entradas e saídas confirmadas são **imutáveis** no MVP.

### Mecanismos de proteção

1. **RPC não expõe UPDATE/DELETE** — `registrar_entrada` é apenas INSERT.
2. **Trigger `BEFORE UPDATE/DELETE`** em `entradas` e `entrada_itens`, `saidas` e `saida_itens`:
   ```sql
   CREATE FUNCTION prevent_movimento_update() RETURNS TRIGGER AS $$
   BEGIN
     RAISE EXCEPTION 'Movimentações são imutáveis no MVP. Use movimentação compensatória.';
   END;
   $$ LANGUAGE plpgsql;
   ```
3. **RLS bloqueia UPDATE/DELETE** via policies:
   ```sql
   CREATE POLICY "no_update" ON entradas FOR UPDATE TO authenticated USING (false);
   CREATE POLICY "no_delete" ON entradas FOR DELETE TO authenticated USING (false);
   ```
   Idem para `entrada_itens`, `saidas`, `saida_itens`.

### Estoque: integridade via RPC + trigger secundária

1. **Primary:** `produtos.estoque_atual` é atualizado **apenas dentro das RPCs** `registrar_entrada` / `registrar_saida`.
2. **Trigger `BEFORE UPDATE OF estoque_atual` em `produtos`**: rejeita alteração manual com mensagem clara.
3. **Sem trigger AFTER INSERT/DELETE** em `entrada_itens`/`saida_itens` — toda lógica de estoque está na RPC, evitando o problema de trigger ser "única garantia".
4. RPC usa `SELECT ... FOR UPDATE` em `produtos` para evitar race condition.

### Constraint de produto único por movimentação

- `UNIQUE (entrada_id, produto_id)` em `entrada_itens`
- `UNIQUE (saida_id, produto_id)` em `saida_itens`

### Correções futuras (fora do MVP)

- Movimentação compensatória: criar nova entrada/saída que cancela o efeito da anterior (ex.: "Devolução de compra X", "Estorno de venda Y").
- Não há suporte a estorno automático no MVP — apenas manual via nova movimentação.

---

## AD-006: RLS Multiempresa (Opção B)

**Decisão:** Opção B — multi-org preparada. Toda tabela de domínio tem `organization_id` e RLS restringe por membership.

### Policies

```sql
-- Helper: retorna organizations do user atual
CREATE FUNCTION get_user_org_ids() RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid();
$$;

-- produtos
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_org" ON produtos FOR SELECT TO authenticated
  USING (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "insert_org" ON produtos FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));
CREATE POLICY "update_org" ON produtos FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT get_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));
-- DELETE apenas se sem movimentação
CREATE POLICY "delete_org_no_history" ON produtos FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT get_user_org_ids())
    AND NOT EXISTS (SELECT 1 FROM entrada_itens WHERE produto_id = produtos.id)
    AND NOT EXISTS (SELECT 1 FROM saida_itens WHERE produto_id = produtos.id)
  );
-- UPDATE em estoque_atual bloqueado por trigger
-- UPDATE/DELETE em entradas/saidas/itens: bloqueado por policy "no_update"/"no_delete"

-- Idem para fornecedores, entradas, entrada_itens, saidas, saida_itens
```

### Organizations
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_member_of" ON organizations FOR SELECT TO authenticated
  USING (id IN (SELECT get_user_org_ids()));
```

### Onboarding
- No primeiro login: criar `organization` com nome "Minha Padaria" + adicionar user como `owner` em `organization_members`.
- Trigger `on_auth_user_created` ou Server Action no register.

---

## AD-007: Server Actions como Thin Wrappers

**Decisão:** Server Actions **apenas validam** com Zod, obtêm `auth.uid()`, chamam RPC e revalidam paths. **Não fazem múltiplos INSERTs** para movimentações.

```ts
// src/lib/actions/entradas.ts
'use server';
export async function criarEntrada(input: EntradaInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const parsed = entradaSchema.parse(input); // Zod

  // Chamar RPC transacional
  const { data, error } = await supabase.rpc('registrar_entrada', {
    p_fornecedor_id: parsed.fornecedorId,
    p_numero_nf: parsed.numeroNf,
    p_data_entrada: parsed.dataEntrada,
    p_observacao: parsed.observacao ?? null,
    p_itens: parsed.itens, // jsonb: [{ produto_id, quantidade, preco_unitario }]
  });
  if (error) throw new Error(error.message);

  revalidatePath('/entradas');
  revalidatePath('/produtos');
  revalidatePath('/dashboard');
  return data;
}
```

Mesma estrutura para `criarSaida` chamando `registrar_saida`.

---

## AD-008: Autenticação e Sessão

- Supabase Auth email/password
- `createServerClient` em Server Components/Actions via `@supabase/ssr`
- Middleware em `src/middleware.ts` para refresh de sessão
- Layout `(main)/layout.tsx` verifica `auth.getUser()` → redirect `/login` se não autenticado
- Onboarding: se user sem `organization_members`, Server Action cria org padrão + membership `owner`

---

## AD-009: Validação CNPJ (Algoritmo Real)

**Decisão:** Validação por **algoritmo real** (módulo 11), não apenas regex de formato.

- Função SQL `cnpj_valido(cnpj text) returns boolean` no Supabase
- Função JS `cnpjValido(cnpj: string) returns boolean` em `src/lib/utils/cnpj.ts` (espelho)
- Schemas Zod usam `cnpjValido` no `.refine()`
- Check constraint `CHECK (cnpj_valido(cnpj))` na tabela `fornecedores`

---

## AD-010: Custeio — Custo Atual

**Decisão:** **Custo atual** (RNF-005).

- `produtos.preco_custo` é a única fonte de custo.
- `valor_total_estoque = SUM(produtos.estoque_atual * produtos.preco_custo) WHERE ativo = true AND organization_id = ...`
- Limitação documentada no PRD: alterações em `preco_custo` impactam imediatamente o dashboard.
- Custo médio e último custo fora do MVP (roadmap).

---

## AD-011: UI/UX — Impeccable + Tokens

- Rodar `impeccable init` **logo após bootstrap/template** (T-010 movida)
- Tokens do workspace em `globals.css` (OKLCH conforme `rules/design-tokens.md`)
- Sidebar: **apenas ícones Lucide** (sem emojis)
- shadcn/ui radix-nova (já no template) — manter componentes intactos
- Tema: light/dark via `next-themes` (já no template)
- Acessibilidade WCAG 2.1 AA via `impeccable audit`

---

## AD-012: Testes

- **Unit (Vitest):** `lib/utils/*` (format, stock, cnpj), `lib/validations/*` (Zod)
- **Integration (Vitest):** RPCs testadas com Supabase local + `pg` (insert de fixtures, chamada de função, asserts)
- **Componentes (RTL):** formulários, cards
- **E2E (Playwright):** fluxos verticais completos (login → cadastrar produto → entrada → saída → dashboard)
- **Concorrência (Integration):** 2 chamadas simultâneas à mesma RPC com lock

---

## AD-013: Deploy e Ambientes

- **Frontend:** Vercel
- **Backend:** Supabase
- **Ambientes:**
  - **Local:** `supabase start` (Docker) + `next dev` na porta 3000
  - **Staging:** Supabase project separado + Vercel preview deploy
  - **Prod:** Supabase project + Vercel production
- **Dados de teste:** seed script `supabase/seed.sql` com 1 org, 2 users, 10 produtos, 5 fornecedores, 20 entradas e 15 saídas (definido em T-005 ou T-019)

---

## AD-014: Conflito de Rotas `/produtos/[id]`

**Decisão:** rota única `/produtos/[id]` para **edição** (não visualização). Visualização é feita via `/entradas/[id]` e `/saidas/[id]` (read-only após criação).

- `/produtos/[id]/page.tsx` → formulário de edição
- `/produtos/[id]/historico/page.tsx` (futuro) → read-only do histórico
- Para entradas/saídas: read-only é a única operação após criar (imutável).

---

## AD-015: Desativar vs Excluir

**Decisão:** **Permitir desativar produto/fornecedor com histórico** (soft delete). Excluir físico apenas se sem movimentação.

- Server Action `desativarProduto(id)` → set `ativo = false`. Sempre permitido.
- Server Action `excluirProduto(id)` → só se sem `entrada_itens`/`saida_itens`. RLS já bloqueia via policy.
- Idem para fornecedores (excluir se sem `entradas`).

---

## AD-016: Sem Emojis em UI

**Decisão:** Sidebar e demais UI usam **exclusivamente ícones Lucide**. Removido qualquer emoji do SPEC e tasks.

---

## AD-017: Gráficos com `next/dynamic` (Client-only)

**Decisão:** Componentes de gráfico (`movement-chart.tsx`) usam `next/dynamic` com `ssr: false` para evitar problemas de hidratação com recharts no App Router.

```tsx
// src/components/dashboard/movement-chart-loader.tsx
import dynamic from 'next/dynamic';
export const MovementChart = dynamic(
  () => import('./movement-chart').then(m => m.MovementChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px]" /> }
);
```

---

## AD-018: Ambiente de Staging e Dados de Teste

**Decisão:** Setup de staging, definição de dados de teste e seed são responsabilidade do **bootstrap inicial do projeto** (não da fase final). Mover para T-005 (fundação) ou criar task dedicada.

- `supabase/seed.sql` com dados realistas (nomes brasileiros de produtos de padaria: Pão Francês, Bolo de Cenoura, etc.)
- 1 org, 2 users (admin, operador), 10 produtos, 5 fornecedores, 20 entradas, 15 saídas
- Variação suficiente para testar dashboard (alguns produtos abaixo do mínimo, mix de tipos de saída)

---

## AD-019: Verificação Real de Skills e Ferramentas

**Decisão:** Antes de declarar skills/MCPs/ferramentas como validados, o agente verifica sua **disponibilidade real** no workspace/sessão.

- Skills: listar `skills/` e `~/.config/opencode/skills/` e verificar se existem
- MCPs: verificar `opencode.json` ou configuração
- Ferramentas: tentar usar ou listar no help
- Se indisponível, declarar fallback manual conforme `rules/tools-fallback.md`

Skills realmente disponíveis no workspace `skills/`:
- `tlc-spec-driven`, `frontend-design`, `frontend-blueprint`, `impeccable`,
  `accessibility`, `best-practices`, `code-review`, `chrome-devtools`,
  `supabase`, `supabase-postgres-best-practices`, `coding-guidelines`,
  `web-quality-audit`, `systematic-debugging`, `test-driven-development`,
  `token-efficiency`, `web-design-guidelines`, `huashu-design`,
  `copywriting`, `marketing-psychology`, `agent-browser`,
  `ui-ux-pro-max`, `brainstorming`

MCPs: `context7` (via `mcp_instructions`). `chrome-devtools` e Playwright
disponíveis como ferramentas do opencode (verificar runtime).

---

## AD-020: E2E por Fluxo Vertical, não por Camada

**Decisão:** Playwright E2E cobre **fluxos verticais completos** (login → ação → resultado na UI), não fluxos de camada única (ex.: "testar server action isoladamente").

- Para Server Actions **sem interface ainda**: testes unitários/integration (Vitest + Supabase local), não E2E.
- E2E apenas após UI estar pronta.

---

## Riscos Técnicos

| Risco | Mitigação |
|-------|-----------|
| RPC falha parcialmente em algum passo | Testes integration com falha parcial simulada |
| Race condition em estoque | `SELECT ... FOR UPDATE` em produtos dentro da RPC |
| RLS não cobrir todas as tabelas | Migration única de RLS + auditoria via `pg_policies` |
| CNPJ inválido via SQL injection | Validação no client + RPC + check constraint |
| Custo desatualizado inflar valor | Documentar; recálculo on-demand no dashboard |

---

## Próximos Passos

1. **SPEC (atualizada)** — detalhar contratos RPC, telas, estados
2. **Planejamento (atualizado)** — T-001 = clone template
3. **Sprint Validator (atualizado)**
4. **APROVAR PLANO E INICIAR**