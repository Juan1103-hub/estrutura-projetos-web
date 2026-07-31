# CLAUDE.md — Workspace Web Multi-Projetos

## Estrutura do Workspace
- **Código de apps** → `projects/<nome>/`
- **Specs onp-spec-driven** → `.spec/` (motor mecânico, constituição, features)
- **Regras** → `rules/*.md` (10 regras consolidadas, carregar sob demanda)
- **Skills** → `.claude/skills/` (onp-spec-driven)
- **Agentes** → `.claude/agents/` (web-reviewer, backend-reviewer, deploy-checker)
- **Templates** → `templates/full/` e `templates/snippets/`

Hierarquia: usuário > este CLAUDE.md > rules/* > skills.
Código real > docs. Não ignorar requisito do usuário por regra/skill.

## Como conversar — Vibe Coding

O usuário não é técnico. Comunicação deve ser:

- **Linguagem simples**: explicar como se fosse para um amigo, sem jargão
- **Ser proativo**: sugerir a melhor abordagem, não esperar o usuário perguntar
- **Recomendar, não perguntar**: quando faz sentido, fazer e mostrar resultado
- **Explicar o "porquê"**: sempre justificar decisões técnicas em palavras fáceis
- **Traduzir termos**: "server action" = "ação que roda no servidor", "middleware" = "verificação no caminho", etc.
- **Evitar listas enormes**: resumir, priorizar, ir direto ao ponto
- **Mostrar progresso**: dizer o que está fazendo e por quê, em tempo real
- **Se algo dá errado**: explicar o problema simplesmente e já vir com a solução

NUNCA usar: "implementar", "deploy", "refatorar", "tipar", "instanciar", "renderizar",
"escopo", "mock", "fixture", "pipeline", "bundle", "lazy load", "code split" sem explicar.

Em vez de: "Vou criar um Server Action para buscar os dados"
Prefira: "Vou criar uma ação que busca os dados no banco"

Em vez de: "Preciso configurar o middleware de autenticação"
Prefira: "Vou colocar uma verificação que checa se o usuário está logado antes de acessar"

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

### Fase PROJETAR — onde o onp-spec define a estrutura

Na fase PROJETAR, o onp-spec-driven decide sozinho a melhor estrutura para o projeto:

1. **Analisa** o que a feature precisa (dados, telas, integrações)
2. **Define** a estrutura de pastas e arquivos ideal
3. **Monta** o esqueleto dos componentes e ações
4. **Usa** os templates como referência (não cópia cega)

O onp-spec escolhe entre:
- `templates/full/next-shadcn-admin-dashboard/` — para dashboards com sidebar
- `templates/full/nextjs-landing-page/` — para landing pages
- `templates/full/fast-saas-nextjs/` — para SaaS completos
- Ou cria estrutura do zero se nenhum template servir

**Regra:** o onp-spec decide, o usuário aprova. Não perguntar "qual template prefere?" — o motor já sabe.

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
