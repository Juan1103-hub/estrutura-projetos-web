#!/usr/bin/env bash
# executar-tarefas.sh — gerado por `onp-spec plano indicadores-qualidade` em 2026-07-31 11:24
# NÃO edite à mão: mudou tasks.md ou a config, regenere o plano.
#
# uso:
#   bash executar-tarefas.sh                  tudo (ondas → sequenciais → gate)
#   bash executar-tarefas.sh --faixa <id>     reexecuta UMA faixa (+ merge + gate)
#   bash executar-tarefas.sh --seq <T-xxx>    reexecuta UMA tarefa sequencial
#   bash executar-tarefas.sh --gate           só o gate (verify + audit)
#   bash executar-tarefas.sh --listar         mostra faixas, tarefas e estados
#   (acrescente --sem-gate para não rodar o gate ao final)
#
# acompanhe ao vivo: onp-spec painel indicadores-qualidade
set -u
set -o pipefail

RUN_ID='projetos-web-claude-indicadores-qualidade-ms8uuc9r'
FEATURE='indicadores-qualidade'
BASE_BRANCH='spec/indicadores-qualidade'
ENGINE='.claude/skills/onp-spec-driven/scripts/onp-spec.mjs'
CLAUDE_FLAGS=(--permission-mode acceptEdits --allowedTools 'Bash(git add:*),Bash(git commit:*),Bash(git status:*),Bash(git diff:*),Bash(git log:*)')
STREAM_FLAGS=(--output-format stream-json --verbose)
FALHAS=""
COM_GATE=1

verde()    { printf '\033[32m%s\033[0m\n' "$*"; }
vermelho() { printf '\033[31m%s\033[0m\n' "$*"; }
amarelo()  { printf '\033[33m%s\033[0m\n' "$*"; }
info()     { printf '· %s\n' "$*"; }
falhar()   { vermelho "✘ $*"; exit 1; }

# eventos vão para o ledger GLOBAL (~/.onp-spec/painel/ledger.jsonl):
# um arquivo para todos os projetos, é o que o painel lê
evento() { node "$ENGINE" evento --run "$RUN_ID" "$@" >/dev/null 2>&1 || true; }

# ── ambiente (todos os modos passam por aqui) ────────────────────────
preparar_ambiente() {
  command -v git >/dev/null 2>&1 || falhar "git não encontrado"
  command -v node >/dev/null 2>&1 || falhar "node não encontrado"
  command -v claude >/dev/null 2>&1 || falhar "Claude Code CLI (claude) não encontrado — instale-o ou siga o modo manual em plano-execucao.md"
  TOPLEVEL=$(git rev-parse --show-toplevel 2>/dev/null) || falhar "fora de um repositório git"
  cd "$TOPLEVEL" || exit 1
  # artefatos recém-gerados pelo `onp-spec plano` são sujeira esperada:
  # se forem a ÚNICA sujeira, o script mesmo commita; qualquer outra, aborta
  if [ -n "$(git status --porcelain)" ]; then
    if [ -z "$(git status --porcelain | grep -v -e 'plano-execucao\.' -e 'plano\.json' -e 'executar-tarefas\.sh')" ]; then
      git add -A
      git commit -q -m "plano de execução: $FEATURE (artefatos gerados)"
      info "artefatos do plano commitados"
    else
      falhar "árvore suja além dos artefatos do plano — commite ou faça git stash antes (os worktrees partem do último commit)"
    fi
  fi
  git ls-files --error-unmatch -- '.spec/features/indicadores-qualidade/spec.md' >/dev/null 2>&1 || falhar "spec.md não está commitada — os worktrees das faixas precisam dela no git"
  ATUAL=$(git rev-parse --abbrev-ref HEAD)
  [ "$ATUAL" != "HEAD" ] || falhar "HEAD destacado — troque para uma branch"
  if [ "$ATUAL" != "$BASE_BRANCH" ]; then
    if git show-ref --verify --quiet "refs/heads/$BASE_BRANCH"; then
      git checkout -q "$BASE_BRANCH" || falhar "não consegui trocar para $BASE_BRANCH"
    else
      git checkout -q -b "$BASE_BRANCH" || falhar "não consegui criar $BASE_BRANCH"
    fi
    info "branch de trabalho: $BASE_BRANCH (a partir de $ATUAL)"
  fi
  git worktree prune
  LOG_DIR="$(dirname "$TOPLEVEL")/onp-worktrees/projetos-web-claude-indicadores-qualidade-logs"
  WT_BASE="$(dirname "$TOPLEVEL")/onp-worktrees/projetos-web-claude-indicadores-qualidade"
  STREAMS_DIR="${ONP_SPEC_HOME:-$HOME/.onp-spec}/painel/streams/$RUN_ID"
  mkdir -p "$LOG_DIR" "$STREAMS_DIR"
}

