# Perfil — React SPA (Vite)

Usar este perfil para aplicações React single-page sem SSR: dashboards leves,
CRUDs internos, ferramentas administrativas, protótipos com dados reais.

---

## Quando aplicar

- SPA React sem necessidade de SSR/SEO
- CRUD administrativo com rotas
- Ferramenta interna (backoffice leve, gerenciador)
- Protótipo funcional com dados reais e estado global
- Dashboard que NÃO precisa de SSR nem metadata dinâmico
- Qualquer app React que não seja landing page nem Next.js

## Stack

- React 19 + TypeScript
- Vite (bundler + dev server)
- Supabase JS Client (banco, auth, storage via REST)
- Tailwind CSS v4
- React Router v7 (se houver múltiplas rotas)
- React Hook Form + Zod (formulários)
- Vitest + Testing Library (testes unitários)
- Playwright (testes E2E)
- **Host**: Vercel (SPA static export)

## Estrutura de diretórios

```
src/
  components/
    ui/                 # componentes genéricos (Button, Card, Input, etc.)
    layout/             # Header, Sidebar, Footer
    forms/              # formulários reutilizáveis
    features/           # componentes específicos de funcionalidade
  pages/                # uma pasta por página/rota
    Dashboard/
    Users/
    Products/
  hooks/                # custom hooks
  contexts/             # React Context providers
  services/             # chamadas de API (Axios/fetch)
  types/                # TypeScript types/interfaces
  utils/                # funções utilitárias
  styles/               # variáveis CSS, mixins (se não usar Tailwind)
  App.tsx               # rotas + layout principal
  main.tsx              # entry point
```

## Regras de bootstrap

1. `npm create vite@latest` com template React + TypeScript
2. Tailwind CSS: `npm install -D tailwindcss @tailwindcss/vite`
3. React Router: `npm install react-router` (se multi-página)
4. Componentes: criar `src/components/ui/` com Button, Card, Input, Select
5. TypeScript strict mode no tsconfig.json
6. ESLint + Prettier configurados
7. Testes: `vitest` + `@testing-library/react`
8. Nenhum emoji no código — usar Lucide icons

## Componentes UI padrão

### Button

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}
```

### Card

```tsx
interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}
```

### Form (React Hook Form + Zod)

```tsx
// Todo form DEVE usar:
// 1. useForm com resolver zod
// 2. <Form {...form}> wrapper
// 3. Mensagens de erro em PT-BR
// 4. Loading state no submit

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
})
```

## Gotchas

### React 19

- Client Components: adicionar `'use client'` NÃO existe em Vite — usar só no contexto
- Hooks: não chamar condicionalmente
- Keys: sempre em listas `.map()`
- Memo: usar `React.memo()` apenas em componentes pesados re-renderizados

### Vite

- Environment variables: `VITE_*` prefixo obrigatório
- Path aliases: configurar no `vite.config.ts` e no `tsconfig.json`
- SVG: usar `vite-plugin-svgr` para import como componente
- Dev server: porta padrão 5173

### React Router v7

- Layouts: usar `<Outlet />` para layouts aninhados
- Loading: usar `useNavigation().state` para indicar carregamento
- Error boundaries: usar `ErrorBoundary` em rotas
- Nested routes: pastas com `index.tsx` para rotas pai

### Zustand (se houver estado global)

- Store mínimo: `create((set) => ({ ... }))`
- Selectors: sempre selector específico, nunca objeto inteiro
- Persistência: `persist` middleware para localStorage

### Testes

- Vitest: `npm install -D vitest @testing-library/react jsdom`
- Setup: criar `src/test-setup.ts` com `@testing-library/jest-dom`
- Coverage: `vitest --coverage` com c8

### Performance

- Code splitting: `React.lazy()` + `<Suspense>` por rota
- Imagens: formato WebP, lazy loading
- Bundle: `npm run build` + analisar com `rollup-plugin-visualizer`
