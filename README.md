# Workspace Web Multi-Projetos

Workspace para desenvolvimento de projetos web com Claude Code + onp-spec-driven.

## Estrutura

```
workspace/
├── CLAUDE.md               # Instruções globais (ler primeiro)
├── DEPLOY.md               # Checklist de go-live
├── onpspec.config.json     # Configuração do motor onp-spec
├── .spec/                  # Specs onp-spec-driven
│   ├── constituição.md     # Princípios do domínio (saúde/clínico)
│   ├── config.json         # Config do motor
│   └── features/           # Specs por feature
├── .claude/                # Configuração Claude Code
│   ├── skills/             # onp-spec-driven
│   ├── agents/             # Subagentes (web-reviewer, backend-reviewer, deploy-checker)
│   └── settings.json       # Settings do workspace
├── rules/                  # 10 regras consolidadas (carregar sob demanda)
├── docs/                   # Documentação do workspace
│   ├── guides/             # How-to
│   └── references/         # Referências arquiteturais
├── templates/              # Referências para o onp-spec (ele escolhe)
│   ├── full/               # Projetos completos como base
│   └── snippets/           # Pedacinhos de código
├── projects/               # Projetos isolados
│   └── qualidade-clinica/  # Projeto atual
└── test/                   # Testes globais
```

## Iniciar novo projeto

```bash
# Criar feature com onp-spec
node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs new minha-feature
```

Ou peça ao Claude Code: "criar feature X" — ele executa o fluxo automaticamente.

**O onp-spec-driven decide a estrutura sozinho:**
- Analisa o que a feature precisa
- Define a melhor estrutura de pastas e arquivos
- Usa templates como referência (não cópia cega)
- Você só aprova o plano

## Stack padrão

- **Frontend:** Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + TypeScript
- **Backend:** Supabase (PostgreSQL) + Server Actions
- **Deploy:** Vercel + Supabase
- **Testes:** Vitest + Playwright
- **SDD:** onp-spec-driven (motor mecânico com verificação executável)

## Regras (10 consolidadas)

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

Ver `rules/INDEX.md` para índice completo.

## Comandos úteis

```bash
# Status das features
node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs status

# Rodar testes
cd projects/qualidade-clinica && npx vitest run

# Audit (verificação mecânica)
node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs audit --ci
```

## Como falar com o Claude

- Linguagem simples, sem jargão técnico
- Proativo — sugere a melhor abordagem
- Explica o "porquê" em palavras fáceis
- Se algo dá errado → explicação simples + solução já pronta