# worktree limpo mesmo depois de uma tentativa que falhou
preparar_worktree() { # $1=faixa $2=branch $3=worktree
  git worktree prune
  if [ -e "$3" ]; then git worktree remove --force "$3" >/dev/null 2>&1; rm -rf "$3"; fi
  if git show-ref --verify --quiet "refs/heads/$2"; then git branch -D "$2" >/dev/null 2>&1; fi
  git worktree add "$3" -b "$2" >/dev/null 2>&1 || { vermelho "✘ não consegui criar o worktree de $1 em $3"; return 1; }
}

tentativa() { # $1=faixa — conta reexecuções para o painel mostrar
  local arq="$LOG_DIR/.tentativa-$1"
  local n=1
  [ -f "$arq" ] && n=$(( $(cat "$arq") + 1 ))
  printf "%s" "$n" > "$arq"
  printf "%s" "$n"
}

# uma tarefa = uma sessão claude headless com contexto limpo.
# o NDJSON do stream-json vira o stream da tarefa (o painel mostra ao vivo)
rodar_tarefa() { # $1=escopo(faixa|seq) $2=T-xxx $3=prompt $4=modelo $5=esforço
  local chave="$1--$2"
  local stream="$STREAMS_DIR/$chave.jsonl"
  evento --tipo tarefa --tarefa "$2" --faixa "$1" --estado executando --stream "$chave"
  info "$2 — claude -p ($4 · $5) · stream: $chave"
  if claude -p "$3" --model "$4" --effort "$5" "${STREAM_FLAGS[@]}" "${CLAUDE_FLAGS[@]}" > "$stream" 2>>"$LOG_DIR/$1.log"; then
    evento --tipo tarefa --tarefa "$2" --faixa "$1" --estado concluida --stream "$chave"
    node "$ENGINE" stream-resumo "$RUN_ID" "$chave" 2>/dev/null || true
    return 0
  fi
  evento --tipo tarefa --tarefa "$2" --faixa "$1" --estado falhou --stream "$chave"
  node "$ENGINE" stream-resumo "$RUN_ID" "$chave" 2>/dev/null || true
  return 1
}

mesclar_faixa() { # $1=faixa $2=branch $3=worktree $4=exit-da-faixa
  if [ "$4" -ne 0 ]; then
    evento --tipo faixa --faixa "$1" --estado falhou
    vermelho "✘ $1 falhou (log: $LOG_DIR/$1.log) — worktree mantido para inspeção: $3"
    amarelo "  reexecute só ela: bash .spec/features/indicadores-qualidade/executar-tarefas.sh --faixa $1"
    FALHAS="$FALHAS $1"; return 1
  fi
  evento --tipo faixa --faixa "$1" --estado mesclando
  if git merge --no-ff "$2" -m "merge $1 ($FEATURE)"; then
    git worktree remove --force "$3" >/dev/null 2>&1
    git branch -d "$2" >/dev/null 2>&1
    evento --tipo faixa --faixa "$1" --estado mesclada
    verde "✔ $1 mesclada em $BASE_BRANCH"
  else
    git merge --abort >/dev/null 2>&1
    evento --tipo faixa --faixa "$1" --estado conflito
    vermelho "✘ conflito ao mesclar $1 — resolva na mão: git merge $2 (worktree mantido: $3)"
    FALHAS="$FALHAS $1"; return 1
  fi
}

