## Estrutura do Workspace
- Skills em `.opencode/skills/` (nativo OpenCode, 18 skills)
- Regras contextuais em `rules/` (16 arquivos, carregadas via opencode.json)
- Projects isolados em `projects/<nome>/`
- Specs por projeto em `.specs/projects/<nome>/` (SDD)
- Template SDD vazio em `.specs/_template/` para clonar
- Templates web em `templates/full/` (completos) e `templates/snippets/` (blocos)
- Agents customizados em `.opencode/agents/` (web-reviewer, backend-reviewer, deploy-checker)
- Commands customizados em `.opencode/commands/` (/new-project, /deploy-check, /sdd-start, /audit-ui)

## Stack Padrão
- Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + TypeScript + Supabase
- Host: Vercel; Auth: Supabase Auth; ORM: Prisma ou Supabase JS direto (por projeto)
- Testes: Vitest + React Testing Library + Playwright

## Estado do Workspace
- Reestruturação completa aplicada em 2026-07-23: align com doc OpenCode
- opencode.json conforma schema oficial (instructions glob, watcher, compaction, skill perms)
- Skills funcionalmente acessíveis (path correto)
- Estado de projetos isolados com STATE.md por projeto
- docs/ cresceu: README, workflow, conventions, guides, references

## Pendências Ativas
- Domínios sem regra especializada: financeiro/pagamentos, LGPD/dados pessoais, integrações externas

## Decisões de Arquitetura Aprovadas
- Template Router como passo 0 do workflow web
- Anti-patterns Impeccable = REPROVADO em toda task UI
- Code review via subagents obrigatório pós-task (web-reviewer, backend-reviewer)
- Domínios críticos (estoque, segurança) roteados via `rules/domain-routing.md`
- Projects isolados em `projects/<nome>/`, não monorepo
- State global do workspace em `.specs/STATE.md`, state por projeto em `.specs/projects/<nome>/STATE.md`