---
name: Gestão de Tarefas Kanban · Vórtice Mineral
description: Painel de operação industrial para gestão de tarefas de almoxarifado, compras e administrativo.
colors:
  amber: "#ea7a1e"
  amber-deep: "#c2410c"
  slate-ink: "oklch(0.235 0.02 262)"
  slate-muted: "oklch(0.55 0.02 262)"
  slate-surface: "oklch(0.968 0.004 75)"
  slate-card: "oklch(0.99 0.004 75)"
  teal-accent: "oklch(0.55 0.09 185)"
  success: "#16a34a"
  danger: "#dc2626"
  ring: "oklch(0.70 0.15 51)"
typography:
  display:
    fontFamily: "system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.5rem, 2vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.01em"
    textTransform: "uppercase"
  title:
    fontFamily: "system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.02em"
rounded:
  sm: "calc(var(--radius) * 0.6)"
  md: "calc(var(--radius) * 0.8)"
  lg: "var(--radius)"
  xl: "calc(var(--radius) * 1.4)"
spacing:
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "var(--primary)"
    textColor: "var(--primary-foreground)"
    rounded: "0.5rem"
    padding: "0 0.625rem"
    height: "2rem"
  button-primary-hover:
    backgroundColor: "color-mix(in oklch, var(--primary), transparent 20%)"
  badge-priority-critical:
    backgroundColor: "rgb(254 226 226)"
    textColor: "rgb(153 27 27)"
  badge-status-overdue:
    backgroundColor: "rgb(254 226 226)"
    textColor: "rgb(185 28 28)"
  card-surface:
    backgroundColor: "var(--card)"
    textColor: "var(--card-foreground)"
    rounded: "var(--radius)"
    padding: "1rem"
  input-field:
    backgroundColor: "transparent"
    textColor: "var(--foreground)"
    rounded: "var(--radius)"
---

# Design System: Gestão de Tarefas Kanban · Vórtice Mineral

## Overview

**Creative North Star: "Sala de Controle Industrial"**

Um painel de operação de mineração: sério, legível sob a claridade de planta e
em escuro de turno, mas com caráter próprio — nunca o "azul SaaS genérico" nem
o card reflexo de IA. As metáforas vêm do chão de fábrica: ardósia rochosa,
metal polido, e o **laranja âmbar de segurança** carregando toda a energia de
marca. A interface é densa por natureza (são muitas tarefas, prazos e fluxos
paralelos), mas cada elemento fala a língua de quem opera: tudo legível em
frente de tela, ênfase clara no que exige ação agora.

A densidade é proposital e disciplinada: o primário (âmbar) é **raro** e
reservado a ações/estado, não decorativo. O conteúdo fala por peso tipográfico
e contraste, não por saturação espalhada.

**Key Characteristics:**
- Cores âmbar de segurança como energia; ardósia como tinta e canvas.
- Tipografia sistema (Segoe UI/Roboto) sem dep. de fonte externa, títulos com `uppercase` + `tracking` no painel.
- Cards de painel com `ring` sutil (borda 1px linearizada), nunca cartão-fantasia.
- Radar visual de prazos: âmbar = vence em breve, vermelho = atrasada.
- Dark mode ardósia profunda `oklch(0.16)` com o mesmo âmbar, mais vivo.

## Colors

A paleta é de **ardósia + âmbar de segurança**: quente perto de neutro, mas sem cair no "cream de IA". A saturação está no primário e nos alertas.