marcar_concluidas() { # $@=T-xxx
  for t in "$@"; do node "$ENGINE" tarefa "$FEATURE" "$t" concluida >/dev/null || true; done
}

# ── faixa-1: T-001 T-002 T-004 ──
executar_faixa_1() {
  local WT="$WT_BASE-faixa-1"
  preparar_worktree 'faixa-1' 'spec/indicadores-qualidade-faixa-1' "$WT" || return 1
  evento --tipo faixa --faixa 'faixa-1' --estado executando --tentativa "$(tentativa 'faixa-1')"
  : > "$LOG_DIR/faixa-1.log"
  (
    cd "$WT" || exit 9
    rodar_tarefa 'faixa-1' 'T-001' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-001 — "Server Action para buscar indicadores com metas"
  critérios/refs: AC-001 (Tabela mensal de indicadores exibe valores e metas)
  arquivos permitidos (e seus testes): src/server/actions/indicators.ts, src/types/indicators.ts
  mensagem de commit: "T-001 indicadores-qualidade: Server Action para buscar indicadores com metas"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium &&
    rodar_tarefa 'faixa-1' 'T-002' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-002 — "Server Action para buscar entradas de indicadores (últimos 12 meses)"
  critérios/refs: AC-001 (Tabela mensal de indicadores exibe valores e metas), AC-002 (Indicadores fora da meta são destacados em vermelho)
  arquivos permitidos (e seus testes): src/server/actions/indicators.ts
  mensagem de commit: "T-002 indicadores-qualidade: Server Action para buscar entradas de indicadores (últimos 12 meses)"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium &&
    rodar_tarefa 'faixa-1' 'T-004' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-004 — "Server Action para lançamento de indicador"
  critérios/refs: AC-004 (Lançamento com valor e mês preenche a tabela), AC-005 (Lançamento duplicado no mês é bloqueado), AC-006 (Lançamento sem meta vigente exibe aviso)
  arquivos permitidos (e seus testes): src/server/actions/indicators.ts
  mensagem de commit: "T-004 indicadores-qualidade: Server Action para lançamento de indicador"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium
  ) >> "$LOG_DIR/faixa-1.log" 2>&1
  local st=$?
  mesclar_faixa 'faixa-1' 'spec/indicadores-qualidade-faixa-1' "$WT" "$st" || return 1
  marcar_concluidas T-001 T-002 T-004
  return 0
}

# ── faixa-2: T-003 ──
executar_faixa_2() {
  local WT="$WT_BASE-faixa-2"
  preparar_worktree 'faixa-2' 'spec/indicadores-qualidade-faixa-2' "$WT" || return 1
  evento --tipo faixa --faixa 'faixa-2' --estado executando --tentativa "$(tentativa 'faixa-2')"
  : > "$LOG_DIR/faixa-2.log"
  (
    cd "$WT" || exit 9
    rodar_tarefa 'faixa-2' 'T-003' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-003 — "Componente TabelaMensalIndicadores"
  critérios/refs: AC-001 (Tabela mensal de indicadores exibe valores e metas), AC-002 (Indicadores fora da meta são destacados em vermelho)
  arquivos permitidos (e seus testes): src/components/indicators/tabela-mensal.tsx
  mensagem de commit: "T-003 indicadores-qualidade: Componente TabelaMensalIndicadores"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium
  ) >> "$LOG_DIR/faixa-2.log" 2>&1
  local st=$?
  mesclar_faixa 'faixa-2' 'spec/indicadores-qualidade-faixa-2' "$WT" "$st" || return 1
  marcar_concluidas T-003
  return 0
}

