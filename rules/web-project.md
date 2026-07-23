# Regras Gerais para Projetos Web

Aplicar exclusivamente em projetos web (HTML, CSS, JS/TS, React, Next.js,
Node.js, APIs REST, Supabase/Postgres, Auth e segurança web).

## Regra de ouro

Antes de qualquer tarefa de código, verificar se ela se encaixa em fluxo de
feature/bugfix/refactor. Se sim, USAR a skill `tlc-spec-driven` (Specify →
Design → Tasks → Execute) com profundidade auto-ajustada à complexidade.
Nunca pular direto para implementação em tarefas Médias, Grandes ou Complexas.

## Regras não-negociáveis

1. Testes derivam da spec/critérios de aceite, nunca do código já escrito.
2. Nenhuma tarefa é "feita" sem o gate de testes passar.
3. Um commit atômico por tarefa — nunca agrupar tarefas.
4. Após a última tarefa, um Verificador independente roda automaticamente
   (autor ≠ verificador) — nunca pular essa etapa.
5. Cadeia de verificação de conhecimento antes de decidir algo técnico:
   código existente → docs do projeto → Context7/MCP → busca web → sinalizar
   incerteza (nunca inventar API/comportamento).
6. Antes de marcar tarefa de UI/frontend como concluída, sugerir rodar
   `$impeccable audit` e, se houver ajuste visual, `$impeccable polish`.
7. Toda página/componente web criado/alterado DEVE ser validado com o
   `chrome-devtools` MCP antes de considerar a task pronta: abrir a página,
   verificar erros de console, checar requisições de rede com falha (4xx/5xx)
   e tirar screenshot do resultado final.

## Skills de apoio

- `chrome-devtools`: validador padrão de toda entrega de UI (ver regra 7).
  Útil também para performance (Lighthouse) e inspeção de rede.
- `best-practices`: acionar quando a tarefa envolver revisão de segurança,
  modernização de código ou auditoria antes de um deploy (ver `DEPLOY.md`).
- Skills são chamadas pontualmente dentro de uma Task já existente.

## Resolução de conflitos

1. Hierarquia: instruções do usuário > AGENTS.md do projeto >
   AGENTS.md pai > rules/* > skills específicas > skills gerais.
2. Entre rules, a mais específica vence a mais geral.
3. Código e configuração reais do projeto prevalecem sobre documentação.
4. Nunca ignorar requisito explícito do usuário com base em skill ou regra.
