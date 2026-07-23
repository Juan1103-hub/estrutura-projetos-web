# Workspace Web — Estrutura Padrão OpenCode

Workspace base para desenvolvimento de projetos web com OpenCode.

## Estrutura

```
workspace/
├── AGENTS.md               # Roteador global — ler primeiro
├── DEPLOY.md               # Checklist de go-live
├── opencode.json           # Config OpenCode
├── memory.md               # Memória do workspace
├── .opencode/              # Diretório-nativo OpenCode
│   ├── agents/             # Subagentes customizados (web, backend, deploy)
│   ├── commands/           # Comandos customizados (/new-project, /deploy-check...)
│   ├── skills/             # 18 skills project-local
│   └── rules/              # Regras específicas (.opencode)
├── rules/                  # 16 regras contextuais (lidas via instructions glob)
├── docs/                   # Documentação do workspace
│   ├── guides/             # How-to
│   └── references/         # Referências arquiteturais
├── templates/              # Catálogo de templates
│   ├── full/               # Templates completos para clone
│   └── snippets/           # Snippets de código
├── projects/               # Projetos isolados
└── .specs/                 # SDD organizado por projeto
    ├── _template/          # Template vazio para clonar
    ├── STATE.md            # Estado global
    └── projects/<nome>/    # Specs + STATE.md por projeto
```

## Iniciar novo projeto

Use o comando customizado:

```
/new-project meu-app "Sistema de gestão de tarefas"
```

O fluxo SDD será executado automaticamente (Discovery → PRD → SPEC → Plano).
Após aprovação com `APROVAR PLANO E INICIAR`, o projeto é criado em `projects/meu-app/`.

## Documentação

- `docs/workflow.md` — Fluxo SDD explicado
- `docs/conventions.md` — Padrões de nomenclatura
- `docs/guides/new-project.md` — Como iniciar projeto
- `docs/guides/add-skill.md` — Como adicionar skill
- `docs/guides/add-template.md` — Como adicionar template

## Regras

Regras contextuais em `rules/` são carregadas automaticamente via `opencode.json`.
Ver `rules/INDEX.md` para índice por contexto.

## Skills

18 skills project-local em `.opencode/skills/` (nativo OpenCode).
Skills globais também disponíveis (~/.config/opencode/skills/, ~/.claude/skills/, ~/.agents/skills/).

## Stack padrão

- Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + TypeScript
- Supabase (banco, auth, storage) + Vercel (deploy)
- Vitest + Playwright (testes)