# ── faixa-3: T-005 ──
executar_faixa_3() {
  local WT="$WT_BASE-faixa-3"
  preparar_worktree 'faixa-3' 'spec/indicadores-qualidade-faixa-3' "$WT" || return 1
  evento --tipo faixa --faixa 'faixa-3' --estado executando --tentativa "$(tentativa 'faixa-3')"
  : > "$LOG_DIR/faixa-3.log"
  (
    cd "$WT" || exit 9
    rodar_tarefa 'faixa-3' 'T-005' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-005 — "Modal/Formulário de lançamento"
  critérios/refs: AC-004 (Lançamento com valor e mês preenche a tabela), AC-005 (Lançamento duplicado no mês é bloqueado), AC-006 (Lançamento sem meta vigente exibe aviso)
  arquivos permitidos (e seus testes): src/components/indicators/form-lancamento.tsx
  mensagem de commit: "T-005 indicadores-qualidade: Modal/Formulário de lançamento"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium
  ) >> "$LOG_DIR/faixa-3.log" 2>&1
  local st=$?
  mesclar_faixa 'faixa-3' 'spec/indicadores-qualidade-faixa-3' "$WT" "$st" || return 1
  marcar_concluidas T-005
  return 0
}

# ── faixa-4: T-006 ──
executar_faixa_4() {
  local WT="$WT_BASE-faixa-4"
  preparar_worktree 'faixa-4' 'spec/indicadores-qualidade-faixa-4' "$WT" || return 1
  evento --tipo faixa --faixa 'faixa-4' --estado executando --tentativa "$(tentativa 'faixa-4')"
  : > "$LOG_DIR/faixa-4.log"
  (
    cd "$WT" || exit 9
    rodar_tarefa 'faixa-4' 'T-006' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-006 — "Componente GraficoLinhaIndicador"
  critérios/refs: AC-007 (Gráfico de linha mostra evolução mensal do indicador)
  arquivos permitidos (e seus testes): src/components/indicators/grafico-linha.tsx
  mensagem de commit: "T-006 indicadores-qualidade: Componente GraficoLinhaIndicador"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium
  ) >> "$LOG_DIR/faixa-4.log" 2>&1
  local st=$?
  mesclar_faixa 'faixa-4' 'spec/indicadores-qualidade-faixa-4' "$WT" "$st" || return 1
  marcar_concluidas T-006
  return 0
}

# ── faixa-5: T-007 ──
executar_faixa_5() {
  local WT="$WT_BASE-faixa-5"
  preparar_worktree 'faixa-5' 'spec/indicadores-qualidade-faixa-5' "$WT" || return 1
  evento --tipo faixa --faixa 'faixa-5' --estado executando --tentativa "$(tentativa 'faixa-5')"
  : > "$LOG_DIR/faixa-5.log"
  (
    cd "$WT" || exit 9
    rodar_tarefa 'faixa-5' 'T-007' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-007 — "Componente GraficoBarraConsolidado"
  critérios/refs: AC-008 (Gráfico de barra compara indicadores do mesmo período)
  arquivos permitidos (e seus testes): src/components/indicators/grafico-barra.tsx
  mensagem de commit: "T-007 indicadores-qualidade: Componente GraficoBarraConsolidado"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium
  ) >> "$LOG_DIR/faixa-5.log" 2>&1
  local st=$?
  mesclar_faixa 'faixa-5' 'spec/indicadores-qualidade-faixa-5' "$WT" "$st" || return 1
  marcar_concluidas T-007
  return 0
}

