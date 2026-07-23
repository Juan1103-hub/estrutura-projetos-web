# Decisão de Template — Controle de Estoque Padaria

> Documento gerado na fase de Design (tech-decisions), obrigatório para
> projetos novos conforme `rules/stack-selection.md` e `AGENTS.md`.
> Data: 2026-07-23

---

## Projeto

- **Nome:** controle-estoque-padaria
- **Tipo:** Aplicação web (Next.js 16 + Supabase)
- **Perfil:** Painel administrativo / Dashboard de estoque
- **Destino:** `controle-estoque-padaria/` (pasta nova, fora de `templates/`)

## Templates Avaliados (locais disponíveis)

Conforme `templates/catalog.md` e inspeção direta das pastas locais:

| Template | Perfil | Stack | Observação |
|----------|--------|-------|------------|
| `next-shadcn-admin-dashboard/` | Dashboard / Admin | Next.js 16, shadcn/ui (radix-nova), Tailwind v4, recharts, zod v4, react-hook-form, lucide-react, sonner, biome | Painel administrativo completo com sidebar, KPI cards, theme presets. Sem Supabase/Prisma. |
| `fast-saas-nextjs/` | SaaS completo | Next.js + Prisma + Supabase + Stripe + shadcn/ui | Inclui billing (fora do escopo do MVP). Acopla Stripe e Prisma. |
| `nextjs-app/` | App CRUD | Next.js + Prisma + shadcn/ui | Mais simples. Não traz dashboard shell. |
| `react-vite/` | SPA | React + Vite + Tailwind | Não atende (precisamos de SSR/Auth middleware). |
| `nextjs-landing-page/` | Landing | Next.js + Tailwind | Não atende (foco em conteúdo estático). |
| `nextjs-mdx-blog/` | Blog MDX | Next.js + shadcn + MDX | Não atende. |
| `static-html-css-js/` | Estático | HTML/CSS/JS vanilla | Não atende. |

## Critérios de Seleção

| Critério | Peso | `next-shadcn-admin-dashboard` | `fast-saas-nextjs` | `nextjs-app` |
|----------|------|-------------------------------|--------------------|--------------|
| Perfil Dashboard com sidebar + cards | Alto | ✅ Excelente (já tem shell) | ⚠️ Parcial (precisa configurar) | ❌ Não tem |
| Stack Next.js 16 + App Router | Alto | ✅ | ✅ | ✅ |
| shadcn/ui (base-ui / radix) | Alto | ✅ radix-nova | ✅ | ✅ |
| Tailwind v4 | Alto | ✅ | ✅ | ✅ |
| TypeScript strict | Alto | ✅ | ✅ | ✅ |
| Recharts (gráficos) | Médio | ✅ Incluído | ❌ Adicionar | ❌ Adicionar |
| Zod v4 + react-hook-form | Médio | ✅ Incluído | ✅ | ✅ |
| Sem dependências desnecessárias (Stripe, billing) | Médio | ✅ Sem Stripe | ❌ Tem Stripe | ✅ |
| Sem Prisma (decisão do usuário) | Alto | ✅ Sem Prisma | ❌ Tem Prisma | ❌ Tem Prisma |
| Tabela/DataTable robusta | Médio | ✅ @tanstack/react-table | ⚠️ Não | ⚠️ Não |
| Theming com presets | Baixo | ✅ | ❌ | ❌ |
| Documentação interna do template | Médio | ✅ AGENTS.md próprio | ⚠️ | ⚠️ |
| Necessidade de remover coisas | — | Mínimo (sem auth, sem Supabase) | Muito (Stripe, Prisma) | Médio |

## Decisão

**Template escolhido:** `templates/next-shadcn-admin-dashboard/`

### Motivo principal

