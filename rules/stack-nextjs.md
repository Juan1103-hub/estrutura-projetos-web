# Next.js App Router

> Consolida: nextjs-app + nextjs-dashboard

---

## Quando usar

- CRUD completo, SaaS, e-commerce, blog com API
- Dashboard com sidebar, KPIs e gráficos
- Projetos que precisam de SSR/SSG + API routes

## Estrutura padrão

```
src/
  app/
    (auth)/login/          # Rotas de autenticação
    (app)/                 # Rotas autenticadas
      layout.tsx           # Sidebar + providers
      dashboard/           # Página principal
      <modulo>/            # Módulos do sistema
  components/
    ui/                    # shadcn/ui
    layout/                # Sidebar, providers, auth
    <modulo>/              # Componentes por módulo
  lib/
    supabase/              # Client server/browser
    utils.ts
  server/
    actions/               # Server Actions
  types/
```

## Convenções

### Server Components (padrão)

- Usar `async` para buscar dados diretamente no componente
- Não usar `useState` para dados que vêm do banco

### Client Components

- Marcar com `"use client"` apenas quando necessário (interatividade)
- Co-locar em `_components/` dentro da pasta da rota

### Server Actions

- Usar `"use server"` para mutações
- Validar entrada com Zod antes de processar
- Retornar `{ success, data, error }` para tratamento no client

### Layout

- Route groups: `(auth)` para login/cadastro, `(app)` para sistema autenticado
- Sidebar com navegação por role
- Providers: Theme, Auth, Query Client

## Dashboard

### Padrão Sidebar + KPIs

- Sidebar dark 260px com módulos agrupados
- Cards de KPI no topo (valor, variação, período)
- Tabela ou gráfico principal
- Filtros por período

### Componentes reutilizáveis

- `SectionCards` — cards de resumo
- `ChartAreaInteractive` — gráfico com filtros
- `DataTable` — tabela com sorting/filtro/paginação

## Segurança

- RLS em toda tabela exposta ao cliente
- AuthZ no servidor e/ou banco — não só UI
- `service_role` nunca no client
- Validar sessão com `getUser()` em Server Actions

## Deploy

- Vercel (frontend) + Supabase (banco, auth, storage)
- Variáveis de ambiente no Vercel Dashboard
- `NEXT_PUBLIC_*` apenas para configuração pública
