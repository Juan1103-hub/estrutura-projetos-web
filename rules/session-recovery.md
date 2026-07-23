# Recuperação de Sessão

Regra curta referenciada pelo `AGENTS.md` (seção 10). Aplicar após
falha de streaming, compactação, mudança de modelo, contexto
insuficiente, erro de sessão, ou sempre que o usuário disser apenas
"continue" após uma lacuna perceptível no histórico.

---

## Regra principal

Se ocorrer qualquer evento que comprometa a continuidade do contexto,
**interromper a execução** antes de agir. Não continuar como se nada
tivesse acontecido.

## Antes de retomar

1. Confirmar o diretório de trabalho e qual é a feature ativa.
2. Ler, na ordem: `AGENTS.md` → `memory.md` → `.specs/STATE.md` →
   artefatos persistidos da feature ativa (`spec.md`, `tasks.md`,
   `tech-decisions.md`, `validation.md`, conforme existirem).
3. Comparar o estado persistido com a tarefa que está sendo retomada —
   a tarefa faz sentido dado o que está documentado?
4. Retomar somente a partir de fatos verificáveis nos arquivos.

## Proibições

- É proibido inventar arquivos, etapas concluídas, checkpoints,
  ferramentas, testes, validações ou contexto de outro projeto.
- É proibido misturar informações de uma sessão/projeto diferente com a
  feature ativa atual.
- Se o estado não puder ser recuperado a partir dos arquivos, **não
  assumir** — explicar exatamente o que falta e fazer uma única
  pergunta objetiva ao usuário.

## Sobre o comando "continue"

"Continue" autoriza somente continuar a feature e a tarefa **já
verificadas no estado persistido**. Não autoriza:

- Trocar de projeto ou de escopo.
- Assumir que uma tarefa foi concluída sem evidência (commit, teste
  passando, arquivo criado).
- Avançar para a próxima fase do `tlc-spec-driven` sem confirmar que a
  fase anterior está de fato registrada em `.specs/STATE.md`.

## Sinal de alerta

Se a resposta gerada após retomar menciona arquivos, tarefas ou
decisões que não aparecem em `.specs/STATE.md` nem nos artefatos da
feature, tratar como possível alucinação de contexto: parar, reler os
arquivos reais, e corrigir antes de prosseguir.
