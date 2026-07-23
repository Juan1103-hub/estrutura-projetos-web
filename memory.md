## Stack do Projeto
- Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + TypeScript + Supabase + Prisma
- Host: Vercel; Auth: Supabase Auth; ORM: Prisma → Supabase Postgres

## Pendências Ativas
- Netlify → Vercel migration
- Formulários → Supabase CRUD real

## Estado Atual
- Templates catalog atualizado com 7 perfis
- Regras de seleção obrigatória no AGENTS.md e detalhadas em rules/stack-selection.md
- Impeccable flow configurado (palette → skill → register → code)
- AGENTS.md reescrito como roteador conciso (~155 linhas); regras detalhadas vivem em rules/
- rules/domain-routing.md + rules/inventory-domain.md + rules/session-recovery.md criados em 2026-07-23 para cobrir lacunas de domínio de negócio e recuperação pós-falha de contexto
- rules/code-style.md limpo de conteúdo ADVPL/TLPP que havia vazado do workspace Protheus

## Decisões de Arquitetura Aprovadas
- Template Router como passo 0 do workflow web
- Anti-patterns Impeccable = REPROVADO em toda task UI
- Code review via subagents (web-code-reviewer, backend-code-reviewer) obrigatório pós-task
- Domínios críticos (estoque, segurança) roteados via rules/domain-routing.md antes de Discovery concluir
- Financeiro/pagamentos e LGPD ainda sem regra especializada — tratar via perguntas bloqueadoras até serem criadas