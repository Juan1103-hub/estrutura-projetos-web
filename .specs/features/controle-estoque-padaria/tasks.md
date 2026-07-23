# Tasks — Controle de Estoque Padaria (MVP)

> Plano de execução com tasks atômicas. Cada task = 1 commit.
> Total: ~20 tasks em 4 batches (para sub-agentes) + Verifier final.
> Data: 2026-07-23

---

## Convenções

- **Task ID**: `TASK-NNN`
- **Cada task**: 1 commit atômico, testes passando, review proporcional ao risco
- **Gate**: testes unitários + E2E do escopo devem passar antes de marcar como concluída
- **Batches**: 1-2 sub-agentes trabalham em paralelo quando tasks são independentes

---

## Batch 1 — Fundação (tasks T-001 a T-005)

### T-001: Bootstrap do projeto Next.js + shadcn
- **Escopo:** Criar projeto Next.js 16 com TypeScript, Tailwind v4, shadcn/ui
- **Passos:**
  1. `npx create-next-app@latest controle-estoque-padaria --typescript --tailwind --app --src-dir`
  2. `cd controle-estoque-padaria`
  3. `npx shadcn@latest init -d` (defaults)
  4. Instalar `lucide-react`, `sonner`
  5. Adicionar componentes: `button`, `card`, `input`, `label`, `select`, `table`, `dialog`, `form`, `toast`, `sheet`, `sidebar`, `badge`, `alert`, `skeleton`, `switch`
  6. Configurar `globals.css` com tokens OKLCH conforme `rules/design-tokens.md`
  7. Configurar Inter font via `next/font/google` em `layout.tsx`
- **Verificação:**
  - `npm run build` passa sem erros
  - Página inicial renderiza com Inter e tokens OKLCH
- **Commit:** `chore: bootstrap Next.js 16 + Tailwind v4 + shadcn/ui`

### T-002: Setup Supabase local + projeto
- **Escopo:** Configurar Supabase CLI e criar schema
- **Passos:**
  1. Instalar `supabase` CLI
  2. `supabase init`
  3. Criar migrations conforme schema (ver SPEC AD-003):
     - `20260723_000001_create_produtos.sql`
     - `20260723_000002_create_fornecedores.sql`
     - `20260723_000003_create_entradas.sql`
     - `20260723_000004_create_saidas.sql`
     - `20260723_000005_create_triggers.sql`
     - `20260723_000006_create_rls_policies.sql`
  4. `supabase start` (Docker)
  5. `supabase db push` (aplica migrations)
  6. Gerar tipos: `supabase gen types typescript --local > src/lib/supabase/types.ts`
  7. Configurar `.env.local` e `.env.example` (sem secrets reais)
  8. Instalar `@supabase/supabase-js` e `@supabase/ssr`
- **Verificação:**
  - `supabase status` mostra DB rodando
  - Tipos gerados sem erro
  - Conexão via `createClient` funciona em teste rápido
- **Commit:** `feat(supabase): setup projeto + migrations iniciais + tipos`

### T-003: Setup autenticação Supabase
- **Escopo:** Auth com email/password, middleware, layouts (auth) e (app)
- **Passos:**
  1. Criar `src/lib/supabase/server.ts` (createServerClient com cookies)
  2. Criar `src/lib/supabase/client.ts` (createBrowserClient — uso raro)
  3. Criar `src/middleware.ts` (refresh sessão)
  4. Criar `src/app/(auth)/login/page.tsx` (formulário login)
  5. Criar `src/app/(auth)/register/page.tsx` (formulário registro)
  6. Criar `src/app/(auth)/layout.tsx` (sem sidebar)
  7. Criar `src/app/(app)/layout.tsx` (AuthGuard + SidebarProvider)
  8. Configurar `next.config.mjs` para Supabase
- **Verificação:**
  - Login funciona com usuário de teste
  - Redirect para `/` após login
  - Acesso a `(app)` sem auth redireciona para `/login`
  - Logout limpa sessão
- **Commit:** `feat(auth): Supabase Auth + middleware + layouts (auth)/(app)`

### T-004: Layout principal (Sidebar + Header)
- **Escopo:** Componentes de layout reutilizáveis
- **Passos:**
  1. Criar `src/components/layout/sidebar.tsx` (260px, dark, grupos, badges)
  2. Criar `src/components/layout/header.tsx` (user menu, logout)
  3. Criar `src/components/layout/providers.tsx` (SidebarProvider + Toaster)
  4. Configurar variantes de sidebar (default, com badge de alertas)
- **Verificação:**
  - Sidebar renderiza em desktop (260px)
  - Drawer em mobile (<768px)
  - Link ativo destacado
  - Toaster funcional (toast de teste)
- **Commit:** `feat(layout): sidebar 260px + header + providers`

