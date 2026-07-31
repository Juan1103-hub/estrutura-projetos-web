# Plano de execução — indicadores-qualidade

> gerado por `onp-spec plano` em 2026-07-31 11:24 — NÃO edite à mão;
> mudou tasks.md ou a config? Regenere: `onp-spec plano indicadores-qualidade`

## Resumo — o que vai acontecer

- **13 tarefa(s) pendente(s)**: 13 em 10 faixa(s) paralela(s) + 0 sequencial(is)
- **1 faixa = 1 worktree + 1 branch + 1 janela de contexto limpa** — faixas não compartilham nenhum arquivo entre si
- tudo acontece na branch de trabalho `spec/indicadores-qualidade`; mesclagens voltam para ela; levar para a main é decisão sua

## Faixas e ondas

### Onda 1 — faixa-1 ∥ faixa-2 ∥ faixa-3

#### faixa-1 — branch `spec/indicadores-qualidade-faixa-1` — worktree `../onp-worktrees/projetos-web-claude-indicadores-qualidade-faixa-1`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-001 | Server Action para buscar indicadores com metas | `claude-sonnet-5` | medium | `src/server/actions/indicators.ts`, `src/types/indicators.ts` |
| T-002 | Server Action para buscar entradas de indicadores (últimos 12 meses) | `claude-sonnet-5` | medium | `src/server/actions/indicators.ts` |
| T-004 | Server Action para lançamento de indicador | `claude-sonnet-5` | medium | `src/server/actions/indicators.ts` |

#### faixa-2 — branch `spec/indicadores-qualidade-faixa-2` — worktree `../onp-worktrees/projetos-web-claude-indicadores-qualidade-faixa-2`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-003 | Componente TabelaMensalIndicadores | `claude-sonnet-5` | medium | `src/components/indicators/tabela-mensal.tsx` |

#### faixa-3 — branch `spec/indicadores-qualidade-faixa-3` — worktree `../onp-worktrees/projetos-web-claude-indicadores-qualidade-faixa-3`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-005 | Modal/Formulário de lançamento | `claude-sonnet-5` | medium | `src/components/indicators/form-lancamento.tsx` |

### Onda 2 — faixa-4 ∥ faixa-5 ∥ faixa-6

#### faixa-4 — branch `spec/indicadores-qualidade-faixa-4` — worktree `../onp-worktrees/projetos-web-claude-indicadores-qualidade-faixa-4`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-006 | Componente GraficoLinhaIndicador | `claude-sonnet-5` | medium | `src/components/indicators/grafico-linha.tsx` |

#### faixa-5 — branch `spec/indicadores-qualidade-faixa-5` — worktree `../onp-worktrees/projetos-web-claude-indicadores-qualidade-faixa-5`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-007 | Componente GraficoBarraConsolidado | `claude-sonnet-5` | medium | `src/components/indicators/grafico-barra.tsx` |

#### faixa-6 — branch `spec/indicadores-qualidade-faixa-6` — worktree `../onp-worktrees/projetos-web-claude-indicadores-qualidade-faixa-6`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-008 | Página de indicadores do módulo (farmácia) | `claude-sonnet-5` | medium | `src/app/(app)/farmacia/indicadores/page.tsx` |

### Onda 3 — faixa-7 ∥ faixa-8 ∥ faixa-9

#### faixa-7 — branch `spec/indicadores-qualidade-faixa-7` — worktree `../onp-worktrees/projetos-web-claude-indicadores-qualidade-faixa-7`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-009 | Página de indicadores do módulo (laboratório) | `claude-sonnet-5` | medium | `src/app/(app)/laboratorio/indicadores/page.tsx` |

#### faixa-8 — branch `spec/indicadores-qualidade-faixa-8` — worktree `../onp-worktrees/projetos-web-claude-indicadores-qualidade-faixa-8`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-010 | Dashboard geral: cards de indicadores fora da meta | `claude-sonnet-5` | medium | `src/app/(app)/dashboard/page.tsx`, `src/components/dashboard/section-cards.tsx` |
| T-011 | Dashboard geral: alertas por severidade | `claude-sonnet-5` | medium | `src/app/(app)/dashboard/page.tsx`, `src/components/dashboard/alerts-summary.tsx` |

#### faixa-9 — branch `spec/indicadores-qualidade-faixa-9` — worktree `../onp-worktrees/projetos-web-claude-indicadores-qualidade-faixa-9`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-012 | Detalhe do indicador (painel lateral) | `claude-sonnet-5` | medium | `src/components/indicators/detalhe-indicador.tsx` |

### Onda 4 — faixa-10

#### faixa-10 — branch `spec/indicadores-qualidade-faixa-10` — worktree `../onp-worktrees/projetos-web-claude-indicadores-qualidade-faixa-10`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-013 | Testes dos critérios de aceite | `claude-sonnet-5` | medium | `test/indicadores-qualidade.spec.test.js` |

## Gestão de branches e commits

1. branch de trabalho `spec/indicadores-qualidade` criada do ponto atual (se ainda não existir)
2. cada faixa nasce dela como branch própria e roda no seu worktree — **1 tarefa = 1 commit** (`T-xxx feature: título`)
3. terminou a onda → merge `--no-ff` de cada faixa de volta, na ordem; conflito interrompe a faixa e pede resolução humana
4. faixa mesclada → worktree removido, branch apagada, tarefa marcada `[concluida]` no tasks.md
5. gate final na branch de trabalho: `onp-spec verify indicadores-qualidade` + `onp-spec audit --ci` — **exit 0 ou não está pronto**

## Como executar

### ▶ Automático — Claude Code headless (recomendado)

```bash
bash .spec/features/indicadores-qualidade/executar-tarefas.sh
```

Ou abra `.spec/features/indicadores-qualidade/plano-execucao.html` no navegador e use o botão
**“Executar todas as tarefas em janelas limpas e paralelas”** (copia o comando acima).

Cada faixa roda `claude -p` com **janela de contexto limpa**, `--model` e `--effort` já
definidos por tarefa, permissões `acceptEdits`. Os prompts exatos estão
embutidos no script — quer rodar uma faixa na mão, é só copiá-los de lá.
Logs: `../onp-worktrees/projetos-web-claude-indicadores-qualidade-logs/`.

### 👀 Acompanhe ao vivo, sem digitar comandos

```bash
onp-spec painel indicadores-qualidade
```

Abre um painel no navegador com as faixas em tempo real, o log de cada uma
rolando ao vivo, o veredito do gate — e o botão **"Executar todas as tarefas
em janelas limpas e paralelas"** que aqui executa DE VERDADE (o servidor é
local, então pode disparar o script por você).

