# .specs/STATE.md

> Project memory: Decisions log (AD-NNN) + Handoff snapshot
> Mantido pela skill `tlc-spec-driven`.

---

## Decisions

### AD-001: Stack Next.js + Supabase (sem Prisma)
- **Data:** 2026-07-23
- **Status:** Aprovado
- **Resumo:** Stack Next.js 16 + Supabase + @supabase/supabase-js direto (sem Prisma), conforme decisão do usuário.
- **Implicação:** SQL em `supabase/migrations/` aplicado manualmente; tipos gerados via `supabase gen types typescript`.

### AD-002: Estrutura de pastas (route groups)
- **Data:** 2026-07-23
- **Status:** Aprovado
- **Resumo:** Route groups `(auth)` e `(app)` para separar público de autenticado. Sidebar com SidebarProvider em `(app)/layout.tsx`.

### AD-003: Schema do banco
- **Data:** 2026-07-23
- **Status:** Aprovado
- **Resumo:** 6 tabelas (produtos, fornecedores, entradas, entrada_itens, saidas, saida_itens) + coluna `produtos.estoque_atual` mantida por trigger.

### AD-004: RLS — single-role no MVP
- **Data:** 2026-07-23
- **Status:** Aprovado
- **Resumo:** RLS habilitado em todas as tabelas; policies base para `authenticated` user. Schema preparado para RBAC futuro.

### AD-005: Autenticação Supabase
- **Data:** 2026-07-23
- **Status:** Aprovado
- **Resumo:** Supabase Auth email/password; sessão via `@supabase/ssr`; middleware de refresh.

### AD-006: Validação Zod
- **Data:** 2026-07-23
- **Status:** Aprovado
- **Resumo:** Schemas Zod compartilhados client/server. Mensagens PT-BR. Tipos TypeScript inferidos.

### AD-007: Server Actions
- **Data:** 2026-07-23
- **Status:** Aprovado
- **Resumo:** Server Actions para todas mutações. API Routes apenas para callback de auth. `revalidatePath` em mutações.

### AD-008: UI/UX — Impeccable
- **Data:** 2026-07-23
- **Status:** Aprovado
- **Resumo:** Impeccable como padrão. `impeccable init` uma vez. Tokens OKLCH do workspace. shadcn/ui como base.

### AD-009: Testes
- **Data:** 2026-07-23
- **Status:** Aprovado
- **Resumo:** Vitest (unit) + React Testing Library (componentes) + Playwright (E2E). Cobertura mínima: lib/validations, lib/utils, 1 E2E/módulo.

### AD-010: Deploy Vercel
- **Data:** 2026-07-23
- **Status:** Aprovado
- **Resumo:** Vercel (frontend) + Supabase (banco/auth). Ambientes: local, staging, prod.

---

## Handoff

### Current State
- **Fase atual:** Spec-Driven concluído (Discovery, PRD, Tech Decisions, SPEC, Planning, Sprint Validator)
- **Aguardando:** comando `APROVAR PLANO E INICIAR` do usuário

### Artifacts
- `.specs/features/controle-estoque-padaria/prd.md`
- `.specs/features/controle-estoque-padaria/tech-decisions.md`
- `.specs/features/controle-estoque-padaria/spec.md`
- `.specs/features/controle-estoque-padaria/tasks.md`
- `.specs/features/controle-estoque-padaria/sprint-validator.md`

### Resume Instructions
Após aprovação, começar pelo Batch 1 (T-001: bootstrap). Cada task = 1 commit. Sub-agentes disponíveis se > 1 batch (>8 tasks).

---

## Lessons

(vazio até Validator registrar lições após primeira execução)