### T-005: Utilitários e validações base
- **Escopo:** Funções de formatação, schemas Zod compartilhados
- **Passos:**
  1. Criar `src/lib/utils/format.ts` (moeda BR, data BR, número)
  2. Criar `src/lib/utils/stock.ts` (cálculos de valor, alertas)
  3. Criar `src/lib/validations/produto.ts` (Zod schema)
  4. Criar `src/lib/validations/fornecedor.ts` (Zod schema)
  5. Criar `src/lib/validations/entrada.ts` (Zod schema com itens)
  6. Criar `src/lib/validations/saida.ts` (Zod schema com itens)
  7. Configurar `vitest.config.ts` e setup
  8. Criar testes unitários para utils e validações
- **Verificação:**
  - `npm test` passa com 100% nos utils
  - Schemas Zod exportam tipos TypeScript
- **Commit:** `feat(lib): utils formatação/stock + schemas Zod + testes unitários`

---

## Batch 2 — Cadastros Base (tasks T-006 a T-010)

### T-006: Módulo Produtos — Server Actions
- **Escopo:** CRUD de produtos
- **Passos:**
  1. Criar `src/lib/actions/produtos.ts` (listar, obter, criar, atualizar, desativar)
  2. Validar autenticação em cada action
  3. Validar input com Zod
  4. Desativar: checar se há `entrada_itens`/`saida_itens` referenciando
  5. `revalidatePath` em mutações
- **Verificação:**
  - Testes unitários das actions (com Supabase mockado)
  - Criar produto via action insere corretamente
  - Desativar produto com histórico lança erro esperado
- **Commit:** `feat(produtos): server actions CRUD com validação e RLS`

### T-007: Módulo Produtos — Listagem e Formulário
- **Escopo:** UI de Produtos
- **Passos:**
  1. Criar `src/app/(app)/produtos/page.tsx` (Server Component, lista produtos)
  2. Criar `src/components/tables/data-table.tsx` (reutilizável)
  3. Criar `src/components/forms/produto-form.tsx` (React Hook Form + Zod)
  4. Criar `src/app/(app)/produtos/novo/page.tsx`
  5. Criar `src/app/(app)/produtos/[id]/page.tsx` (editar)
  6. Empty state, loading skeleton, toast feedback
- **Verificação:**
  - Listar produtos com paginação, busca, filtros
  - Criar produto via form, ver na listagem
  - Editar produto existente
  - Desativar produto (soft delete)
  - E2E test: `produtos.spec.ts` cobre CRUD
- **Commit:** `feat(produtos): listagem + formulário + DataTable reutilizável`

### T-008: Módulo Fornecedores — Server Actions
- **Escopo:** CRUD de fornecedores
- **Passos:**
  1. Criar `src/lib/actions/fornecedores.ts`
  2. Validar CNPJ (regex) + unicidade
  3. Desativar: checar se há `entradas` referenciando
- **Verificação:**
  - Testes unitários
  - CNPJ duplicado lança erro
  - Desativar fornecedor com entradas lança erro
- **Commit:** `feat(fornecedores): server actions CRUD com validação CNPJ`

### T-009: Módulo Fornecedores — Listagem e Formulário
- **Escopo:** UI de Fornecedores
- **Passos:**
  1. Criar `src/app/(app)/fornecedores/page.tsx`
  2. Criar `src/components/forms/fornecedor-form.tsx` (com máscara CNPJ)
  3. Criar `src/app/(app)/fornecedores/novo/page.tsx`
  4. Criar `src/app/(app)/fornecedores/[id]/page.tsx`
- **Verificação:**
  - Listar com busca por nome/CNPJ
  - Máscara de CNPJ funciona
  - Validação inline (CNPJ inválido, duplicado)
  - E2E: `fornecedores.spec.ts`
- **Commit:** `feat(fornecedores): listagem + formulário com máscara CNPJ`

### T-010: Impeccable init + tokens visuais
- **Escopo:** Setup visual com Impeccable
- **Passos:**
  1. `node .opencode/skills/impeccable/scripts/context.mjs`
  2. `impeccable init` (cria PRODUCT.md e DESIGN.md)
  3. `impeccable audit` (auditar UI atual)
  4. Aplicar tokens OKLCH finais
  5. Validar contraste WCAG AA
- **Verificação:**
  - PRODUCT.md e DESIGN.md criados
  - `impeccable audit` sem achados bloqueadores
- **Commit:** `feat(design): impeccable init + tokens OKLCH + audit`

---

## Batch 3 — Movimentações (tasks T-011 a T-014)

