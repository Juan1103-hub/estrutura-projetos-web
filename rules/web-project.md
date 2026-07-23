# Regras para Projetos Web

Estas regras se aplicam exclusivamente a projetos web, incluindo:

- HTML, CSS, JavaScript, TypeScript
- React, Next.js, Node.js, NestJS
- APIs REST, Prisma, SQL e bancos de dados
- Autenticação, autorização e segurança web
- Testes e code review web

Estas regras **não** se aplicam a projetos ADVPL, TLPP, Protheus, APSDU, pontos de entrada ou rotinas TOTVS.

---

## Regra de ouro

Antes de qualquer tarefa de código, verifique se ela se encaixa em um fluxo de
feature/bugfix/refactor. Se sim, USE a skill `tlc-spec-driven` (Specify → Design →
Tasks → Execute) com profundidade auto-ajustada à complexidade. Nunca pule direto
para implementação em tarefas Médias, Grandes ou Complexas.

## Regras não-negociáveis

1. Testes derivam da spec/critérios de aceite, nunca do código já escrito.
2. Nenhuma tarefa é "feita" sem o gate de testes passar.
3. Um commit atômico por tarefa — nunca agrupe tarefas.
4. Após a última tarefa, um Verificador independente roda automaticamente
   (autor ≠ verificador) — nunca pule essa etapa.
5. Cadeia de verificação de conhecimento antes de decidir algo técnico:
   código existente → docs do projeto → Context7/MCP → busca web → sinalizar
   incerteza (nunca inventar API/comportamento).
6. Antes de marcar qualquer tarefa de UI/frontend como concluída, sugerir rodar
   `$impeccable audit` e, se houver ajuste visual, `$impeccable polish`.
7. Toda página ou componente web criado/alterado DEVE ser validado com o
   `chrome-devtools` MCP antes de considerar a tarefa pronta: abrir a página,
   verificar erros de console, checar requisições de rede com falha (4xx/5xx)
   e tirar screenshot do resultado final.

## Skills de apoio

- `chrome-devtools`: validador padrão de toda entrega de UI (ver regra 7).
  Também útil para performance (Lighthouse) e inspeção de rede.
- `best-practices`: acionar quando a tarefa envolver revisão de segurança,
  modernização de código ou auditoria antes de um deploy (ver DEPLOY.md).
- Essas skills são chamadas pontualmente dentro de uma Task já existente.

## Escopo e idioma

- Responda e documente em português (PT-BR).
- Código e nomes técnicos em inglês quando for convenção da linguagem.
- Usar tom direto, sem preâmbulos desnecessários.
- Em respostas longas, usar Markdown estruturado.

## Memória do projeto

Sempre ler `.specs/STATE.md` ao retomar trabalho, antes de propor o próximo passo.

## Perguntas ao usuário

Sempre que precisar de uma decisão, confirmação ou dado faltante, usar a
ferramenta `question`. Nunca fazer perguntas bloqueadoras em texto puro.

Exceção: perguntas triviais (ex.: "qual o nome do arquivo?") podem ser
feitas em texto puro.

## Resolução de conflitos

1. Hierarquia: instruções do usuário > AGENTS.md do projeto >
   AGENTS.md pai > skills específicas > skills gerais.
2. Código e configuração reais do projeto prevalecem sobre documentação.
3. Nunca ignorar requisito explícito do usuário com base em uma skill.
