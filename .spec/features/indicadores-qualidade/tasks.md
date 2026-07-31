# Tasks: Indicadores de Qualidade

> feature: indicadores-qualidade

<!--
  Como ler este arquivo (o formato é verificado por `onp-spec audit`):
  - T-xxx = tarefa (código de rastreio, único no projeto inteiro).
  - Toda tarefa referencia em `Refs:` pelo menos uma história de usuário
    (US-001) ou critério de aceite (AC-xxx).
  - Toda tarefa lista os arquivos que cria/altera em `Arquivos:` — capriche:
    é o que decide o que `onp-spec plano` roda em PARALELO (arquivos
    disjuntos) e o que roda em sequência (arquivo compartilhado).
  - Campos opcionais por tarefa, usados pelo plano de execução:
    `- Modelo: claude-sonnet-5` e `- Esforço: alto` (baixo|medio|alto|xalto|max).
  - Uma tarefa só pode virar [concluida] quando os critérios de aceite dela
    tiverem prova PASS registrada por `onp-spec verify`.
  Status: pendente | em-andamento | concluida
    (atalho: `onp-spec tarefa <feature> <T-xxx> <status>`)
-->

## T-001 — Server Action para buscar indicadores com metas [pendente]

- Refs: US-001, AC-001
- Arquivos: src/server/actions/indicators.ts, src/types/indicators.ts
- Notas: Criar tipos para IndicatorWithTarget (indicator + target vigente). Server Action que recebe module ('farmacia'|'laboratorio') e retorna indicadores com target vigente via Supabase query com join em indicator_targets WHERE valid_from <= CURRENT_DATE ORDER BY valid_from DESC LIMIT 1 por indicator.

## T-002 — Server Action para buscar entradas de indicadores (últimos 12 meses) [pendente]

- Refs: US-001, AC-001, AC-002
- Arquivos: src/server/actions/indicators.ts
- Notas: Adicionar query que busca indicator_entries dos últimos 12 meses agrupadas por indicator_id e month. Retorna Map<indicator_id, {month, value}[]>. Integrar com T-001 para montar a tabela completa.

## T-003 — Componente TabelaMensalIndicadores [pendente]

- Refs: US-001, AC-001, AC-002
- Arquivos: src/components/indicators/tabela-mensal.tsx
- Notas: Tabela reutilizável: colunas = indicador | jan | fev | ... | dez | meta. Cada célula de valor é comparada com a meta usando o comparator (>= ou <=). Se fora da meta, aplica classe CSS vermelho (bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400). Usar shadcn Table. Skeleton loading.

## T-004 — Server Action para lançamento de indicador [pendente]

- Refs: US-002, AC-004, AC-005, AC-006
- Arquivos: src/server/actions/indicators.ts
- Notas: Server Action que recebe {indicator_id, month, value}. Verificar meta vigente (se não existe, retorna erro com código META_AUSENTE). Usar RPC confirm_indicator_entry ou INSERT direto com tratamento de UNIQUE violation (retorna INDICADOR_DUPLICADO). Registrar created_by = auth.uid(). Access log para PII. Admin de qualidade pode lançar para qualquer módulo; profissional do setor apenas para o seu.

## T-005 — Modal/Formulário de lançamento [pendente]

- Refs: US-002, AC-004, AC-005, AC-006
- Arquivos: src/components/indicators/form-lancamento.tsx
- Notas: Dialog shadcn com: select do indicador (filtrado por mês), input month (React Day Picker), input numérico. Submit chama T-004. Toast sonner de sucesso/erro. Tratamento de INDICADOR_DUPLICADO (sugere retificação) e META_AUSENTE (aviso).

## T-006 — Componente GraficoLinhaIndicador [pendente]

- Refs: US-003, AC-007
- Arquivos: src/components/indicators/grafico-linha.tsx
- Notas: Usar shadcn Chart (Recharts). Eixo X = meses, Eixo Y = valores. Linha do indicador + linha tracejada da meta. Props: indicatorId, data (month[], values[]), target. Skeleton loading. Responsivo.

## T-007 — Componente GraficoBarraConsolidado [pendente]

- Refs: US-003, AC-008
- Arquivos: src/components/indicators/grafico-barra.tsx
- Notas: Usar shadcn Chart (Recharts). Barras por indicador no período selecionado. Barras fora da meta em vermelho, dentro em verde. Props: indicators[], month. Tooltip com nome, valor, meta.

## T-008 — Página de indicadores do módulo (farmácia) [pendente]

- Refs: US-001, US-002, US-003, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008
- Arquivos: src/app/(app)/farmacia/indicadores/page.tsx
- Notas: Page Server Component. Busca indicadores via T-001/T-002 com module='farmacia'. Acessível para role 'farmacia' e role 'qualidade' (qualidade vê ambos os módulos). Renderiza T-003 (tabela), filtros de período (T-003 já suporta), botão "Lançar indicador" abre T-005. Aba de gráficos com T-006 e T-007. Breadcrumb. Empty state se sem indicadores.

## T-009 — Página de indicadores do módulo (laboratório) [pendente]

- Refs: US-001, US-002, US-003, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008
- Arquivos: src/app/(app)/laboratorio/indicadores/page.tsx
- Notas: Mesma estrutura de T-008 mas com module='laboratorio'. Acessível para role 'laboratorio' e role 'qualidade' (qualidade vê ambos os módulos). Reutilizar componentes de T-003, T-006, T-007. Grid consolidado de cards por indicador conforme spec existente do projeto.

## T-010 — Dashboard geral: cards de indicadores fora da meta [pendente]

- Refs: US-004, AC-009
- Arquivos: src/app/(app)/dashboard/page.tsx, src/components/dashboard/section-cards.tsx
- Notas: Atualizar dashboard existente. Buscar indicadores dos dois módulos com valor atual vs meta. Filtrar apenas os fora da meta. Renderizar cards agrupados por módulo com: nome do indicador, valor atual, meta, % desvio. Skeleton loading.

## T-011 — Dashboard geral: alertas por severidade [pendente]

- Refs: US-004, AC-010
- Arquivos: src/app/(app)/dashboard/page.tsx, src/components/dashboard/alerts-summary.tsx
- Notas: Query na tabela alerts WHERE read_by NOT CONTAINS auth.uid(). Agrupar por severity. Renderizar cards/badges com contagem. Link para /alertas.

## T-012 — Detalhe do indicador (painel lateral) [pendente]

- Refs: US-005, AC-011
- Arquivos: src/components/indicators/detalhe-indicador.tsx
- Notas: Sheet ou Dialog shadcn. Busca detalhes do indicator (nome, código, unidade, método, responsável). Lista de indicator_entries ordenadas por month desc. Fechar com X ou ESC.

## T-013 — Testes dos critérios de aceite [pendente]

- Refs: US-001, US-002, US-003, US-004, US-005, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011
- Arquivos: test/indicadores-qualidade.spec.test.js
- Notas: Esqueleto gerado por scaffold. Cada AC vira teste anotado com @spec:AC-xxx. Usar Vitest. Testes de integração com mock do Supabase. Verificar: tabela renderiza, destaque vermelho, filtro período, lançamento salva, duplicado bloqueado, meta ausente avisa, gráficos renderizam, dashboard cards, alertas severity, detalhe mostra info.