### Primary
- **Âmbar Segurança / Amber Industrial** (#d97706 → variante viva `#ea7a1e` no dark): a cor de energia. Ações principais, `--ring` de foco, marca, chip de contagem de coluna. Reservada. Não é preenchimento de fundo nem wallpaper.

### Secondary

- **Ardósia Secundária** (`oklch(0.64 0.03 262)`): cinza-azulado de operação. Preenchimento de botões secundários, fundos de seção.

### Tertiary

### Neutral

- **Cuinza Ardósia** (Superfície) (`#f4f5f7` / `oklch(0.968 0.004 75)`; dark `oklch(0.16 0.012 262)`): canvas industrial. Escuro é "ardósia profunda", não preto puro.
- **Ardósia Card** (`oklch(0.99 0.004 75)` light; `oklch(0.20…)` dark): superfícies de card/panel.
- **Tinta** (`oklch(0.235 0.02 262)`): texto primário. Azulado à ardósia.
- **Tinta sufocado** (`--muted-foreground`, `oklch(0.55…)`): texto secundário/labels.
- **Divisor** (`--border`, `oklch(0.88 0.01 75)` / dark `oklch(1 0 0 / 12%)`).

### Accents (funcionais)
- **Teal Minério** (`oklch(0.55 0.09 185)`): acento secundário — categorias, avatares.
- **Cobre Vermelho** (`#dc2626`): atraso / crítico / destrutivo.
- **Verde Acesso** (`#16a34a`): concluído.

### Named Rules
**The Amber Scarcity Rule.** O âmbar de segurança é usado em ≤~10% de qualquer tela; sua raridade É a hierarquia. Um painel com o primário em toda parte deixa de ser "energia" e vira "poluição".

**The One Hue Slate Rule.** O azul de convenção de terceiros (avatar, progresso `bg-blue-500`, `bg-blue-100`) é **fora** da paleta industrial — quando encontrado, deve ser substituído por ardósia/teal/âmbar do próprio token (ver Do's/Don'ts).

## Typography

**Display / Título-grande:** system-ui, Segoe UI, Roboto — `font-semibold`, `uppercase` + `tracking-wide` nos títulos de painel.
**Título de card/Item:** `font-medium` 1rem, sem uppercase.
**Body:** system-ui 0.875rem/1.5.
**Label/Badge:** 0.75em, `.font-medium`, `tracking` leve. Maiúsculas só em títulos de seção.

**Character:** pairing único (uma família em pesos), semântica industrial — "máquina, não revista". Medida de body mantida solta (painel, não editorial); foco em suportar densidade.

### Hierarchy
- **Display** (semibold, university, clamp): Títulos de página/dashboard — `uppercase` + tracking.
- **Title** (500, 1rem, 1.3): Título de card, headers de seção pequenos.
- **Body** (400, 0.875rem, 1.5): texto de tarfs, comentários, descrições. Contrast ≥ 4.5:1 via `--foreground`.
- **Label** (500, 0.75rem, tracking): badges, metadata, campos.

## Layout

Grid responsivo docs; o Kanban usa colunas em **painel** (`surface` com `ring`), scroll horizontal dentro da viewport da board. Dashboard usa grid `auto-fit minmax` para cards de métricas.mobile há board simplificado (acordeão de colunas) e nav lateral de fruto.O ritmo é de painel denso: `--card-spacing` (1rem) em cards, gaps `1rem-1.5rem` entre regiões.

## Elevation & Depth

**Plano, sem sombra dramática.** Profundidade é dada por **layering tonal** (ardósia superfície ↔ card `oklch(0.99)` ↔ header/border) e `ring-1` em cards. Sombra só em hover de interativos (`hover:shadow-md` em task-card). Não há fundo de sombra-chicote; o mundo é flat-industrial.

## Shapes

Cantos controlados: `--radius 0.55rem` (cards), botões `rounded-lg` (`0.5rem`), chips/badges `rounded-full`. Forma "industrial-machine": cantos levementemente cortados (não grotesco, não completamente redondo), coerente com metáfora de chão de fábrica. Badges de prioridade e prazu usam pill.

## Components

### Buttons
- **Shape:** `rounded-lg` (0.5rem); altura `lg`=32px, `sm`=28px, densas.
- **Primary:** `bg-primary` `text-primary-foreground`, hover `primary/80`, altura `h-8`. foco ring laranja.
- **Ghost**: `hover:bg-muted`. Outline: `border-border` + `hover:bg-muted`.
- **Secondary:** para filtros e ações de menos destaque.

### Chips / Badges
- **Style:** `bg-{semantic}-100 text-{semantic}-800 border-{semantic}-200` (ex: crítico `red-100/red-800`, media `orange`). São pills `rounded-full` com `text-[10-12px]` + borda. Prioridade usa cor de preenchimento leve; prazol "Atrasada" = `red` / "Vence em breve" = `orange`.

### Cards / Containers
- **Corner Style:** `rounded-xl`.
- **Background:** `bg-card` (`oklch(0.99)` light).
- **Shadow Strategy:** `ring-1 ring-foreground/10` (borda linearizada) — não sombra ambiente.
- **Border:** `ring` em vez de `border`; footer com `border-t`.
- **Internal Padding:** `--card-spacing` (p4 / 3 em sm).

### Inputs / Fields
- **Style:** sem borda own, depende de `input` token (`--input`), `rounded` full width.
- **Focus:** `ring` laranja (`--ring`) — consistente com o botão.

### Navigation
- Sidebar com tokens dedicados (`--sidebar-*`), cor de fundo ardósia; ativo usa `--sidebar-primary` (âmbar). Nav mobile em `mobile-nav` com ações thumb-friendly.

### Signature Component: Task Card
Card de tarefa com: título + badge de prioridade (pill cor), badge de categoria (secondary), progresso de checklist (barra âmbar? atualmente azul `bg-blue-500` — ver ax), data com indicador de prazo (âmbar/vermelha), "Apoio solicitado" `AlertCircle` âmbar, footer com responsável (avatar monograma) + contadores de comentários/anexos.

## Do's and Don'ts

### Do:
- **Do** usar `--primary` (âmbar) apenas em ações/marca — rar é a hierarquia.
- **Do** usar `uppercase`+`tracking` só em títulos de painel/dashboard; corpo em sentence case.
- **Do** dar feedback de prazo com cor: âmbar "vence em breve", vermelho "atrasada" (AC-030/031).
- **Do** usar sombra só em hover de um interativo (task-card) — profundidade = tonal+ring em repouso.
- **Do** manter badges de estado como pills com cor leve (bg-*100) + borda contrastada.

### Don't:
- **Don't** usar cores de terceiros hard-coded (`bg-blue-500` de progresso, `bg-blue-100` de avatar/prioridade) fora da paleta âmbar/ardósia — substituir por `teal`/`amber`/`slate` tokens.
- **Don't** aplicar o âmbar como preenchimento generalizado; ele é o aço de foco/ajãofoco.
- **Don't** exceder `radius` grotesco nem cantos retos cortados: manter a família `--radius` (industrial controlado).
- **Don't** título de card e de página com hierarquia igual — separar Display (uppercase) vs Title (500).