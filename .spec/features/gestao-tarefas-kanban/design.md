# Design — Gestão de Tarefas Kanban · Vórtice Mineral

> Decidido na fase **Projetar** (onp-spec). A skill escolheu a identidade visual
> — não é o template padrão de dashboard. Contexto do produto: indústria de
> mineração (Vórtice Mineral); usuários = equipes operacionais de Almoxarifado,
> Compras e Administrativo que acessam o sistema durante a rotina de planta.

## Direção visual: "Painel industrial de operação"

A linguagem é de uma **sala de controle industrial**: séria, legível sob
claridade/quarto, mas com caráter próprio — sem o "azul SaaS genérico" nem
card de IA padrão. As metáforas são do chão de fábrica: ardósia de rocha,
metal polido, e o **laranja de segurança** como cor de energia.

### Paleta

| Token | Valor | Uso |
|---|---|---|
| **Primário** | Laranja âmbar `#d97706`→`#f59e0b` | ações principais, foco, marca |
| **Fundo / superfície** | Ardósia quente (`#f4f5f7` claro / `#171a1f` escuro) | canvas industrial |
| **Acento minério** | Teal `#0d9488` | secundário, tags, avatar |
| **Atenção** | Cobre/vermelho `#dc2626` | atrasos, crítico |
| **Sucesso** | Verde `#16a34a` | concluído |
| **Negação** | Slate `#334155` | neutros |

### Tipografia
- **Títulos/telas**: Mensch de tela? Não — usar **"Bahnschrift"/"Segoe UI"
  Roboto** com peso maior e track leve; cabeçalho com `font-semibold` e maior
  contraste. Para identidade sem depender de carregar fonte externa, usar
  `Inter/system` com peso. Além disso: títulos com `uppercase`+`tracking-wide`
  no painel (estilo industrial).

### Componentes e toques de identidade
- Colunas do Kanban em **superfície de painel** (`bg-muted/40`), borda definida,
  contador em chip laranja.
- Cards: borda `border`, sombra sutil, cantos levemente menores, categoria com
  dot/ícone, prioridade com barra lateral de cor (não só badge).
- Avatar com **monograma em gradiente teal→slate**.
- Drop target: ring laranja quando em hover (hoje é azul blue — trocar).

### Dark mode
Mesmo âmbar porém mais queimado (`#ea7a1e`), fundo mais profundo `#111417`.

### O que mantém
- Components shadcn/ui, @dnd-kit, layout da página — só muda a pele.

## Decisões registradas

- **Modelo**: `claude-sonnet-5` (interface densa porém CRUD + arrastar/soltar;
  sem necessidade de opus). Registrado como suposição ASM-005 (assumida na
  ausência de critério forte).
- Cor primária deixa o azul genérico por um âmbar industrial.