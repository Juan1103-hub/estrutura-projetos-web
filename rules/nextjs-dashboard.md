# Perfil — Next.js Dashboard (KPIs, Painéis, Backoffice)

Usar este perfil para dashboards, painéis de controle, relatórios gerenciais,
backoffice, KPIs e qualquer aplicação com sidebar + cards métricos + gráficos.
Este é o template padrão do workspace.

---

## Quando aplicar

- Dashboard com KPIs e cards métricos
- Painel de controle com sidebar + navegação por seções
- Backoffice com relatórios e gráficos
- Sistema de monitoramento com alertas
- Painel administrativo com múltiplas views
- Qualquer app com layout sidebar + conteúdo principal

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase Auth + Postgres
- Supabase Realtime (se precisar de dados ao vivo)
- Chart.js + react-chartjs-2 (gráficos)
- Lucide React (ícones)
- Fonte: Inter via `next/font/google`
- **Host/Domínio**: Vercel (vinculado ao Supabase)

## Estrutura de diretórios

```
src/
  app/
    globals.css          # tokens OKLCH + @theme inline
    layout.tsx           # Inter font + metadata + theme-color
    page.tsx             # client component com sidebar + seções
  components/
    ui/                  # shadcn/ui (Button, Card, Input, Select, etc.)
    layout/
      sidebar.tsx        # sidebar 260px, dark, grupos, badge, footer
      layout-wrapper.tsx # wrapper com sidebar + main content
      providers.tsx      # SidebarProvider + LayoutWrapper
    sections/            # uma seção por funcionalidade
    charts/              # componentes de gráfico
  lib/
    data.ts              # dados mockados / chamadas API
    utils.ts             # shadcn cn()
```

## Regras de bootstrap

1. Usar `create-next-app@16` para bootstrap
2. shadcn/ui com `npx shadcn@latest init -d`
3. Instalar: `lucide-react chart.js react-chartjs-2`
4. Cards métricos SEMPRE com bg icone `bg-chart-N/10` e texto `text-chart-N`
5. Sidebar dark com grupos, badges e footer do usuário
6. Seções carregadas com `React.lazy()` + `Suspense`
7. Navegação por estado (useState com SectionId), sem router
8. Nenhum emoji no código — usar Lucide icons sempre
9. Nenhuma animação orquestrada na entrada (produto carrega sem coreografia)
10. Touch targets ≥ 44px (WCAG 2.1)
11. Contraste WCAG AA em todos os textos

## Componentes padrão

### Sidebar (260px dark)

```tsx
// sidebar.tsx
// - Fundo: var(--sidebar) oklch(0.14 0 0)
// - Item ativo: var(--sidebar-accent) oklch(0.25 0.12 160)
// - Render prop: render={<Link href={...} />} (NÃO asChild)
// - Footer: avatar + nome + cargo + botão logout
// - Grupos: seções colapsáveis com título
// - Badges: contadores ao lado dos itens
```

### MetricCard

```tsx
// card métrico com:
// - Ícone colorido (bg-chart-N/10 + text-chart-N)
// - Título (muted-foreground)
// - Valor grande (font-semibold, tabular-nums)
// - Variação percentual (verde/vermelho com seta)
```

### ChartCard

```tsx
// card com gráfico Chart.js:
// - Título + período
// - Gráfico (Line, Bar, Doughnut)
// - Legenda (se aplicável)
// - Skeleton no loading
```

## Design tokens (globals.css)

```css
:root {
  --primary: oklch(0.55 0.175 160);        /* emerald */
  --sidebar: oklch(0.14 0 0);              /* dark */
  --sidebar-accent: oklch(0.25 0.12 160);  /* emerald escuro */
  --background: oklch(0.985 0.002 230);    /* cinza claro */
  --card: oklch(1 0 0);                    /* branco */
  --muted-foreground: oklch(0.42 0.015 230); /* 5.6:1 light */
  --warning: oklch(0.65 0.2 50);           /* laranja */
  --info: oklch(0.55 0.15 250);            /* azul */
  --chart-1: oklch(0.55 0.175 160);        /* emerald */
  --chart-2: oklch(0.6 0.15 250);          /* blue */
  --chart-3: oklch(0.55 0.18 280);         /* indigo */
  --chart-4: oklch(0.65 0.18 130);         /* lime */
  --chart-5: oklch(0.6 0.2 340);           /* pink */
  --radius: 0.625rem;
}
```

## Gotchas

### shadcn/ui + base-ui (App Router)

- **Sidebar**: usar `render={<Link href={...} />}` prop, NÃO `asChild`
- **SidebarProvider**: deve estar em client component (`providers.tsx`)
- **Select defaultValue vs value**: SEMPRE usar `value={field.value}` (controlled)
- **Form wrapper**: todo formulário com react-hook-form DEVE ter `<Form {...form}>`
- **zod v4**: usar `message` em vez de `required_error`
- **shadcn/tailwind.css**: NÃO funciona neste setup — não importar em globals.css
- **suppressHydrationWarning**: adicionar em `<html>` no layout.tsx

### Layout

- `layout-wrapper.tsx` main: usar `overflow-auto` (NÃO `overflow-hidden`)
- Para scroll, sempre `overflow-auto` em containers com conteúdo dinâmico
- Sidebar: 260px expandida, 64px collapsed (se implementar colapso)
- Content area: flex-1 com scroll independente

### Números

- Valores monetários: Inter + `tabular-nums`
- IDs e códigos: `font-mono` (sale ID, barcode, etc.)
- Formatação: `R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

### Textos

- TODOS os textos visíveis em PT-BR
- NENHUM emoji — usar Lucide icons
- NENHUM `console.log` em produção
- Empty states com ícone + texto descritivo

### Supabase (se aplicável)

- Deploy padrão: Vercel (frontend) + Supabase (banco/auth)
- Netlify apenas como alternativa explícita e justificada (ver `rules/security-secrets.md`)
- Nunca expor `service_role` key
- RLS habilitado em todas as tabelas
- Ver DEPLOY.md para checklist completo

### Performance

- Lazy loading por seção: `React.lazy()` + `<Suspense>`
- Skeletons para estados de carregamento
- Imagens: `<Image>` do Next.js com priority se above-the-fold
- Fonts: `next/font` para otimização automática
