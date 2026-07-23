# Convenções do Workspace

## Idioma

- Responder e documentar em português (PT-BR).
- Código e identificadores técnicos em inglês, seguindo convenção da linguagem.
- Tom direto, sem preâmbulos.

## Nomenclatura

### Projetos
- Pasta: `kebab-case` (ex: `meu-app`, `sistema-gestao`)
- Em `projects/<nome>/`

### Features (SDD)
- Pasta: `kebab-case` (ex: `controle-estoque`, `auth-flow`)

### Componentes
- `PascalCase` (ex: `ProductForm.tsx`, `DataTable.tsx`)
- Co-location: `page.tsx` + `_components/` para componentes locais

### Arquivos de spec
- `kebab-case` fixos: `prd.md`, `tech-decisions.md`, `spec.md`, `tasks.md`, `sprint-validator.md`, `STATE.md`

### Regras
- `kebab-case.md` (ex: `code-style.md`, `session-recovery.md`)

### Skills
- Nome deve match^[a-z0-9]+(-[a-z0-9]+)*$ conforme doc OpenCode.
- Pasta `<nome>/SKILL.md`

## Git

- Commit atômico por task.
- Conventional Commits quando possível.
- NUNCA commitar: `.env`, `service_role`, tokens, `node_modules`, `.next`, `dist`.

## Estrutura de projeto (Next.js padrão)

```
projects/<nome>/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   └── (app)/
│   ├── components/
│   │   ├── ui/
│   │   └── _components/
│   ├── lib/
│   ├── hooks/
│   └── types/
├── supabase/
│   └── migrations/
├── public/
├── package.json
├── tsconfig.json
├── next.config.mjs
└── .env.example   # sem valores reais
```

## Design tokens

- OKLCH na paleta (ver `rules/design-tokens.md`)
- Inter + `tabular-nums` para valores numéricos
- `font-mono` SOMENTE para identificadores (CPF, CNPJ, IDs)
- Touch targets ≥ 44px
- Contraste WCAG AA (≥ 4.5:1)

## Ícones

- Lucide React SEMPRE — nunca emojis no código.