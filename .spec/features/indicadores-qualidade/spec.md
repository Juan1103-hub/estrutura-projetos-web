# Spec: Indicadores de Qualidade

> feature: indicadores-qualidade
> status: pronta

<!--
  Como ler este arquivo (o formato é verificado por `onp-spec audit`):
  - US-xxx = história de usuário · AC-xxx = critério de aceite
    ASM-xxx = suposição · Q-xxx = pergunta em aberto
    São códigos de rastreio: ligam a especificação às tarefas e aos testes.
  - Toda história de usuário precisa de pelo menos um critério de aceite.
  - Todo critério de aceite precisa de Dado/Quando/Então completos.
  - Os códigos são únicos no projeto inteiro (nunca reutilize um número).
  - Suposições e Perguntas em aberto são OBRIGATÓRIAS: se não há nenhuma,
    escreva "Nenhuma." — mas desconfie: quase toda feature esconde uma.
-->

## Contexto

Profissionais de farmácia e laboratório precisam visualizar e lançar indicadores de qualidade mensais (taxas, índices, percentuais) comparados a metas, identificando rapidamente quais estão fora da meta para ação corretiva. O dashboard consolidado permite à gestão ter visão geral dos dois módulos em um único lugar.

## Histórias

### US-001 — Visualizar indicadores do módulo (farmácia ou laboratório)

Como profissional do setor, quero ver os indicadores do meu mês atual comparados com a meta, para identificar imediatamente o que está fora do alvo.

#### AC-001 — Tabela mensal de indicadores exibe valores e metas

- **Dado** que existem indicadores cadastrados para o módulo do usuário (farmácia ou laboratório)
- **Quando** o usuário acessa a página de indicadores do seu módulo
- **Então** vê uma tabela com os indicadores, seus valores dos últimos 12 meses e a meta vigente de cada um

#### AC-002 — Indicadores fora da meta são destacados em vermelho

- **Dado** que um indicador tem valor abaixo da meta (quando o comparador é `>=`) ou acima da meta (quando o comparador é `<=`)
- **Quando** a tabela de indicadores é renderizada
- **Então** a célula desse indicador no mês correspondente aparece com destaque vermelho

#### AC-003 — Filtro por período permite mudar a janela de análise

- **Dado** que o usuário está na página de indicadores
- **Quando** ele seleciona um período diferente (ex.: trimestre, semestre, ano)
- **Então** a tabela e os gráficos atualizam para mostrar apenas o período selecionado

### US-002 — Lançar valor de indicador

Como profissional responsável, quero registrar o valor mensal de um indicador, para que ele seja comparado automaticamente com a meta.

#### AC-004 — Lançamento com valor e mês preenche a tabela

- **Dado** que o usuário está na página de indicadores do seu módulo
- **Quando** ele informa o indicador, o mês (YYYY-MM) e o valor numérico
- **Então** o valor é salvo e a célula correspondente na tabela é preenchida

#### AC-005 — Lançamento duplicado no mês é bloqueado

- **Dado** que já existe um valor lançado para aquele indicador naquele mês
- **Quando** o usuário tenta lançar um novo valor para o mesmo indicador e mês
- **Então** uma mensagem informa que o registro já existe e sugere retificação

#### AC-006 — Lançamento sem meta vigente exibe aviso

- **Dado** que não existe meta vigente (indicator_targets com valid_from ≤ mês) para o indicador
- **Quando** o usuário tenta lançar um valor
- **Então** o sistema exibe aviso de que não há meta definida e bloqueia o lançamento

### US-003 — Visualizar gráficos de tendência

Como gestor de qualidade, quero ver gráficos de linha e barra dos indicadores ao longo do tempo, para identificar tendências e padrões.

#### AC-007 — Gráfico de linha mostra evolução mensal do indicador

- **Dado** que existem pelo menos 2 meses de dados para um indicador
- **Quando** o usuário seleciona um indicador específico
- **Então** vê um gráfico de linha com a evolução mensal e a linha da meta como referência

#### AC-008 — Gráfico de barra compara indicadores do mesmo período

- **Dado** que existem indicadores com valores no mês selecionado
- **Quando** o usuário acessa a visão consolidada
- **Então** vê um gráfico de barra comparando os indicadores do período, com barras fora da meta destacadas

### US-004 — Visualizar dashboard consolidado de qualidade

Como gestor, quero ver um painel geral com os indicadores fora da meta dos dois módulos, para priorizar ações corretivas.

#### AC-009 — Dashboard exibe cards de indicadores fora da meta

- **Dado** que existem indicadores com valores fora da meta em farmácia e/ou laboratório
- **Quando** o usuário acessa o dashboard geral
- **Então** vê cards agrupados por módulo mostrando os indicadores fora da meta com seu valor e meta

#### AC-010 — Dashboard exibe alertas abertos por severidade

- **Dado** que existem alertas ativos (não lidos)
- **Quando** o usuário acessa o dashboard geral
- **Então** vê a contagem de alertas agrupados por severidade (crítico, alto, médio, baixo)

### US-005 — Acessar detalhe do indicador

Como profissional, quero clicar em um indicador para ver seus detalhes (histórico completo, responsável, unidade de medida), para entender o contexto antes de tomar uma ação.

#### AC-011 — Detalhe do indicador mostra informações complementares

- **Dado** que o usuário está na tabela de indicadores
- **Quando** ele clica em um indicador específico
- **Então** vê um painel ou modal com: nome completo, código, unidade de medida, método de aferição, responsável e histórico de valores

## Fora de escopo

- Cadastro e edição de indicadores (já existe via módulo admin/indicators)
- Cadastro e edição de metas (já existe via módulo admin/indicator_targets)
- Exportação de relatórios (feature separada)
- Indicadores extras de farmácia (feature separada: indicadores-extras)
- Alertas automáticos baseados em indicadores fora da meta (já implementado via trigger/cron)

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-001 | Os indicadores já estão cadastrados na tabela `indicators` com module = 'farmacia' ou 'laboratorio' | confirmada | Schema existente confirma |
| ASM-002 | As metas já estão cadastradas na tabela `indicator_targets` com target, comparator e valid_from | confirmada | Schema existente confirma |
| ASM-003 | O usuário autenticado tem role = 'farmacia', 'laboratorio' ou 'qualidade' que define seu módulo | confirmada | Schema existente confirma |
| ASM-004 | A tabela `indicator_entries` aceita UNIQUE(indicator_id, month) para evitar duplicatas | confirmada | Schema existente confirma |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-001 | O usuário com role 'qualidade' visualiza indicadores de ambos os módulos ou apenas um consolidado? | respondida | Sim — visualiza de ambos os módulos |
| Q-002 | O lançamento de indicador deve ser feito apenas pelo profissional do setor ou um admin de qualidade também pode lançar para qualquer módulo? | respondida | Sim — admin de qualidade pode lançar para qualquer módulo |
