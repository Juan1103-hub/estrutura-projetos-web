# Perfil — Next.js App (Sistema Completo)

Usar este perfil para sistemas Next.js que NÃO são dashboards/kpis:
CRUDs complexos, e-commerces, plataformas SaaS, blogs, portfólios,
aplicações com autenticação e múltiplas entidades.

---

## Quando aplicar

- Sistema com múltiplas entidades (CRUD completo)
- Plataforma SaaS com auth e permissões
- E-commerce com catálogo, carrinho, checkout
- Blog/CMS com conteúdo dinâmico
- Portal do cliente com dados específicos
- API routes para integrações backend
- Qualquer Next.js que NÃO seja dashboard/KPI

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma (ORM) conectado ao Supabase Postgres
- Supabase Auth (sessão via @supabase/ssr)
- Supabase Storage (arquivos/imagens)
- React Hook Form + Zod (formulários)
- Vitest + Playwright (testes)
- Lucide React (ícones)
- **Host/Domínio**: Vercel (vinculado ao Supabase)

## Estrutura de diretórios

```
src/
  app/
    (auth)/             # rotas de auth (login, registro)
      login/
      register/
    (dashboard)/        # rotas autenticadas
      layout.tsx        # layout com sidebar
      products/
        page.tsx        # listagem
        [id]/
          page.tsx      # edição
      orders/
      customers/
    api/                # API routes
      products/
      orders/
    globals.css
    layout.tsx          # root layout
  components/
    ui/                 # shadcn/ui
    layout/             # Sidebar, Header, Breadcrumb
    forms/              # formulários por entidade
    tables/             # DataTable reutilizável
    dialogs/            # diálogos de confirmação/edição
  lib/
    prisma.ts           # cliente Prisma
    auth.ts             # configuração de auth
    utils.ts            # utilitários
  hooks/                # custom hooks
  types/                # TypeScript types
```

## Regras de bootstrap

1. `npx create-next-app@latest` com App Router + TypeScript + Tailwind
2. shadcn/ui: `npx shadcn@latest init -d`
3. Prisma: `npm install prisma @prisma/client` + `npx prisma init`
4. Auth: configurar Supabase Auth via `@supabase/ssr`
5. Estrutura de pastas: usar route groups `(auth)` e `(dashboard)`
6. Layouts aninhados: root layout → auth layout / dashboard layout
7. Loading states: usar `loading.tsx` em cada rota
8. Error states: usar `error.tsx` em cada rota
9. Metadata: definir em cada `page.tsx` com `generateMetadata()`
10. Nenhum emoji no código — usar Lucide icons sempre

## Padrões de código

### Server Components (padrão)

```tsx
// Por padrão, TODOS os componentes são Server Components
// Só usar 'use client' quando precisar de hooks, eventos ou browser APIs

export default async function ProductsPage() {
  const products = await prisma.product.findMany()
  return <ProductTable data={products} />
}
```

### Client Components

```tsx
'use client'

// Usar SOMENTE quando precisar de:
// - useState, useEffect, useContext
// - Event handlers (onClick, onChange)
// - Browser APIs (window, document)
// - Third-party libs que precisam de client

export function ProductForm() {
  const form = useForm({ resolver: zodResolver(schema) })
  return <Form {...form}>...</Form>
}
```

### API Routes

```typescript
// src/app/api/products/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const products = await prisma.product.findMany()
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const body = await request.json()
  const product = await prisma.product.create({ data: body })
  return NextResponse.json(product, { status: 201 })
}
```

### Forms com react-hook-form + Zod

```tsx
// TODO form DEVE ter:
// 1. Schema zod com mensagens em PT-BR
// 2. <Form {...form}> wrapper
// 3. Loading state no submit
// 4. Toast de sucesso/erro
// 5. Reset do form após sucesso

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.number().positive('Preço deve ser positivo'),
})
```

### DataTable reutilizável

```tsx
// Criar componente DataTable genérico com:
// - Ordenação por coluna
// - Paginação
// - Filtros
// - Seleção múltipla
// - Ações em lote
// - Empty state
// - Loading skeleton
```

## Gotchas

### Server vs Client

- **Server Components**: podem async, acesso direto ao banco, SEO
- **Client Components**: `'use client'` no topo, hooks, eventos, browser APIs
- **NÃO** passar funções como props de Server → Client
- **NÃO** usar `window`/`document` em Server Components
- **shadcn/tailwind.css**: NÃO funciona neste setup — não importar em globals.css
- **suppressHydrationWarning**: adicionar em `<html>` no layout.tsx
- **Layout**: usar `overflow-auto` (NÃO `overflow-hidden`) em containers com
  conteúdo dinâmico e scroll
- **SidebarProvider**: deve estar em client component (`providers.tsx`);
  sidebar usa `render={<Link href={...} />}` prop, NÃO `asChild`

### Data Fetching

- Server Components: `async function` + `await` direto
- Client Components: `useEffect` + fetch ou SWR/React Query
- Caching: usar `revalidate` em fetch ou `unstable_cache`
- Streaming: usar `<Suspense>` para carregamento progressivo

### Metadata

- Estática: exportar objeto `metadata` da page
- Dinâmica: exportar função `generateMetadata()`
- Templates: usar `title.template` no layout pai
- Open Graph: definir em cada page para SEO

### Auth + Security (Supabase)

- Server-side: `createServerClient` no middleware ou Server Component
- Client-side: `createBrowserClient` + contexto de auth + rotas protegidas
- API routes: validar sessão com `getUser()` em cada handler
- RLS: obrigatório em toda tabela, `security_invoker = true` em views
- Storage: bucket com RLS, paths prefixados por `auth.uid()`
- Nunca expor `service_role` key no frontend

### Formulários

- React Hook Form: `useForm` com `zodResolver`
- Validación: server-side em API routes, client-side em forms
- Submit: desabilitar botão durante envio
- Erros: associar ao campo específico via ` FormMessage`
- Sucesso: toast + redirect ou reset

### Imagens

- Usar `<Image>` do Next.js sempre
- `priority` para above-the-fold
- `placeholder="blur"` com blurDataUrl
- Remote patterns no `next.config.js` para domínios externos

### Performance

- Server Components: acesso direto ao banco sem API layer
- Streaming: `<Suspense>` para carregamento progressivo
- Code splitting: `dynamic()` para componentes pesados
- Fonts: `next/font` para otimização automática
