# CLAUDE.md — Workspace Web Multi-Projetos

## Estrutura do Workspace
- **Código de apps** → `projects/<nome>/`
- **Specs onp-spec-driven** → `.spec/` (motor mecânico, constituição, features)
- **Regras** → `rules/*.md` (10 regras consolidadas, carregar sob demanda)
- **Skills** → `.claude/skills/` (onp-spec-driven, tlc-spec-driven, etc.)
- **Agentes** → `.claude/agents/` (web-reviewer, backend-reviewer, deploy-checker)
- **Templates** → `templates/full/` e `templates/snippets/`

Hierarquia: usuário > este CLAUDE.md > rules/* > skills.
Código real > docs. Não ignorar requisito do usuário por regra/skill.

## Stack Padrão
Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + TypeScript + Supabase
Deploy padrão: Vercel + Supabase

## Fluxo SDD — onp-spec-driven

**Skill:** `.claude/skills/onp-spec-driven/`
**Motor:** `node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs <comando>`

```
ESPECIFICAR → PROJETAR → TAREFAS → PLANO → EXECUTAR → AUDITAR → APRENDER
```

### Comandos
- `onp-spec new <feature>` — Criar spec + tasks
- `onp-spec scaffold <feature>` — Gerar esqueletos de testes
- `onp-spec plano <feature>` — Plano de execução paralela
- `onp-spec verify <feature>` — Rodar testes e registrar prova
- `onp-spec audit --ci` — Gate mecânico (exit 0 = OK)
- `onp-spec status` — Status de todas as features

### Definição de pronto
1. Todo critério de aceite vira teste com `@spec:AC-xxx`
2. Só o test runner decide pass/fail
3. Feature só fecha quando `audit --ci` sai com exit 0

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
- Projetos/features em **kebab-case**
- Componentes em **PascalCase**
- Código/ids em inglês, docs em PT-BR
- 1 task por vez, 1 commit atômico por task
- Code review obrigatório após cada task

## Segurança (não negociar)
- `service_role` **nunca** no client
- RLS em toda tabela de negócio exposta
- AuthZ no servidor e/ou banco
- Migration destrutiva: backup + rollback + aprovação
- Não commitar .env, tokens, chaves, node_modules, .next, dist
