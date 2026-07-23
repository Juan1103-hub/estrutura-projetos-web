# Seleção de Stack e Template

Regra contextual obrigatória durante o planejamento (`tlc-spec-driven`,
fase Discovery/decisões técnicas) de **todo projeto novo**, e em
mudanças estruturais relevantes de projetos web existentes.

---

## Regra de ouro

1. Nunca escolher stack ou template antes de concluir Discovery.
2. Ler `templates/catalog.md` e inspecionar as pastas locais reais em
   `templates/` antes de decidir — não assumir pelo nome.
3. Selecionar e **justificar** o template contra pelo menos 2 outras
   opções candidatas, mesmo quando a escolha parecer óbvia.
4. Registrar a decisão em `docs/template-decision.md` (ver modelo em
   `.specs/features/*/`, quando existir um exemplo anterior).
5. Copiar/clonar o template escolhido **somente após**
   `APROVAR PLANO E INICIAR` — nunca durante o planejamento.
6. Nunca carregar simultaneamente regras de perfis incompatíveis (ex.:
   `static-html-css-js.md` + `nextjs-app.md` no mesmo projeto).

## Perfis e quando aplicar cada um

| Perfil | Regra | Quando usar |
|---|---|---|
| Next.js — Sistema completo | `rules/nextjs-app.md` | CRUD complexo, SaaS, e-commerce, blog/CMS, múltiplas entidades, API routes |
| Next.js — Dashboard/KPI | `rules/nextjs-dashboard.md` | Sidebar + cards métricos + gráficos, backoffice, painel administrativo |
| React SPA (Vite) | `rules/react-vite.md` | SPA sem SSR/SEO, CRUD interno leve, ferramenta administrativa |
| HTML/CSS/JS estático | `rules/static-html-css-js.md` | Landing page, site institucional, página única sem backend |

Templates locais prontos (ver `templates/catalog.md` para detalhes e
links de referência externa):

| Pasta | Perfil |
|---|---|
| `templates/next-shadcn-admin-dashboard/` | Dashboard/Admin completo (sidebar, KPIs, tabelas) |
| `templates/fast-saas-nextjs/` | SaaS completo (Prisma, Supabase, Stripe) |
| `templates/nextjs-app/` | App CRUD (Prisma, shadcn/ui) |
| `templates/nextjs-landing-page/` | Landing page |
| `templates/nextjs-mdx-blog/` | Blog com MDX |
| `templates/react-vite/` | SPA React |
| `templates/static-html-css-js/` | Estático sem framework |
| `templates/config/` | Configs reutilizáveis (ESLint, Prettier, Tailwind) |

## Critérios de seleção (nesta ordem)

1. **Perfil funcional** — o template já tem o shell certo (sidebar, auth,
   billing, blog) para o que o projeto precisa?
2. **Alinhamento de stack** — versões de Next.js/React, gerenciador de
   UI (shadcn/ui + radix ou base-ui), Tailwind, TypeScript strict.
3. **Dependências desnecessárias** — o template traz algo que precisará
   ser removido (Stripe, Prisma, OAuth) e isso é mais trabalho do que
   partir de um template mais simples?
4. **Decisões já tomadas no projeto** — se o usuário já decidiu "sem
   Prisma" ou "Supabase direto", eliminar candidatos que dependem disso
   como parte central da arquitetura.
5. **Documentação interna do template** — templates com `AGENTS.md`
   próprio aceleram onboarding do agente nesse projeto específico.

## Exceção para projeto existente

Para manutenção de projeto que já existe, **não** tentar reclassificar
ou aplicar um template automaticamente. Primeiro identificar a stack
real em uso (ler `package.json`, arquivos de configuração, estrutura de
pastas) e seguir essa stack — só sugerir migração de template se o
usuário pedir explicitamente.

## Deploy padrão

- **Padrão do workspace:** Vercel (frontend) + Supabase (banco, auth, storage).
- **Netlify:** apenas como alternativa explícita e justificada pelo
  usuário — nunca assumida como padrão.
- Checklist completo de go-live em `DEPLOY.md`.