# ── faixa-6: T-008 ──
executar_faixa_6() {
  local WT="$WT_BASE-faixa-6"
  preparar_worktree 'faixa-6' 'spec/indicadores-qualidade-faixa-6' "$WT" || return 1
  evento --tipo faixa --faixa 'faixa-6' --estado executando --tentativa "$(tentativa 'faixa-6')"
  : > "$LOG_DIR/faixa-6.log"
  (
    cd "$WT" || exit 9
    rodar_tarefa 'faixa-6' 'T-008' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-008 — "Página de indicadores do módulo (farmácia)"
  critérios/refs: AC-001 (Tabela mensal de indicadores exibe valores e metas), AC-002 (Indicadores fora da meta são destacados em vermelho), AC-003 (Filtro por período permite mudar a janela de análise), AC-004 (Lançamento com valor e mês preenche a tabela), AC-005 (Lançamento duplicado no mês é bloqueado), AC-006 (Lançamento sem meta vigente exibe aviso), AC-007 (Gráfico de linha mostra evolução mensal do indicador), AC-008 (Gráfico de barra compara indicadores do mesmo período)
  arquivos permitidos (e seus testes): src/app/(app)/farmacia/indicadores/page.tsx
  mensagem de commit: "T-008 indicadores-qualidade: Página de indicadores do módulo (farmácia)"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium
  ) >> "$LOG_DIR/faixa-6.log" 2>&1
  local st=$?
  mesclar_faixa 'faixa-6' 'spec/indicadores-qualidade-faixa-6' "$WT" "$st" || return 1
  marcar_concluidas T-008
  return 0
}

# ── faixa-7: T-009 ──
executar_faixa_7() {
  local WT="$WT_BASE-faixa-7"
  preparar_worktree 'faixa-7' 'spec/indicadores-qualidade-faixa-7' "$WT" || return 1
  evento --tipo faixa --faixa 'faixa-7' --estado executando --tentativa "$(tentativa 'faixa-7')"
  : > "$LOG_DIR/faixa-7.log"
  (
    cd "$WT" || exit 9
    rodar_tarefa 'faixa-7' 'T-009' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-009 — "Página de indicadores do módulo (laboratório)"
  critérios/refs: AC-001 (Tabela mensal de indicadores exibe valores e metas), AC-002 (Indicadores fora da meta são destacados em vermelho), AC-003 (Filtro por período permite mudar a janela de análise), AC-004 (Lançamento com valor e mês preenche a tabela), AC-005 (Lançamento duplicado no mês é bloqueado), AC-006 (Lançamento sem meta vigente exibe aviso), AC-007 (Gráfico de linha mostra evolução mensal do indicador), AC-008 (Gráfico de barra compara indicadores do mesmo período)
  arquivos permitidos (e seus testes): src/app/(app)/laboratorio/indicadores/page.tsx
  mensagem de commit: "T-009 indicadores-qualidade: Página de indicadores do módulo (laboratório)"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium
  ) >> "$LOG_DIR/faixa-7.log" 2>&1
  local st=$?
  mesclar_faixa 'faixa-7' 'spec/indicadores-qualidade-faixa-7' "$WT" "$st" || return 1
  marcar_concluidas T-009
  return 0
}

# ── faixa-8: T-010 T-011 ──
executar_faixa_8() {
  local WT="$WT_BASE-faixa-8"
  preparar_worktree 'faixa-8' 'spec/indicadores-qualidade-faixa-8' "$WT" || return 1
  evento --tipo faixa --faixa 'faixa-8' --estado executando --tentativa "$(tentativa 'faixa-8')"
  : > "$LOG_DIR/faixa-8.log"
  (
    cd "$WT" || exit 9
    rodar_tarefa 'faixa-8' 'T-010' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-010 — "Dashboard geral: cards de indicadores fora da meta"
  critérios/refs: AC-009 (Dashboard exibe cards de indicadores fora da meta)
  arquivos permitidos (e seus testes): src/app/(app)/dashboard/page.tsx, src/components/dashboard/section-cards.tsx
  mensagem de commit: "T-010 indicadores-qualidade: Dashboard geral: cards de indicadores fora da meta"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium &&
    rodar_tarefa 'faixa-8' 'T-011' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-011 — "Dashboard geral: alertas por severidade"
  critérios/refs: AC-010 (Dashboard exibe alertas abertos por severidade)
  arquivos permitidos (e seus testes): src/app/(app)/dashboard/page.tsx, src/components/dashboard/alerts-summary.tsx
  mensagem de commit: "T-011 indicadores-qualidade: Dashboard geral: alertas por severidade"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium
  ) >> "$LOG_DIR/faixa-8.log" 2>&1
  local st=$?
  mesclar_faixa 'faixa-8' 'spec/indicadores-qualidade-faixa-8' "$WT" "$st" || return 1
  marcar_concluidas T-010 T-011
  return 0
}