### T-011: Módulo Entradas — Server Actions
- **Escopo:** Criar nota de entrada com itens
- **Passos:**
  1. Criar `src/lib/actions/entradas.ts`
  2. Validar: fornecedor existe, produtos existem, qtd > 0
  3. Operação atômica: INSERT entrada + INSERT entrada_itens em transação
  4. `revalidatePath('/entradas')`, `revalidatePath('/produtos')`, `revalidatePath('/')`
- **Verificação:**
  - Criar entrada com 3 itens persiste corretamente
  - Trigger atualiza `estoque_atual` (verificar via SQL)
  - E2E: `entradas.spec.ts`
- **Commit:** `feat(entradas): server action criar nota com itens + trigger estoque`

### T-012: Módulo Entradas — UI
- **Escopo:** Telas de entrada
- **Passos:**
  1. Criar `src/app/(app)/entradas/page.tsx` (listagem com filtros)
  2. Criar `src/components/forms/entrada-form.tsx` (tabela editável de itens)
  3. Criar `src/app/(app)/entradas/nova/page.tsx`
  4. Criar `src/app/(app)/entradas/[id]/page.tsx` (read-only)
- **Verificação:**
  - Adicionar/remover itens dinamicamente
  - Subtotal calculado automaticamente
  - Fornecedor selectable
  - E2E completo
- **Commit:** `feat(entradas): listagem + formulário com tabela editável`

### T-013: Módulo Saídas — Server Actions
- **Escopo:** Criar saída com itens
- **Passos:**
  1. Criar `src/lib/actions/saidas.ts`
  2. Validar: tipo válido, produtos existem, qtd > 0
  3. Snapshot de `preco_unitario_venda` no momento da saída
  4. Operação atômica: INSERT saida + INSERT saida_itens
  5. Estoque -= qtd (trigger permite negativo)
- **Verificação:**
  - Criar saída de tipo "venda" com 2 itens
  - Trigger atualiza estoque (pode ficar negativo)
  - E2E: `saidas.spec.ts`
- **Commit:** `feat(saidas): server action criar movimentação + trigger estoque`

### T-014: Módulo Saídas — UI
- **Escopo:** Telas de saída
- **Passos:**
  1. Criar `src/app/(app)/saidas/page.tsx` (listagem com filtros)
  2. Criar `src/components/forms/saida-form.tsx`
  3. Criar `src/app/(app)/saidas/nova/page.tsx`
  4. Criar `src/app/(app)/saidas/[id]/page.tsx` (read-only)
  5. Badge colorido por tipo (venda=azul, consumo=cinza, perda=vermelho)
- **Verificação:**
  - Select de tipo funciona
  - Preço venda auto-fill do produto
  - E2E completo
- **Commit:** `feat(saidas): listagem + formulário com tipos venda/consumo/perda`

---

## Batch 4 — Dashboard + Polish (tasks T-015 a T-020)

### T-015: Dashboard — Cards de métrica
- **Escopo:** Linha 1 do dashboard
- **Passos:**
  1. Criar `src/app/(app)/page.tsx` (Server Component)
  2. Criar `src/components/dashboard/metric-card.tsx`
  3. Query agregada: total itens, valor total (R$ custo), qtd alertas
  4. Filtro de período (7d/30d/90d) via query param
- **Verificação:**
  - Cards refletem dados reais do Supabase
  - Formatação BR (R$ 1.234,56)
  - Filtro de período atualiza cards
- **Commit:** `feat(dashboard): cards de métrica com agregações`

### T-016: Dashboard — Gráfico de movimentações
- **Escopo:** Linha 2 do dashboard
- **Passos:**
  1. Instalar `recharts` (se ainda não)
  2. Criar `src/components/dashboard/movement-chart.tsx`
  3. Query: count de entradas e saídas agrupado por dia (últimos 30d)
  4. BarChart entradas vs saídas
- **Verificação:**
  - Gráfico renderiza com dados
  - Tooltip funcional
  - Responsivo
- **Commit:** `feat(dashboard): grafico entradas vs saidas (recharts)`

### T-017: Dashboard — Tabela de alertas
- **Escopo:** Linha 3 do dashboard
- **Passos:**
  1. Criar `src/components/dashboard/stock-alerts-card.tsx`
  2. Query: produtos com `estoque_atual <= estoque_minimo AND ativo=true`
  3. Top 20 ordenado por maior deficit (`estoque_minimo - estoque_atual`)
  4. Link "Ver todos" para `/produtos?filtro=alerta`
- **Verificação:**
  - Tabela mostra apenas produtos em alerta
  - Cálculo de deficit correto
  - Link funcional
- **Commit:** `feat(dashboard): tabela de alertas de estoque minimo`

### T-018: Badge de alertas no Sidebar
- **Escopo:** Indicador visual no menu lateral
- **Passos:**
  1. Adicionar query no sidebar para contar alertas
  2. Badge vermelha no link "Produtos" quando qtd_alertas > 0
  3. `Suspense` para não bloquear render do sidebar
