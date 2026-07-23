# Impeccable — Padrão obrigatório de design frontend

Carregar este módulo sempre que a demanda envolver HTML, CSS, React,
Next.js ou qualquer componente visual.

## Fluxo obrigatório ao receber um comando Impeccable

Quando o usuário disser um comando da tabela abaixo (ex.: "harden",
"adapt", "quieter", "polish", "audit", "critique"):

1. **CARREGAR a skill `impeccable`** via `skill(name="impeccable")`
2. **LER o reference do comando** em `reference/<comando>.md`
   (ex.: `reference/harden.md`, `reference/adapt.md`)
3. **LER o register** (`reference/brand.md` para landing pages,
   `reference/product.md` para apps/dashboards)
4. **LER ao menos um arquivo do projeto** (CSS, tokens, componente)
5. **SEGUIR o fluxo do reference** — não pular etapas
6. **SÓ ENTÃO editar código**

> Esta sequência é OBRIGATÓRIA. Pular o loading da skill ou do
> reference causa output genérico e desalinhado.

## Mapeamento comando → reference

| Comando | Reference | Descrição |
|---|---|---|
| `init` | `reference/init.md` | Setup do projeto (PRODUCT.md + DESIGN.md) |
| `document` | `reference/document.md` | Gerar DESIGN.md do código existente |
| `extract` | `reference/extract.md` | Extrair tokens e componentes |
| `shape` | `reference/shape.md` | Planejar UX antes de codar |
| `craft` | `reference/craft.md` | Construir feature do zero |
| `critique` | `reference/critique.md` | Review heurístico de UX |
| `audit` | `reference/audit.md` | Auditoria técnica (a11y, perf, responsive) |
| `polish` | `reference/polish.md` | Passada final antes de shipping |
| `bolder` | `reference/bolder.md` | Amplificar design seguro |
| `quieter` | `reference/quieter.md` | Reduzir intensidade visual |
| `distill` | `reference/distill.md` | Reduzir à essência |
| `harden` | `reference/harden.md` | Erros, i18n, edge cases |
| `onboard` | `reference/onboard.md` | Empty states, first-run |
| `animate` | `reference/animate.md` | Animações propositais |
| `colorize` | `reference/colorize.md` | Cor estratégica |
| `typeset` | `reference/typeset.md` | Hierarquia tipográfica |
| `layout` | `reference/layout.md` | Espaçamento e alinhamento |
| `delight` | `reference/delight.md` | Encantamento e personalidade |
| `overdrive` | `reference/overdrive.md` | Efeitos extraordinários |
| `clarify` | `reference/clarify.md` | UX copy e mensagens |
| `adapt` | `reference/adapt.md` | Adaptação entre dispositivos |
| `optimize` | `reference/optimize.md` | Performance UI |
| `live` | `reference/live.md` | Iteração visual no browser |

## Register (obrigatório antes de codar)

- Landing page, site institucional, portfolio → `reference/brand.md`
- Dashboard, admin, ferramenta → `reference/product.md`

## Verificação pós-task

Após implementar qualquer comando:

1. Build limpo (`npm run build`)
2. Testes verdes (`npm test`)
3. Nenhum anti-padrão da skill Impeccable presente:
   - ❌ Gradient text (`bg-gradient-to-r ... bg-clip-text text-transparent`)
   - ❌ Grid decorativo (`linear-gradient(... 1px, transparent 1px)`)
   - ❌ Eyebrow labels repetidos (`tracking-widest uppercase`)
   - ❌ Side-stripe borders
   - ❌ Glassmorphism decorativo
   - ❌ Card grids idênticos
   - ❌ Número de seção (01, 02, 03) como scaffolding
4. `prefers-reduced-motion` implementado se houver animação
5. Touch targets ≥ 44px

## Observação

OpenCode não tem hooks automáticos. Esta regra substitui o
comportamento manual descrito na seção anterior: o agente DEVE
executar o passo 1-6 automaticamente ao detectar um comando,
sem esperar instrução do usuário.