# ── faixa-9: T-012 ──
executar_faixa_9() {
  local WT="$WT_BASE-faixa-9"
  preparar_worktree 'faixa-9' 'spec/indicadores-qualidade-faixa-9' "$WT" || return 1
  evento --tipo faixa --faixa 'faixa-9' --estado executando --tentativa "$(tentativa 'faixa-9')"
  : > "$LOG_DIR/faixa-9.log"
  (
    cd "$WT" || exit 9
    rodar_tarefa 'faixa-9' 'T-012' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-012 — "Detalhe do indicador (painel lateral)"
  critérios/refs: AC-011 (Detalhe do indicador mostra informações complementares)
  arquivos permitidos (e seus testes): src/components/indicators/detalhe-indicador.tsx
  mensagem de commit: "T-012 indicadores-qualidade: Detalhe do indicador (painel lateral)"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium
  ) >> "$LOG_DIR/faixa-9.log" 2>&1
  local st=$?
  mesclar_faixa 'faixa-9' 'spec/indicadores-qualidade-faixa-9' "$WT" "$st" || return 1
  marcar_concluidas T-012
  return 0
}

# ── faixa-10: T-013 ──
executar_faixa_10() {
  local WT="$WT_BASE-faixa-10"
  preparar_worktree 'faixa-10' 'spec/indicadores-qualidade-faixa-10' "$WT" || return 1
  evento --tipo faixa --faixa 'faixa-10' --estado executando --tentativa "$(tentativa 'faixa-10')"
  : > "$LOG_DIR/faixa-10.log"
  (
    cd "$WT" || exit 9
    rodar_tarefa 'faixa-10' 'T-013' 'Você executa UMA tarefa da feature "indicadores-qualidade" (fluxo onp-spec, spec-anchored).
Leia primeiro: .spec/features/indicadores-qualidade/spec.md, .spec/features/indicadores-qualidade/tasks.md e .spec/constituicao.md.

Sua tarefa (somente ela):
T-013 — "Testes dos critérios de aceite"
  critérios/refs: AC-001 (Tabela mensal de indicadores exibe valores e metas), AC-002 (Indicadores fora da meta são destacados em vermelho), AC-003 (Filtro por período permite mudar a janela de análise), AC-004 (Lançamento com valor e mês preenche a tabela), AC-005 (Lançamento duplicado no mês é bloqueado), AC-006 (Lançamento sem meta vigente exibe aviso), AC-007 (Gráfico de linha mostra evolução mensal do indicador), AC-008 (Gráfico de barra compara indicadores do mesmo período), AC-009 (Dashboard exibe cards de indicadores fora da meta), AC-010 (Dashboard exibe alertas abertos por severidade), AC-011 (Detalhe do indicador mostra informações complementares)
  arquivos permitidos (e seus testes): test/indicadores-qualidade.spec.test.js
  mensagem de commit: "T-013 indicadores-qualidade: Testes dos critérios de aceite"

Regras inegociáveis:
- Todo critério de aceite referenciado vira teste com @spec:AC-xxx no título.
- NUNCA enfraqueça, pule (skip/todo) ou apague um teste para passar — teste pulado não é prova e o audit acusa.
- Rode os testes do projeto localmente até passarem.
- NÃO edite tasks.md, NÃO rode onp-spec verify/audit e NÃO toque em outras tarefas — o orquestrador cuida disso.
- Ao final de CADA tarefa: `git add` só no que você tocou e um commit próprio.' 'claude-sonnet-5' medium
  ) >> "$LOG_DIR/faixa-10.log" 2>&1
  local st=$?
  mesclar_faixa 'faixa-10' 'spec/indicadores-qualidade-faixa-10' "$WT" "$st" || return 1
  marcar_concluidas T-013
  return 0
}

