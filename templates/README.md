# Templates

Catálogo de templates para projetos web.

## Estrutura

```
templates/
├── catalog.md       # Catálogo completo com links externos
├── full/            # Templates completos prontos para clone
│   ├── next-shadcn-admin-dashboard/   # Dashboard admin (Next.js 16 + shadcn/ui + Tailwind v4)
│   ├── fast-saas-nextjs/              # SaaS completo (Prisma + Supabase + Stripe)
│   ├── nextjs-landing-page/           # Landing page profissional
│   └── nextjs-mdx-blog/              # Blog MDX + shadcn/ui
└── snippets/        # Snippets de código reutilizáveis
    ├── nextjs-app/        # Snippets App Router (API routes, error, loading, RAG)
    ├── react-vite/        # Componentes React SPA (DataTable, Modal, FormField...)
    ├── static-html-css-js/# HTML/CSS/JS snippets (forms, accordion, hero, pricing)
    └── config/           # Configs (ESLint, Prettier)
```

## Como usar

### Template completo (clone)
1. Identificar o perfil do projeto (ver `../rules/stack-selection.md`)
2. Consultar `catalog.md` para candidatos
3. Justificar escolha contra pelo menos 2 opções
4. Registrar decisão em `.specs/projects/<nome>/tech-decisions.md`
5. Clonar **somente após** `APROVAR PLANO E INICIAR`

Exemplo:
```powershell
# Clonar dashboard template para um novo projeto
Copy-Item -Path "templates/full/next-shadcn-admin-dashboard/*" -Destination "projects/meu-app/" -Recurse
```

### Snippet (copiar trecho)
1. Localizar o snippet por categoria
2. Copiar o trecho relevante para o projeto
3. Adaptar design tokens e convenções do workspace

## Convenções

- Templates completos: preservar `AGENTS.md` próprio, ajustar `package.json`
- Snippets: não têm `package.json`, são blocos reutilizáveis
- Remover arquivos demo mockados após clone
- NUNCA copiar `.git`, `.env`, segredos ou dados mockados

## Catálogo externo

Ver `catalog.md` para referências externas (GitHub repos) não incluídos localmente.