# Roteamento por Domínio de Negócio

Regra curta referenciada pelo `AGENTS.md` (seção 5). Objetivo: garantir
que o agente identifique automaticamente quando a solicitação envolve
um domínio crítico — e leia a regra especializada antes de tomar
decisões técnicas — em vez de aplicar uma solução genérica plausível
mas incompleta.

---

## Quando aplicar

Antes de concluir Discovery ou gerar PRD, decisões técnicas, schema,
RLS, SPEC ou plano de implementação, para **qualquer** projeto novo ou
mudança L2 em projeto existente.

## Como identificar o domínio

Ler a solicitação do usuário e o PRD em construção. Se qualquer palavra
abaixo (ou sinônimo direto) aparecer descrevendo uma entidade central
do sistema — não apenas de passagem — carregar a regra correspondente
antes de continuar.

| Domínio | Palavras-gatilho | Regra a ler |
|---|---|---|
| Estoque / inventário | estoque, inventário, produto, saldo, entrada, saída, movimentação, compra, venda, consumo, perda, almoxarifado, depósito, fornecedor, custo, lote | `rules/inventory-domain.md` |
| Segurança / dados sensíveis | senha, token, segredo, service_role, RLS, migration destrutiva, dado pessoal | `rules/security-secrets.md` |
| Financeiro / pagamentos | pagamento, cobrança, faturamento, transação, carteira, saldo monetário, conciliação, estorno, reembolso, moeda, centavos, NF, fiscal, cartão, PIX, stripe, gateway | `rules/finance-domain.md` |
| LGPD / dados pessoais | dado pessoal, CPF, RG, e-mail, telefone, biometria, consentimento, privacidade, retenção, anonimização, cookie, DPO | `rules/lgpd-domain.md` |
| Integrações externas | API externa, webhook, gateway externo, OAuth, SSO, SDK, provedor, sandbox, rate limit, retry, idempotência | `rules/integrations-domain.md` |

## Domínios sem regra especializada ainda

Se o domínio identificado não estiver listado acima:

1. Não assumir solução genérica.
2. Registrar explicitamente no PRD que não existe regra especializada
   para esse domínio no workspace.
3. Fazer perguntas bloqueadoras equivalentes às da seção "Discovery
   obrigatório" de `rules/inventory-domain.md`, adaptadas ao domínio.
4. Sugerir ao usuário, ao final do planejamento, que uma regra
   `rules/<dominio>-domain.md` seja criada para reuso futuro — mas não
   criar a regra sem aprovação explícita.

## Regra de não-duplicação

Antes de propor uma nova regra de domínio, verificar se o conteúdo já
está coberto — ainda que parcialmente — por `rules/security-secrets.md`,
`rules/stack-selection.md` ou por uma regra de domínio existente. Propor
apenas a menor alteração necessária (adicionar seção a arquivo existente
em vez de criar arquivo novo, quando fizer sentido).

## Efeito esperado

Este roteamento não substitui `tlc-spec-driven` — ele garante que,
dentro do processo de planejamento que a skill já exige, a expertise de
domínio correta seja carregada no momento certo, em vez de depender de
o agente "adivinhar" que um domínio é crítico.