# ── gate: quem decide é a máquina ────────────────────────────────────
rodar_gate() {
  echo
  info "gate: verify + audit --ci"
  evento --tipo gate --etapa inicio
  node "$ENGINE" verify "$FEATURE"
  local v=$?
  evento --tipo gate --etapa verify --exit "$v"
  node "$ENGINE" audit --ci
  AUDIT=$?
  evento --tipo gate --etapa audit --exit "$AUDIT"
  # fecha a contabilidade: status das tarefas + prova do verify no git
  if [ -n "$(git status --porcelain -- '.spec')" ]; then
    git add -A -- '.spec'
    git commit -q -m "$FEATURE: status das tarefas + prova do verify (plano)"
    info "status das tarefas e prova do verify commitados"
  fi
  return "$AUDIT"
}

encerrar() { # $1=escopo
  echo
  if [ -n "$FALHAS" ]; then vermelho "faixas/tarefas com falha:$FALHAS"; fi
  # sem gate não existe veredito: NUNCA anunciar alinhamento sem o audit
  if [ "$COM_GATE" -eq 0 ]; then
    evento --tipo fim --exit 1 --escopo "$1"
    if [ -z "$FALHAS" ]; then
      amarelo "○ trabalho de '$1' terminou SEM o gate (--sem-gate) — isto NÃO é prova de nada"
      amarelo "  para o veredito: bash .spec/features/indicadores-qualidade/executar-tarefas.sh --gate"
      exit 0
    fi
    vermelho "e ainda há falhas — conserte e rode o gate"
    exit 1
  fi
  rodar_gate
  local audit=$?
  if [ "$audit" -eq 0 ] && [ -z "$FALHAS" ]; then
    evento --tipo fim --exit 0 --escopo "$1"
    verde "✔ plano concluído — especificação e código alinhados (audit exit 0) na branch $BASE_BRANCH"
    info "próximo passo: revise e leve para a main quando quiser (git merge $BASE_BRANCH)"
    exit 0
  fi
  evento --tipo fim --exit 1 --escopo "$1"
  vermelho "plano terminou com pendências — leia a saída do audit acima e os logs em $LOG_DIR"
  amarelo "dica: reexecute só o que falhou (--faixa <id> / --seq <T-xxx>) e acompanhe em: onp-spec painel indicadores-qualidade"
  exit 1
}

executar_tudo() {
  evento --tipo inicio --escopo tudo
  info "logs por faixa em: $LOG_DIR"
  info "acompanhe ao vivo: onp-spec painel indicadores-qualidade"
  # onda 1: faixa-1 ∥ faixa-2 ∥ faixa-3
  info "onda 1: faixa-1 ∥ faixa-2 ∥ faixa-3 — janelas limpas em paralelo"
  executar_faixa_1 & PID_FAIXA_1=$!
  executar_faixa_2 & PID_FAIXA_2=$!
  executar_faixa_3 & PID_FAIXA_3=$!
  wait "$PID_FAIXA_1" || true
  wait "$PID_FAIXA_2" || true
  wait "$PID_FAIXA_3" || true
  # onda 2: faixa-4 ∥ faixa-5 ∥ faixa-6
  info "onda 2: faixa-4 ∥ faixa-5 ∥ faixa-6 — janelas limpas em paralelo"
  executar_faixa_4 & PID_FAIXA_4=$!
  executar_faixa_5 & PID_FAIXA_5=$!
  executar_faixa_6 & PID_FAIXA_6=$!
  wait "$PID_FAIXA_4" || true
  wait "$PID_FAIXA_5" || true
  wait "$PID_FAIXA_6" || true
  # onda 3: faixa-7 ∥ faixa-8 ∥ faixa-9
  info "onda 3: faixa-7 ∥ faixa-8 ∥ faixa-9 — janelas limpas em paralelo"
  executar_faixa_7 & PID_FAIXA_7=$!
  executar_faixa_8 & PID_FAIXA_8=$!
  executar_faixa_9 & PID_FAIXA_9=$!
  wait "$PID_FAIXA_7" || true
  wait "$PID_FAIXA_8" || true
  wait "$PID_FAIXA_9" || true
  # onda 4: faixa-10
  info "onda 4: faixa-10 — janelas limpas em paralelo"
  executar_faixa_10 & PID_FAIXA_10=$!
  wait "$PID_FAIXA_10" || true
  encerrar tudo
}

