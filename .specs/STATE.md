# .specs/STATE.md — Estado Global do Workspace

> Estado geral do workspace (stack padrão, pendências ativas, decisões de
> arquitetura aprovadas). Para estado de projeto específico, ver
> `.specs/projects/<nome>/STATE.md`.

## Stack padrão do workspace

- Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + TypeScript
- Supabase (banco, auth, storage)
- Vercel (deploy frontend)
- Vitest + Playwright (testes)

## Regras de domínio disponíveis

- Estoque → `rules/inventory-domain.md`
- Segurança → `rules/security-secrets.md`
- Financeiro → `rules/finance-domain.md`
- LGPD → `rules/lgpd-domain.md`
- Integrações → `rules/integrations-domain.md`

## Decisões globais do workspace

- Template Router como passo 0 do workflow web
- Anti-patterns Impeccable = REPROVADO em toda task UI
- Code review via subagents (web-reviewer, backend-reviewer) obrigatório pós-task
- Domínios críticos (estoque, segurança) roteados via `rules/domain-routing.md`
- Projetos vivem em `projects/<nome>/` isolados
- Specs legados vivem em `.specs/projects/<nome>/` isolados
- **onp-spec-driven** é a skill SDD padrão (motor mecânico embarcado)
- Specs onp-spec vivem em `.spec/` com constituição em `.spec/constituicao.md`
- Constituição de domínio saúde/clínico ativa (P-001 a P-010)
- Skills ficam em `.claude/skills/` (onp-spec-driven como padrão)

## Projetos conhecidos

| Projeto | Pasta | Tier | Status |
|---|---|---|---|
| qualidade-clinica | projects/qualidade-clinica/ | Complex (L2) | Planejamento concluído — aguardando aprovação |