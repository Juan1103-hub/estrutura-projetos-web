# CLAUDE.md — Workspace Web Multi-Projetos

## Estrutura do Workspace
- **Código de apps** → `projects/<nome>/`
- **Specs SDD (legado)** → `.specs/projects/<nome>/` (manter para compatibilidade)
- **Specs onp-spec-driven** → `.spec/` (motor mecânico, constituição, features)
- **Regras de domínio** → `rules/*.md` (carregadas automaticamente)
- **Skills** → `.claude/skills/` (onp-spec-driven, tlc-spec-driven, etc.)
- **Agentes customizados** → `.claude/agents/`
- **Templates** → `templates/full/` e `templates/snippets/`

Hierarquia: usuário > este CLAUDE.md > rules/* > DEPLOY.md > skills.
Código real > docs. Não ignorar requisito do usuário por regra/skill.

### Skills SDD disponíveis
| Skill | Uso | Motor |
|---|---|---|
| **onp-spec-driven** (padrão) | Feature planning com auditoria mecânica | Embarcado (onp-spec.mjs) |
| **tlc-spec-driven** (alternativa) | Feature planning leve, sem motor | Scripts Python |

## Stack Padrão
Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + TypeScript + Supabase
Deploy padrão: Vercel + Supabase

## Fluxo SDD — onp-spec-driven (motor mecânico embarcado)

**Skill ativa:** `.claude/skills/onp-spec-driven/`
**Constituição:** `.spec/constituicao.md` (preset saúde/clínico)
**Motor:** `node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs <comando>`

### Pipeline obrigatório (spec-anchored)
```
ESPECIFICAR → PROJETAR → TAREFAS → PLANO → EXECUTAR → AUDITAR → APRENDER
                                           ↑ paralelismo       ↑ gate mecânico
```

### Classificação de escopo
| Escopo | Arquivos | Profundidade |
|---|---|---|
| **Pequeno** | ≤3 | Spec inline, skip tasks/plano |
| **Médio** | <10 tasks | Spec completa, tasks inline |
| **Grande** | multi-componente | Spec + design.md + tasks.md + plano paralelo |

### Comandos do motor
- `onp-spec new <feature>` — Criar spec + tasks para nova feature
- `onp-spec scaffold <feature>` — Gerar esqueletos de testes (DoD executável)
- `onp-spec plano <feature>` — Plano de execução paralela (worktrees)
- `onp-spec verify <feature>` — Rodar testes e registrar prova por critério
- `onp-spec audit --ci` — Gate mecânico (exit 0 = alinhado, exit 1 = corrigir)
- `onp-spec painel <feature>` — Painel ao vivo no navegador
- `onp-spec status` — Status de todas as features
- `onp-spec licoes add|list|sugerir|penalizar` — Gestão de lições aprendidas

### Definição de pronto (não negociar)
1. Todo critério de aceite vira teste anotado com `@spec:AC-xxx`
2. Só o test runner decide pass/fail — agente não declara vitória
3. Feature só fecha quando `audit --ci` sai com exit 0
4. Suposições e perguntas são cidadãs de primeira classe
5. Constituição verificada; violar princípio = consertar o código, não o princípio

### Comandos do workspace
- `/new-project <nome> "<descrição>"` — Iniciar novo projeto
- `/sdd-start <projeto> <feature>` — Iniciar feature com onp-spec
- `/audit-ui` — Auditar UI contra anti-patterns
- `/deploy-check <projeto>` — Verificar readiness para deploy

## Regras de Domínio (carregar sob demanda via rules/INDEX.md)
- Estoque → `rules/inventory-domain.md`
- Segredos/RLS/migrations → `rules/security-secrets.md`
- Financeiro → `rules/finance-domain.md`
- LGPD/PII → `rules/lgpd-domain.md`
- API externa/webhook → `rules/integrations-domain.md`

## Projetos Atuais
| Projeto | Tipo | Stack |
|---|---|---|
| `projects/qualidade-clinica/` | Dashboard clínico | Next.js + Supabase |
| `projects/digital-card/` | Card game | Node/Express |
| `projects/games-landing/` | Landing page | HTML/CSS/JS |
| `projects/status-page/` | Status page | Node |

## Convenções
- Projetos/features em **kebab-case**
- Componentes em **PascalCase**
- Código/ids em inglês, docs em PT-BR
- 1 task por vez, 1 commit atômico por task
- Code review obrigatório após cada task

## Segurança (não negociar)
- `service_role` **nunca** no client / NEXT_PUBLIC_*
- RLS em toda tabela de negócio exposta
- AuthZ no servidor e/ou banco — não só UI
- Migration destrutiva: backup + rollback + aprovação explícita
- Não commitar .env, tokens, chaves, node_modules, .next, dist