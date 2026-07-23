# Regras de Dominio - Financeiro / Pagamentos

Aplicar obrigatoriamente em projetos ou features com financeiro, pagamentos,
cobranca, faturamento, transacoes, carteira, saldo monetario, conciliacao,
estornos ou reembolsos. Roteado por `rules/domain-routing.md`.

---

## Discovery obrigatorio

Antes de definir schema, RLS, APIs ou telas, esclarecer e registrar no PRD:

1. Quais moedas o sistema suporta? Somente BRL, ou multi-moeda com cambio?
2. Ha centavos arredondados, truncados ou usam-se inteiros (centavos como int)?
3. Pagamentos sao processados em qual gateway (ex.: Stripe, Mercado Pago,
   Pagar.me, PIX direto)? Quem armazena token vs cartao?
4. Ha assinatura/recorrencia ou apenas pagamentos avulsos?
5. Ha split de pagamento, marketplace ou subcontas? Quem recebe o que?
6. Ha conciliacao de recebimentos com transacoes? Qual a fonte de verdade?
7. Estornos sao automaticos, manuais ou pelo gateway? Ha prazo limite?
8. Ha notas fiscais obrigatorias (NFSe, NFS-e, SAT)? Qual o regime fiscal?
9. Ha anti-fraude, validacao de chargeback, regras de retry/dunning?
10. Quem pode visualizar, aprovar, estornar ou cancelar pagamentos?
    (segregacao de funcoes)
11. Ha retencao / compliance fiscal (SPED, DCTF, etc.)? Quanto tempo manter?
12. Ha IAP (in-app purchase) ou taxas regulatorias que exigem calculos?

Se a resposta for desconhecida e afetar schema, gateway, seguranca ou saldo,
registrar a suposicao no PRD e pedir confirmacao antes de implementar.

## Invariantes obrigatorias

- Dinheiro NUNCA como `float`/`double` no codigo ou DB. Sempre integer
  centavos ou `numeric`/`decimal` com scale explicita (ex.: `numeric(15,2)`).
- Toda transacao financeira e imutavel apos confirmada. Correcoes usam
  lancamento compensatorio (estorno) nunca UPDATE direto.
- Saldo do cliente/conta nao e editavel diretamente por UI, API ou client.
  Deriva sempre do somatorio de transacoes confirmadas (ou e mantido por
  trigger auditavel).
- Transacao com multiplos itens/lotes e atomica no banco. Falha parcial
  nao pode deixar dados inconsistentes.
- Toda transacao registra: origem, usuario, data/hora, metodo, gateway,
  ID externo (idempotencia), estado (pending/confirmed/failed/refunded),
  valor bruto, descontos, taxas, valor liquido.
- Idempotencia obrigatoria: ID externo unico por gateway/cliente. Reenvio
  nao duplica cobranca.
- Estados de transacao bem definidos: `pending -> confirmed -> refunded`,
  `pending -> failed`, `confirmed -> partially_refunded`. Sem saltos.
- Webhooks de gateway: validar assinatura, idempotencia por event ID,
  registrar payload bruto em log imutavel.
- Nao expor token de cartao, CVV, PAN completo no client, logs ou banco.
  Se precisar armazenar, usar PCI-compliant token (Stripe.js, etc.).
- Toda mutacao sensivel (estorno, reembolso, ajuste) deixa trilha de
  auditoria imutavel e segregada da operacao.

## Organizacao e RLS

- Toda tabela financeira: RLS obrigatoria com filtro por `organization_id`
  ou `user_id`. Nunca `USING (true)` em tabela com valores.
- Apoiadores/admin tem role distinta se segregacao exigida (ver ponto 10
  do Discovery). Persistir role, nao inferir da UI.
- Concorrencia: usar `SELECT ... FOR UPDATE` ou advisory locks em
  operacoes que ajustam saldo; transacoes em nivel serializable se conflito
  for critico.
- Nao conceder `service_role` a client. Operacoes de gateway acontecem
  server-side com key em variavel de ambiente marcada como Secret.

## Compliance e retencao

- Definir no PRD tempo de retencao minimo (NF, logs, transacoes).
- Se houver fiscal brasileiro, nao excluir fisicamente registros por
  tempo; somente marcar como arquivado retido.
- LGPD: ver `rules/lgpd-domain.md` quando o dado financeiro se cruza com
  dado pessoal (ex.: historico de compras de pessoa fisica).

## URLs e exposicao

- Nunca usar `?amount=` ou `?user_id=` em query string em producao (logs
  de proxy e CDN persistem). Usar POST com body ou path params opacos.
- Confirmacao de pagamento por link e-mail: token assinado, prazo curto,
  single-use.
- Nao vazar dados de cliente ou valor em metadados do evento analytics.

## Criterios de aceite

Uma feature financeira so esta pronta quando:

1. Nada no sistema usa float para armazenar ou calcular dinheiro.
2. Saldo nao e editavel manualmente; deriva de transacoes imutaveis.
3. Idempotencia testada: replay de webhook e duplo submit nao duplicam.
4. Estados de transacao proibem saltos (ex.: `pending` -> `refunded` direto).
5. Estorno e compensatorio e auditavel; nunca overwrite.
6. Concorrencia testada (dois estornos simultaneos sobre mesmo saldo).
7. RLS testada com usuario de menor privilegio.
8. PCI: nenhum dado de cartao sensivel em logs, banco, bundle ou client.
9. Webhooks validam assinatura; payload bruto persistido.
10. Trilha de auditoria imutavel para criacao, confirmacao, estorno, reembolso.
11. Moeda e precisao documentados no PRD e aplicados consistentemente.