# Perfil — HTML/CSS/JS Estático

Usar este perfil para landing pages, sites institucionais, protótipos rápidos,
páginas de venda e qualquer projeto sem backend ou framework JavaScript.

---

## Quando aplicar

- Landing page ou página de venda
- Site institucional (empresa, portfólio, sobre)
- Protótipo de alta fidelidade para validação
- Página única com formulário de contato
- Email HTML ou página de manutenção
- Qualquer projeto que NÃO precise de SSR, API routes ou backend

## Stack

- HTML5 semântico + CSS3 variáveis + JavaScript vanilla
- Formulários via Supabase JS client (REST) ou Formspree
- Google Fonts (Inter ou adequada ao projeto)
- **Host**: Vercel (deploy gratuito, domínio customizado)

## Estrutura de diretórios

```
projeto/
  index.html          # página principal
  css/
    variables.css     # design tokens CSS
    base.css          # reset + tipografia
    components.css    # botões, cards, formulários
    layout.css        # grid, flexbox, responsivo
    pages.css         # estilos específicos de página
  js/
    main.js           # inicialização + eventos globais
    components.js     # componentes reutilizáveis (accordion, modal, etc.)
    form.js           # validação + envio de formulário
    animations.js     # efeitos de scroll, fade-in, parallax
  assets/
    images/           # imagens otimizadas (WebP preferencial)
    icons/            # ícones SVG inline ou sprite
  pages/              # páginas adicionais (se multi-page)
```

## Regras de bootstrap

1. Criar `index.html` com DOCTYPE, lang="pt-BR", meta viewport, meta description
2. CSS com variáveis para cores, tipografia, espaçamento, border-radius
3. Reset mínimo: `*, *::before, *::after { box-sizing: border-box; margin: 0; }`
4. Grid/Flexbox para layout — NUNCA float
5. Responsivo: mobile-first com `min-width` breakpoints
6. Formulários: validação client-side + feedback visual imediato
7. Imagens: `loading="lazy"`, `width`/`height` sempre definidos
8. Acessibilidade: contraste WCAG AA, alt em imagens, labels em inputs
9. Performance: CSS/JS minificados, imagens comprimidas
10. Sem emoji no código — usar SVG inline ou Lucide icons (via CDN se necessário)

## Design tokens CSS

```css
:root {
  /* Cores */
  --color-primary: #059669;
  --color-primary-dark: #047857;
  --color-primary-light: #d1fae5;
  --color-secondary: #1e293b;
  --color-accent: #f59e0b;
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-error: #dc2626;
  --color-success: #059669;

  /* Tipografia */
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Espaçamento */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  /* Bordas */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* Transições */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

## Gotchas

### Performance

- NÃO usar frameworks JS desnecessários (jQuery, Lodash) para tarefas simples
- CSS em arquivo único ou concatenado — evitar múltiplos `<link>` sem bundle
- JS modular com `type="module"` — sem IIFE ou bundler obrigatório
- Fonts: usar `font-display: swap` para evitar FOIT

### SEO

- Meta tags: title, description, Open Graph, canonical
- Estrutura de headings: h1 único por página, h2-h6 hierárquicos
- Dados estruturados JSON-LD para empresa, produto, evento
- Sitemap XML e robots.txt

### Acessibilidade

- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande
- Navegação por teclado: tab order lógico, focus visible
- Skip links para conteúdo principal
- aria-label em ícones sem texto
- Formulários: legend em fieldset, error messages associados

### Imagens

- Formato WebP com fallback JPEG
- `loading="lazy"` em imagens below-the-fold
- `srcset` para responsivo (se necessário)
- SVG inline para ícones e ilustrações simples
