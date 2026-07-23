# Regras de Domínio — Estoque e Movimentações

Aplicar obrigatoriamente em projetos ou features com estoque,
inventário, produtos, entradas, saídas, compras, vendas, consumo,
perdas ou saldo. Roteado por `rules/domain-routing.md`.

---

## Discovery obrigatório

Antes de definir schema, RLS, APIs ou telas, esclarecer e registrar no
PRD:

1. O sistema atende uma única organização ou múltiplas empresas/clientes?
2. Há uma ou várias filiais, depósitos ou locais de estoque?
3. Uma movimentação confirmada pode ser editada, cancelada ou somente estornada?
4. Saldo negativo é bloqueado, permitido com alerta ou permitido sem alerta?
5. Qual método de custeio será usado: custo atual, último custo, custo médio ponderado ou outro?
6. Há lote, validade, número de série, unidade alternativa ou conversão de unidade?
7. NF deve ser única por fornecedor, empresa e série?
8. Quem pode cadastrar, confirmar, cancelar ou estornar movimentações?
9. Há integração com PDV, fiscal, compras, produção ou ERP?
10. Quais relatórios e auditorias são obrigatórios?

Se a resposta for desconhecida e afetar schema, segurança, saldo ou
custo, registrar a suposição no PRD e pedir confirmação antes de
implementar.

## Invariantes obrigatórios

- O saldo de estoque não pode ser editado diretamente por UI, API ou client.
- Toda alteração de saldo deve nascer de uma movimentação registrada.
- Entrada, saída, ajuste, cancelamento e estorno devem ter tipo, data,
  usuário, itens, motivo quando aplicável e rastreabilidade.
- Cabeçalho da movimentação, itens, atualização de saldo e auditoria
  devem ocorrer atomicamente em uma única transação no banco.
- Server Actions/API validam input e autorização, mas **não substituem**
  a transação do banco.
- Para Supabase, usar RPC PostgreSQL (ou função transacional
  equivalente) para confirmar movimentações com múltiplos itens — nunca
  tratar múltiplos inserts independentes do client como transação.
- Movimentações confirmadas são imutáveis por padrão no MVP.
- Correções usam estorno ou movimentação compensatória; nunca editar
  saldo anterior diretamente.
- O banco deve impedir `UPDATE` direto de saldo e alterações indevidas
  de itens confirmados.
- Constraints para quantidade positiva, produto válido e item não
  duplicado na mesma movimentação, salvo regra explicitamente diferente.
- Testar falha parcial e concorrência antes de concluir a feature.

## Organização e RLS

Antes de usar policies permissivas, escolher e documentar um modelo:

**Instância única** — um único cliente/empresa por projeto Supabase;
usuários autenticados acessam a mesma organização; declarar
explicitamente que não há multitenancy.

**Multiempresa** — criar `organizations`, associação de usuários e
`organization_id` nas tabelas de domínio; aplicar RLS por organização em
todas as tabelas, views e RPCs.

Nunca usar `USING (true) WITH CHECK (true)` para simular isolamento
entre empresas — isso não é isolamento, é acesso livre entre
autenticados. "Single-role" (sem distinção de papéis) define permissões
funcionais; não substitui isolamento por organização.

## Custo e valorização

Definir no PRD e na SPEC um único método: custo atual, último custo,
custo médio ponderado ou outro aprovado. Dashboard, entradas, saídas,
saldo e relatórios devem usar o mesmo método. Se custo atual for usado
por simplicidade no MVP, registrar explicitamente que a valorização
histórica pode mudar quando o cadastro do produto for alterado.

## Segurança e auditoria

- RLS em todas as tabelas expostas.
- `service_role` nunca no client (ver `rules/security-secrets.md`).
- Autorizar e validar no servidor e no banco.
- Registrar usuário, data e origem em toda movimentação.
- Não excluir fisicamente produtos ou movimentos com histórico —
  desativar/arquivar em vez de apagar.
- Operações destrutivas exigem confirmação, backup e plano de rollback.
- Testar RPCs, views e policies como usuário com menor privilégio.

## Critérios de aceite

Uma feature de estoque só está pronta quando:

1. A movimentação é atômica; falha em qualquer item não deixa dados parciais.
2. O saldo não é alterável manualmente.
3. Saldo, histórico e dashboard permanecem consistentes entre si.
4. RLS foi testada com usuário autenticado de menor privilégio.
5. O método de custeio está documentado e aplicado de forma consistente.
6. Há testes de quantidade inválida, produto duplicado, falha parcial e concorrência.
7. Há rastreabilidade de quem registrou cada movimentação.