- **Verificação:**
  - Badge aparece quando há alertas
  - Não aparece quando não há
  - Atualiza após mutações (revalidatePath)
- **Commit:** `feat(sidebar): badge de alertas de estoque`

### T-019: Polish — Impeccable + Auditoria
- **Escopo:** Revisão visual final
- **Passos:**
  1. `impeccable audit` (auditoria completa)
  2. `impeccable polish` (passada final)
  3. Corrigir achados bloqueadores e altos
  4. Validar contraste WCAG AA em todas as páginas
  5. Validar navegação por teclado completa
  6. Validar 0 erros de console no chrome-devtools
- **Verificação:**
  - Sem achados bloqueadores no impeccable
  - 0 erros de console
  - 0 4xx/5xx em requisições de rede
- **Commit:** `feat(ui): impeccable polish + auditoria final`

### T-020: Deploy Staging + E2E completo
- **Escopo:** Subir para staging e validar fluxo end-to-end
- **Passos:**
  1. Criar projeto Supabase staging
  2. Aplicar migrations no staging
  3. Conectar Vercel preview ao Supabase staging
  4. Rodar E2E tests contra staging
  5. Validar fluxo: login → cadastrar produto → entrada → saída → ver dashboard
  6. Criar 3-5 usuários de teste com dados realistas
  7. Documentar acesso a staging no README
- **Verificação:**
  - E2E passa em staging
  - Fluxo completo manual funciona
  - Dados de teste persistidos
- **Commit:** `chore(deploy): staging setup + E2E validation`

---

## Pós-Implementação (não-task, fluxo skill)

### Verifier (automático após última task)
- Spec-anchored outcome check
- Discrimination sensor
- Gera `.specs/features/controle-estoque-padaria/validation.md`
- Resultado: PASS / FAIL

### Acceptance Review
- Comparar implementação com PRD + SPEC
- Validar cada user story com evidência
- Validar RNFs (perf, a11y, segurança, RLS)
- Matriz de rastreabilidade

---

## Dependências entre Batches

```
Batch 1 (T-001 a T-005) → Base: projeto + Supabase + auth + layout + utils
                              ↓
Batch 2 (T-006 a T-010) → Cadastros: produtos + fornecedores + design
                              ↓
Batch 3 (T-011 a T-014) → Movimentações: entradas + saídas
                              ↓
Batch 4 (T-015 a T-020) → Dashboard + Polish + Deploy
                              ↓
                         Verifier + Acceptance Review
```

**Paralelização possível:**
- T-006 e T-008 (actions de produtos e fornecedores) podem ser paralelos
- T-007 e T-009 (UIs) podem ser paralelos
- T-011 e T-013 (actions de entradas e saídas) podem ser paralelos
- T-012 e T-014 (UIs) podem ser paralelos
- T-015, T-016, T-017 podem ser paralelos (componentes independentes do dashboard)

---

## Sub-Agentes

Conforme `rules/sub-agents` da skill, 4 batches > 8 tasks → oferecer sub-agentes:

- **Batch 1 (5 tasks)**: sub-agente único (sequência coesa)
- **Batch 2 (5 tasks)**: sub-agente único ou 2 paralelos
- **Batch 3 (4 tasks)**: sub-agente único (paralelo entre entradas e saídas)
- **Batch 4 (6 tasks)**: sub-agente único (integração de dashboard)

**Oferta obrigatória antes de iniciar:** usuário aceita sub-agente ou execução inline.

---

## Definition of Done (DoD)

Cada task só está pronta quando:

1. ✅ Implementação atende AC da user story correspondente
2. ✅ Testes unitários passam (`npm test`)
3. ✅ E2E do escopo passa (`npm run e2e`)
4. ✅ Type-check passa (`tsc --noEmit`)
5. ✅ Lint passa (`npm run lint`)
6. ✅ Build passa (`npm run build`)
7. ✅ Code review proporcional ao risco aprovado
8. ✅ Validação visual via chrome-devtools (0 erros console, 0 4xx/5xx)
9. ✅ Impeccable audit (se UI) sem achados bloqueadores
10. ✅ Commit atômico com mensagem semântica

---

## Riscos e Mitigações por Task

| Task | Risco | Mitigação |
|------|-------|-----------|
| T-002 | Migrations não aplicam | Validar SQL localmente antes de commit |
| T-011/T-013 | Trigger não atualiza estoque | Testes E2E verificam estoque antes/depois |
| T-019 | Impeccable revela muitos achados | Reservar tempo para correções; considerar `polish` iterativo |

---

## Próximos Passos

1. **Sprint Validator** — executar verificação de cobertura, dependências, riscos
2. **APROVAR PLANO E INICIAR** — aguardar aprovação explícita do usuário