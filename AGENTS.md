# AGENTS.md — Workspace Web

Workspace multi-projeto OpenCode. **Não é app único nem monorepo npm.**
Código de apps → projects/<nome>/. Specs SDD → .specs/projects/<nome>/.
Instruções carregadas automaticamente via opencode.json: este arquivo + DEPLOY.md + rules/*.md (20).

Hierarquia: usuário > este AGENTS.md > rules/* + DEPLOY.md > skills.
Código real > docs. Não ignorar requisito do usuário por regra/skill.

---
## Gotchas críticos (o que agent sempre erra)

1. **Subagent edit permissions são path-restritas.** frontend-dev só edita src/frontend/**. backend-dev só edita src/backend/**. **Apps reais estão em projects/.** Esses subagentes NÃO podem editar código de projeto. Use quick-fix ou qa-runner para editar em projects/. O orquestrador (este agente) edita por task delegation.

2. **Projeto novo nunca começa por código.** SDD obrigatório. Comando: /new-project <nome> "<descrição>". Só implementar após APROVAR PLANO E INICIAR.

3. **continue retoma feature/task já registrada em STATE.md.** Não autoriza troca de projeto, escopo ou fase. Se contexto perdido, ler rules/session-recovery.md.

4. **Regras rules/*.md já estão carregadas na sessão** (via opencode.json instructions glob). Este arquivo não repete conteúdo delas — apenas referência quando ler cada uma.

---
## Mapa rápido

| Path | Função |
|---|---|
| projects/<nome>/ | App isolado (código, .env.example, package.json) |
| projects/digital-card/ | Card game (Node server, Express) |
| projects/games-landing/ | Landing page estática (HTML/CSS/JS) |
| projects/status-page/ | Status page (Node) |
| .specs/projects/<nome>/ | PRD, SPEC, tasks, STATE do projeto |
| .specs/_template/ | Specs template (clonar via scaffold) |
| rules/ | 20 regras contextuais (já carregadas) |
| rules/INDEX.md | Índice de regras por contexto |
| templates/full/ (4) | Templates completos para clone |
| templates/snippets/ (4) | Starters menores + config |
| templates/catalog.md | Catálogo + repos externos |
| .opencode/commands/ | /new-project, /sdd-start, /audit-ui, /deploy-check |
| .opencode/agents/ | @web-reviewer, @backend-reviewer, @deploy-checker |
| docs/ | Workflow SDD, convenções, guias, referências |
| scripts/scaffold-project.ps1 | Cria estrutura de projeto novo (sem código) |
| scripts/pre-commit-checks.ps1 | Valida opencode.json, skills, regras, segredos |
| memory.md | Memória curta do workspace (ler ao retomar) |

Nomes: projetos/features **kebab-case**. Componentes **PascalCase**.

---
## Fluxo SDD (resumo — detalhes em docs/workflow.md)

**Projeto novo:** /new-project <nome> "<descrição>" → scaffold de pastas → Discovery → PRD → Tech Decisions → SPEC → Planner → Sprint Validator → AGUARDANDO APROVAÇÃO → clonar template + implementar

**Feature em projeto existente:** /sdd-start <projeto> <feature> → classifica L0 (trivial, altera direto), L1 (SDD reduzido), L2 (SDD completo + regra de domínio)

**Antes de schema/RLS/SPEC:** ler rules/domain-routing.md — se gatilho bater, carregar regra especializada:
- Estoque → inventory-domain.md
- Segredos/RLS/migrations → security-secrets.md
- Financeiro → finance-domain.md
- LGPD/PII → lgpd-domain.md
- API externa/webhook → integrations-domain.md

**Stack padrão:** Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + TypeScript + Supabase. **Deploy padrão:** Vercel + Supabase. Checklist: DEPLOY.md.

**Seleção de template:** ler templates/catalog.md + rules/stack-selection.md. Justificar escolha contra ≥2 alternativas.

---
## Implementação e revisão

- 1 task por vez. 1 commit atômico por task (após aprovação do plano).
- **Code review obrigatório após cada task** (rules/code-review.md):
  - Frontend/UI → @web-reviewer
  - API/DB/Auth → @backend-reviewer
  - Go-live → @deploy-checker ou /deploy-check <projeto>
- Revisão: APROVADO → próxima task. REPROVADO → task-fix só do achado, re-revisar. APROVADO COM RESSALVAS → aguardar confirmação.
- Impeccable anti-pattern = **REPROVADO** em toda task UI.
- UI nova/alterada: validar no browser (console zero erros, rede zero 4xx/5xx, screenshot).
- Entrega final: AGUARDANDO ACEITE FINAL DA CUSTOMIZAÇÃO.

Comandos de app rodam **dentro** de projects/<nome>/. Workspace root não é package da aplicação.

---
## Segurança (não negociar)

- service_role **nunca** no client / NEXT_PUBLIC_*
- RLS em toda tabela de negócio exposta
- AuthZ no servidor e/ou banco — não só UI
- Migration destrutiva: backup + rollback + aprovação explícita
- Não commitar .env, tokens, chaves, node_modules, .next, dist

Mais detalhes: rules/security-secrets.md, DEPLOY.md.

---
## Skills (seletivo — carregar sob demanda)

| Contexto | Skill |
|---|---|
| Planejamento/SPEC | tlc-spec-driven |
| Supabase/Postgres | supabase, supabase-postgres-best-practices |
| UI / anti-patterns IA | impeccable + /audit-ui |
| A11y WCAG | accessibility |
| Design visual | frontend-design, ui-ux-pro-max |
| Browser debug | chrome-devtools |
| Audit geral | web-quality-audit |
| Copy/marketing | copywriting, marketing-psychology |

18 skills project-local em .opencode/skills/. Skills globais também disponíveis. Não carregar todas — carregar só a necessária para o contexto atual.

---
## Idioma

PT-BR na conversa e docs. Código/ids em inglês. Tom direto.