listar() {
  echo "execução: $RUN_ID (feature $FEATURE, branch $BASE_BRANCH)"
  echo "  faixa-1  onda 1  T-001, T-002, T-004"
  echo "  faixa-2  onda 1  T-003"
  echo "  faixa-3  onda 1  T-005"
  echo "  faixa-4  onda 2  T-006"
  echo "  faixa-5  onda 2  T-007"
  echo "  faixa-6  onda 2  T-008"
  echo "  faixa-7  onda 3  T-009"
  echo "  faixa-8  onda 3  T-010, T-011"
  echo "  faixa-9  onda 3  T-012"
  echo "  faixa-10  onda 4  T-013"
  echo
  echo "reexecutar uma faixa:    --faixa <id>"
  echo "reexecutar sequencial:   --seq <T-xxx>"
  echo "só o gate:               --gate"
}

MODO="tudo"
ALVO=""
while [ $# -gt 0 ]; do
  case "$1" in
    --listar) MODO="listar" ;;
    --gate) MODO="gate" ;;
    --sem-gate) COM_GATE=0 ;;
    --faixa) MODO="faixa"; ALVO="${2:-}"; shift ;;
    --seq) MODO="seq"; ALVO="${2:-}"; shift ;;
    -h|--help) sed -n "2,14p" "$0"; exit 0 ;;
    *) vermelho "argumento desconhecido: $1"; sed -n "2,14p" "$0"; exit 2 ;;
  esac
  shift
done

if [ "$MODO" = "listar" ]; then listar; exit 0; fi

preparar_ambiente

case "$MODO" in
  tudo) executar_tudo ;;
  gate) COM_GATE=1; encerrar gate ;;
  faixa)
    case "$ALVO" in
      faixa-1) evento --tipo inicio --escopo "faixa:faixa-1"; executar_faixa_1 || true; encerrar "faixa:faixa-1" ;;
      faixa-2) evento --tipo inicio --escopo "faixa:faixa-2"; executar_faixa_2 || true; encerrar "faixa:faixa-2" ;;
      faixa-3) evento --tipo inicio --escopo "faixa:faixa-3"; executar_faixa_3 || true; encerrar "faixa:faixa-3" ;;
      faixa-4) evento --tipo inicio --escopo "faixa:faixa-4"; executar_faixa_4 || true; encerrar "faixa:faixa-4" ;;
      faixa-5) evento --tipo inicio --escopo "faixa:faixa-5"; executar_faixa_5 || true; encerrar "faixa:faixa-5" ;;
      faixa-6) evento --tipo inicio --escopo "faixa:faixa-6"; executar_faixa_6 || true; encerrar "faixa:faixa-6" ;;
      faixa-7) evento --tipo inicio --escopo "faixa:faixa-7"; executar_faixa_7 || true; encerrar "faixa:faixa-7" ;;
      faixa-8) evento --tipo inicio --escopo "faixa:faixa-8"; executar_faixa_8 || true; encerrar "faixa:faixa-8" ;;
      faixa-9) evento --tipo inicio --escopo "faixa:faixa-9"; executar_faixa_9 || true; encerrar "faixa:faixa-9" ;;
      faixa-10) evento --tipo inicio --escopo "faixa:faixa-10"; executar_faixa_10 || true; encerrar "faixa:faixa-10" ;;
      *) falhar "faixa desconhecida: '$ALVO' — veja as disponíveis com --listar" ;;
    esac ;;
  seq)
    case "$ALVO" in
      *) falhar "tarefa sequencial desconhecida: '$ALVO' — veja as disponíveis com --listar" ;;
    esac ;;
esac