1. **Perfil exato**: dashboard admin com sidebar, KPI cards, tabelas — o que precisamos para um painel de estoque com dashboard.
2. **Alinhamento de stack**: Next.js 16, shadcn/ui (radix-nova), Tailwind v4, TypeScript strict, recharts, zod v4, react-hook-form, lucide-react, sonner — todas as bibliotecas já validadas e compatíveis com o nosso plano.
3. **Sem dependências desnecessárias**: não traz Stripe, Prisma, OAuth ou billing que precisariam ser removidas.
4. **Sem Prisma**: combina com a decisão do usuário de usar Supabase direto.
5. **Recharts e @tanstack/react-table já incluídos**: evita instalar/configurar separadamente.
6. **Theming com presets**: facilita a integração com nossos tokens OKLCH do workspace via `impeccable init`.
7. **AGENTS.md do template**: já define convenções de estrutura (co-location, _components/, route groups `(main)`) que se alinham com nosso plano.

### Candidatos Descartados

- **`fast-saas-nextjs`**: traz Stripe (fora do escopo MVP) e Prisma (decidimos não usar).
- **`nextjs-app`**: mais simples mas não traz dashboard shell — teríamos que montar sidebar/cards/tabelas do zero.
- **`react-vite`, `nextjs-landing-page`, `nextjs-mdx-blog`, `static-html-css-js`**: perfis incompatíveis (SPA, landing, blog, estático).

## O que será preservado do template

- Estrutura `src/app/(main)/dashboard/...` (route group para rotas autenticadas)
- Componentes em `src/components/ui/` (intactos — regra do template)
- `src/navigation/sidebar/sidebar-items.ts` (adicionar nossos itens)
- `src/hooks/use-mobile.ts`, `src/lib/utils.ts`
- `tsconfig.json` (paths `@/*`)
- `biome.json` (lint/format)
- `next.config.mjs`
- Theme presets (após `impeccable init`)

## O que será removido/adicionado

### Remover (após clone)
- `src/data/users.ts` (mock users — não usar)
- Páginas demo em `src/app/(main)/dashboard/*` (finance, crm, analytics, infrastructure, etc.) — manter apenas estrutura de pastas vazia ou uma dashboard de exemplo para referência
- Calendário/FullCalendar (não precisamos no MVP)
- Charts geo (d3-geo, topojson-client) — remover se não usarmos

### Adicionar
- `@supabase/supabase-js` e `@supabase/ssr`
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- `@playwright/test`
- `supabase` (CLI, devDependency)
- `recharts` já está — manter

## Como será feita a cópia

1. Criar pasta `controle-estoque-padaria/` na raiz do workspace (fora de `templates/`)
2. Copiar arquivos do template, preservando:
   - `package.json` (remover deps não usadas, adicionar Supabase e testes)
   - `tsconfig.json`
   - `biome.json`
   - `next.config.mjs`
   - `src/app/layout.tsx`, `src/app/globals.css`
   - `src/components/ui/` (intacto)
   - `src/hooks/`, `src/lib/utils.ts`
3. Renomear `studio-admin` → `controle-estoque-padaria` no `package.json`
4. Limpar páginas demo e dados mockados
5. Adicionar `supabase/` (config + migrations) na raiz
6. Adicionar `.env.example` (sem secrets reais)
7. README com instruções de setup
8. **Não** copiar `.git`, `.env`, segredos

## Próximos Passos

- T-001 (atualizada): clonar o template conforme acima
- T-002: setup Supabase + migrations + RPCs
- T-003: auth + middleware
- T-010: `impeccable init` para gerar PRODUCT.md/DESIGN.md e tokens
- Demais tasks conforme plano

## Limitações Conhecidas

- Template não traz Supabase/Auth: teremos que adicionar manualmente.
- Template não traz testes: configuraremos do zero (Vitest + Playwright).
- Template tem theming próprio (`src/styles/presets/`); após `impeccable init`, decidimos se substituímos pelos tokens OKLCH do workspace ou mantemos a base do template.
