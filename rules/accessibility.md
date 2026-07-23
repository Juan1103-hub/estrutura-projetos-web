# Acessibilidade — Regras Obrigatórias

Conformidade com WCAG 2.1 nível AA em toda interface web.

---

## Requisitos obrigatórios

### 1. Contraste mínimo

- Texto normal: 4.5:1 (WCAG AA)
- Texto grande (≥18px bold ou ≥24px): 3:1
- Componentes interativos: 3:1 contra fundo
- `muted-foreground`: light ≥ 4.5:1, dark ≥ 4.0:1

### 2. Touch targets

- Mínimo 44px × 44px para todos os elementos interativos
- Botões, links, ícones clicáveis, células de tabela clicáveis
- Usar classes: `min-h-[44px] min-w-[44px]` ou `h-10 w-10`

### 3. Labels de acessibilidade

- TODOS os botões de ação com `aria-label`
- Campos de formulário associados a `<Label>` via `htmlFor`/`id`
- `sr-only` text para botões só com ícone

```tsx
// Botão com aria-label
<Button onClick={handleDelete} aria-label="Excluir">
  <Trash2 className="h-4 w-4" />
</Button>

// Ícone com sr-only
<span className="sr-only">Fechar</span>
```

### 4. Navegação por teclado

- Todos os elementos interativos acessíveis via Tab
- Ordem de tabulação lógica (topo→baixo, esquerda→direita)
- `focus-visible` visível em todos os elementos focáveis
- Modais devem conter foco (focus trap)

### 5. ARIA e roles

- Usar landmarks: `<main>`, `<nav>`, `<aside>`, `<header>`
- `role="dialog"` em modais
- `aria-live="polite"` para atualizações dinâmicas
- `aria-expanded` em botões que expandem/recolhem conteúdo

### 6. Imagens e ícones

- Ícones decorativos: `aria-hidden="true"`
- Ícones informativos: `aria-label` no elemento pai
- Imagens reais: `alt` descritivo

### 7. Formulários

- Mensagens de erro associadas via `aria-describedby`
- Campos obrigatórios: `aria-required="true"` ou `*` visual
- Status de validação: `aria-invalid="true"` + mensagem

## Ferramentas de verificação

- `$impeccable audit` — verifica acessibilidade visual
- `$impeccable critique` — revisão subjetiva de UX
- Chrome DevTools — Lighthouse accessibility audit
- `take_snapshot` — verifica árvore de acessibilidade

## Checklist de code review (UI)

1. Todos os botões de ação com `aria-label`
2. Contraste ≥ 4.5:1 em todos os textos
3. Touch targets ≥ 44px
4. Labels associados a campos de formulário
5. Mensagens de erro com `aria-describedby`
6. Ícones decorativos com `aria-hidden`
