# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace — Visão Geral

Multi-projetos web. Cada app vive em `projects/<nome>/`. O fluxo de desenvolvimento é **spec-anchored**: especificação auditada mecanicamente contra o código, sempre.

```
projects/<nome>/          ← código dos apps
.spec/                    ← specs, constituição, features
rules/*.md                ← regras por domínio (carregar sob demanda)
.claude/skills/           ← onp-spec-driven (motor embarcado)
.claude/agents/           ← web-reviewer, backend-reviewer, deploy-checker
templates/full/           ← next-shadcn-admin-dashboard, nextjs-landing-page, fast-saas-nextjs
```

Hierarquia: usuário > este CLAUDE.md > rules/* > skills.
Código real > docs. Não ignorar requisito do usuário por regra/skill.

## Comandos Essenciais

**Motor onp-spec** (roda na raiz do projeto):
```bash
node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs new <feature>        # Criar spec + tasks
node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs scaffold <feature>   # Gerar esqueletos de testes
node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs plano <feature>      # Plano de execução paralela
node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs verify <feature>     # Rodar testes e registrar prova
node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs audit --ci           # Gate mecânico (exit 0 = OK)
node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs status               # Status de todas as features
```

## Arquitetura — Como as Peças se Conectam

O workspace opera com dois "cérebros" trabalhando juntos:

1. **O motor onp-spec** (`scripts/onp-spec.mjs`) — mecânico, determinístico. Ele cria specs, gera tarefas, audita código contra a especificação e decide (via exit code) se algo está pronto. Não é "AI confiando que obedeceu" — é a máquina provando.

2. **Os agents do Claude** (`.claude/agents/`) — revisam código em profundidade: frontend (`web-reviewer`), backend (`backend-reviewer`), deploy (`deploy-checker`). Cada um tem ferramentas específicas e não edita arquivos.

O fluxo de uma feature:
- `onp-spec new` cria a spec em `.spec/features/<nome>/spec.md` e tarefas em `tasks.md`
- O motor gera o plano de execução paralela em `plano.json` (com worktrees isolados)
- `verify` roda os testes e grava prova em `.spec/verification/`
- `audit --ci` cruza tudo e dá o veredicto final

**Templates** são referências, não cópia cega. O onp-spec decide qual usar na fase PROJETAR — não pergunte ao usuário.

## Identidade Visual — nunca reciclar o mesmo padrão

Cada projeto/app tem o seu **design com personalidade própria** — nenhuma feature sai com o mesmo visual de um projeto anterior só porque "já funcionou". Isso vale para TODO novo projeto/feature:

- **Na fase PROJETAR (features grandes), decidir a identidade visual e o modelo.** Perguntar ao usuário sobre referências e estilo (com opções concretas e diferentes), e registrar a decisão no `design.md` da feature: direção visual, paleta, tipografia, componentes.
- **Evitar o "visual de IA":** nenhuma seção genérica por reflexo (hero + 4 cards + depoimentos), nenhum azul SaaS padrão como paleta automática. Pensar primeiro em quem usa e no que o produto precisa parecer.
- **Modelo pode variar por projeto.** Não "todos usam o mesmo modelo" por inércia — decidir por critério (densidade da interface, esforço) e registrar.
- Se a fase Projetar for pulada por engano (tarefa pequena que cresceu), **PARE e faça as perguntas de design antes de implementar** — design depois custa 10× mais caro.

Exemplo aplicado: o Kanban da Vórtice Mineral usa uma identidade "painel industrial de operações" (ardósia quente + laranja âmbar de segurança), decidida e registrada em `.spec/features/gestao-tarefas-kanban/design.md`.

> **Nota de precedência:** a skill onp-spec (`.claude/skills/`) NÃO deve ser alterada para resolver isso — este CLAUDE.md é onde a regra de identidade visual mora (hierarquia: usuário > CLAUDE.md > rules > skills).

## Stack Padrão
Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + TypeScript + Supabase
Deploy: Vercel + Supabase

## Como Conversar — Vibe Coding

O usuário não é técnico. Comunicação em linguagem simples, como para um amigo. Ser proativo, sugerir abordagens, explicar o "porquê". Traduzir termos: "server action" = "ação que roda no servidor", "middleware" = "verificação no caminho". NUNCA usar sem explicar: "implementar", "deploy", "refatorar", "tipar", "instanciar", "renderizar", "escopo", "mock", "fixture", "pipeline", "bundle", "lazy load", "code split".

## Regras (carregar sob demanda via rules/INDEX.md)

| Regra | Quando ler |
|---|---|
| `auth-security.md` | JWT, Supabase/PostgreSQL, segredos, checklist produção |
| `code-quality.md` | Convenções, review, testes |
| `stack-nextjs.md` | Next.js App Router completo |
| `stack-react.md` | React SPA |
| `stack-static.md` | HTML/CSS/JS |
| `ui-ux.md` | Design tokens, acessibilidade |
| `lgpd-domain.md` | Dados pessoais, LGPD |
| `integrations-domain.md` | APIs externas, webhooks |
| `workflow.md` | Seleção de stack, fallback, recuperação |

## Convenções
- Projetos/features em **kebab-case**, componentes em **PascalCase**
- Código/ids em inglês, docs em PT-BR
- 1 task por vez, 1 commit atômico por task, code review após cada task

## Segurança (não negociar)
- `service_role` **nunca** no client
- RLS em toda tabela de negócio exposta, AuthZ no servidor e/ou banco
- Migration destrutiva: backup + rollback + aprovação
- Não commitar .env, tokens, chaves, node_modules, .next, dist
