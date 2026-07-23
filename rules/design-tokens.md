# Design Tokens — Padrão Visual

Padrões de design tokens para todos os projetos web Next.js + shadcn/ui.

---

## Paleta OKLCH (globals.css)

### :root (light mode)

```css
--primary: oklch(0.55 0.175 160);        /* emerald — ações principais */
--sidebar: oklch(0.14 0 0);              /* dark — fundo sidebar 260px */
--background: oklch(0.985 0.002 230);    /* cinza claro — fundo geral */
--card: oklch(1 0 0);                    /* branco — cards */
--muted-foreground: oklch(0.42 0.015 230); /* contraste 5.6:1 no light */
--warning: oklch(0.65 0.2 50);           /* laranja — alertas */
--info: oklch(0.55 0.15 250);            /* azul — informativo */
--chart-1: oklch(0.55 0.175 160);        /* emerald */
--chart-2: oklch(0.6 0.15 250);          /* blue */
--chart-3: oklch(0.55 0.18 280);         /* indigo */
--chart-4: oklch(0.65 0.18 130);         /* lime */
--chart-5: oklch(0.6 0.2 340);           /* pink */
--radius: 0.625rem;
```

### .dark (dark mode)

```css
--sidebar-accent: oklch(0.25 0.12 160);  /* emerald escuro — item ativo */
--muted-foreground: oklch(0.65 0.015 230); /* contraste 4.8:1 no dark */
```

### @theme inline

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-sidebar: var(--sidebar);
  --color-warning: var(--warning);
  --color-info: var(--info);
  --radius: var(--radius);
}
```

## Regras de uso

### Texto numérico (tabular-nums)

- TODOS os valores numéricos monetários, quantitativos e de data/hora:
  font-family Inter + `font-variant-numeric: tabular-nums`
- Abreviar com className `tabular-nums` em `<span>`, `<p>`, `<td>`
- NUNCA usar `font-mono` para valores numéricos

### Identificadores (font-mono)

- `font-mono` SOMENTE para: CPF, CNPJ, código de barras, ID da venda, horários
- Formatação de moeda: `R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

### Textos visíveis

- TODOS os textos visíveis na UI devem estar em PT-BR
- Labels, títulos, botões, placeholders, empty states, mensagens de erro
- Valores de SelectItem: usar label em PT-BR, value em inglês apenas para dados internos
- NUNCA usar texto em inglês em elementos visíveis (ex.: "Close" → "Fechar")

### Contraste

- `muted-foreground`: light ≥ 4.5:1, dark ≥ 4.0:1 (WCAG AA)
- Textos em fundo colorido: sempre verificar contraste mínimo
- Usar `text-warning` em vez de `text-orange-600` (token consistente)
- Usar `text-info` em vez de `text-blue-600` (token consistente)

### Dimensões

- Sidebar: 260px expandida, 64px collapsed
- Dialogs: `max-w-md` para formulários, `max-w-sm` para confirmações
- Touch targets: ≥ 44px (botões, links, ícones clicáveis)
