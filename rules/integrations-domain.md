# Regras de Domínio — Integrações Externas

Aplicar obrigatoriamente em projetos ou features com integração com API
externa, webhook, gateway de pagamento, CRM, ERP, e-mail, SMS, push,
OAuth com terceiros, SSO, LLM, etc. Roteado por `rules/domain-routing.md`.

---

## Discovery obrigatório

Antes de definir schema, RLS, APIs ou telas, esclarecer e registrar no PRD:

1. Qual o serviço externo e o que ele faz? (envio de e-mail, gateway de
   pagamento, LLM, sistema de terceiros, etc.)
2. Autenticação: API key, OAuth 2.0, JWT, mTLS, HMAC? Quem emite, quem
   rotaciona, onde fica armazenada?
3. Há rate limit? Qual o limite? Como tratar 429 e backoff?
4. Há SLA de uptime? E exigido circuit breaker ou fallback?
5. Há idempotência do lado do provedor? Como identificar duplicados?
6. Há webhook de retorno? Como validar assinatura? Qual a_source de verdade?
7. Há ordem de eventos? (ex.: webhook antes do retorno da API)
8. Há retry em falha transitória? Quantas tentativas, qual o intervalo?
9. Há fila/queue (BullMQ, SQS, Supabase Queues)? Ou chamada síncrona?
10. Há dados sensíveis no payload? (RGPD/LGPD — ver `rules/lgpd-domain.md`)
11. Há custo por chamada? Otimizar batch? Cache?
12. Há ambiente de sandbox/test do provedor? Como testar sem custo real?
13. Há quebra de contratoassinada? Versionamento de API do provedor?
14. Há timeout razoável por operação? (não usar timeout default longo)

Se a resposta for desconhecida e afetar schema, configuração, segurança ou
contrato, registrar a suposição no PRD e pedir confirmação antes de
implementar.

## Invariantes obrigatórias

- **Credenciais**: never no código, never no client, never em logs.
  Sempre em variáveis de ambiente marcadas como Secret. Número mínimo de
  pessoas com acesso. Nomes não revelam provedor (`STRIPE_SECRET_KEY`,
  não `CREDIT_CARD_GATEWAY_PASSWORD`).
- **Server-side only**: chamadas a API externa com credencial acontecem
  Server Action, API route, Edge Function — nunca no client bundle.
- **Idempotência**: operações de mutação externas têm ID de idempotência
  único (uuid ou hash de payload + janela temporal). Repoisito em
  coluna `external_id UNIQUE`. Replay não duplica.
- **Retries com backoff exponencial e jitter**: 3-5 tentativas máx.
  Não retry em 4xx definitivos (400, 401, 403, 422). Retry em 429, 5xx,
  timeout e erro de rede.
- **Timeout explícito por chamada**: 10-30s padrão. Never infinity.
- **Circuit breaker**: se N falhas em janela, abrir circuito e falhar
  fast em vez de sobrecarregar provedor.
- **Logs de integração**: registrar request, response, status, latency,
  external_id. Nunca logar payload com dado sensível (token, senha, PAN).
  Logar metadados, hash do payload se necessário.
- **Webhooks**: validar assinatura HMAC/assinatura do provedor antes de
  qualquer processamento. Idempotência por event ID. Persistir payload
  bruto em tabela imutável. Responder 2xx imediato, processar async.
- **Ordem de eventos**: não confiar na ordem do webhook. Reconciliar via
  poll/consulta ao estado atual quando possível.
- **Versionamento de API**: nunca assumir v=Eterna. Registrar versão
  usada; planejar migração; ter testes de contrato.
- **Mapeamento de erros**: cada código HTTP e código de erro do
  provedor mapeado para mensagem PT-BR e ação do usuário.
- **Fallback**: definir o que acontece se provedor cair (ex.: e-mail
  fica em fila para retry posterior; pagamento mostra "tente novamente").
- **Sandbox**: tests de integração usam ambiente sandbox do provedor.
  Never chamar produção em CI/test.
- **Secrets rotation**: credencial tem TTL e política de rotação
  documentada. Rotation não exige redeploy se possível.

## Contratos e tipos

- Definir tipos TypeScript para request/response, nunca `any`.
- Validar response do provedor com Zod antes de usar (prove não responde
  como prometido, ex.: campo nulo que esperável).
- Ter schema versionado; quebra de contrato detectado em CI.

## Custo e quota

- Documentar custo unitário no PRD (ex.: $0.0001 por e-mail).
- Implantar cache quando viável (ex.: GET de catálogo).
- Bloquear chamada se quota diária atingida (não gerar débito não previsto).
- Batch quando suportado (ex.: envio em lote).

## Quebra de dependência

- Não acoplar domínio à SDK do provedor. Abstrair por interface
  (`EmailProvider`, `PaymentGateway`). Trocar Stripe -> Mercado Pago
  não reescreve regra de negócio.
- Dados do provedor (ex.: `stripe_customer_id`) em coluna separada,
  isolada do domínio principal.

## Segurança de webhooks

- URL única por ambiente, não adivinhável.
- Validar assinatura com segredo compartilhado; Reject 401 sem processar.
- Reenvio do provedor não duplica (idempotência por event ID + estado).
- Webhook não信任 headers do client; valida signature primeiro.

## Critérios de aceite

Uma feature com integração externa só está pronta quando:

1. Credencial em variável Secret, nunca no client, logs ou commits.
2. Idempotência testeda: duplo submit não duplica efeito.
3. Retries testados: falha transitória não vaza erro 500 ao usuário.
4. Timeout explícito e razoável implementado.
5. Webhook valida assinatura antes de processar.
6. Log imutável da integração sem dado sensível.
7. Mapa de erros do provedor -> PT-BR e ação do usuário.
8. Ambiente sandbox usado em dev e CI; produção nunca chamada em test.
9. SDK abstraído por interface; domínio não acoplado ao provedor.
10. Quota/custo documentado e controle para evitar estouro.