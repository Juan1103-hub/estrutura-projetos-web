# PRD — Controle de Estoque Padaria (MVP) — v2

> Versão revisada conforme correções bloqueadoras.
> Data: 2026-07-23
> Status: Em revisão (fase Specify)

---

## 1. Resumo do Produto

Sistema web para controle de estoque de uma pequena padaria com filial/café.
Permite cadastrar produtos e fornecedores, registrar entradas (compras) e saídas
(vendas, consumo interno, perdas) e visualizar dashboard com indicadores
essenciais de estoque.

**Público-alvo:** Dono/gestor e operadores de uma padaria + filial (porte pequeno:
~100-500 produtos, 3-10 usuários simultâneos, 1-2 locais).

**Objetivo:** Substituir planilhas/processos manuais por sistema único,
confiável, com alerta visual de estoque mínimo e visão consolidada de
movimentação.

**Template:** `templates/next-shadcn-admin-dashboard/` (justificativa em
`docs/template-decision.md`).

---

## 2. Arquitetura Multiempresa (Preparada)

**Decisão:** Opção B — **Multiempresa preparada** com `organizations`.

- Uma `organizations` table representa cada cliente/padaria.
- Todas as tabelas de domínio (`produtos`, `fornecedores`, `entradas`,
  `entrada_itens`, `saidas`, `saida_itens`) recebem `organization_id` (FK).
- RLS restringe cada `authenticated` user às organizações das quais é membro
  (tabela `organization_members`).
- Onboarding: na criação da primeira conta de usuário, cria-se uma organização
  padrão e adiciona o usuário como `owner`.
- **Não** implementamos separação por filial/local no MVP (escala futura).
  O requisito de "filial/café" do Discovery vira nota de roadmap, sem coluna
  `location_id` solta no schema.

**Limitação documentada:** uma única `organization` por projeto Supabase no MVP
— não há multi-instance deployment. Para multi-tenant com deploy único, manter
`organization_id` e RLS por org; para multi-instance, criar projeto Supabase
por cliente.

---

## 3. Requisitos Funcionais

| ID | Requisito | Descrição | Prioridade |
|----|-----------|-----------|------------|
| RF-001 | Cadastro de Produtos | CRUD de produtos: nome, categoria, unidade, preço custo, preço venda, estoque mínimo, código de barras (opcional) | Obrigatório |
| RF-002 | Cadastro de Fornecedores | CRUD de fornecedores: nome, CNPJ, contato, telefone, email, endereço, prazo de pagamento (dias) | Obrigatório |
| RF-003 | Entradas (Compras) | Registrar nota de entrada: fornecedor, data, itens (produto, qtd, preço unitário), número da NF. Atualiza estoque atomicamente via RPC. | Obrigatório |
| RF-004 | Saídas (Movimentações) | Registrar saída: data, itens (produto, qtd), tipo (venda/consumo/perda). Atualiza estoque atomicamente via RPC. | Obrigatório |
| RF-005 | Dashboard | Visão consolidada: (a) estoque atual por produto com destaque para abaixo do mínimo; (b) valor total do estoque (custo); (c) alertas de produtos com estoque ≤ mínimo; (d) resumo de entradas e saídas no período (últimos 7/30/90 dias) | Obrigatório |
| RF-006 | Alerta Visual de Estoque Mínimo | Produtos com estoque ≤ mínimo aparecem destacados (cor/ícone) no dashboard e listagem. **Não bloqueia** saída — apenas alerta visual | Obrigatório |
| RF-007 | Listagem e Filtros | Listar produtos, fornecedores, entradas e saídas com paginação, busca textual e filtros relevantes | Obrigatório |
| RF-008 | Unidade de Medida | Suporte a unidades: kg, g, un, L, ml, pacote. Sem conversão no MVP | Obrigatório |
| RF-009 | Imutabilidade de Movimentações | Entradas e saídas confirmadas são **imutáveis** no MVP. Não há editar/excluir documentos confirmados. Correções futuras via movimentação compensatória | Obrigatório |

---

## 4. Requisitos Não-Funcionais

| ID | Requisito | Detalhe |
|----|-----------|---------|
| RNF-001 | Stack | Next.js 16 (App Router) + Supabase (Postgres + Auth) + Tailwind v4 + shadcn/ui. **Sem Prisma.** |
| RNF-002 | Auth | Supabase Auth (email/password). RLS multi-org via `organization_members`. |
| RNF-003 | Banco | PostgreSQL no Supabase. RLS habilitado em **todas** as tabelas (incluindo `organizations`, `organization_members`, `users`). |
| RNF-004 | Atomicidade | Entradas e saídas executam via **funções PostgreSQL RPC** (`registrar_entrada`, `registrar_saida`) em uma única transação. Múltiplos INSERTs via Supabase JS client são proibidos para essas operações. |
| RNF-005 | Custeio | **Custo atual** (preço de custo vigente no momento da consulta). Limitação: alterações em `produtos.preco_custo` impactam imediatamente o valor total do estoque. Custo médio e último custo fora do MVP. |
| RNF-006 | Deploy | Vercel (frontend) + Supabase (banco/auth). Ambientes: local (Docker), staging, prod. |
| RNF-007 | Idioma | PT-BR |
| RNF-008 | Acessibilidade | WCAG 2.1 AA — contraste, teclado, aria-labels, focus visible |
| RNF-009 | Performance | Dashboard < 2s. Listagens paginadas server-side. Índices em `produtos.estoque_atual`, `movement.created_at` |
| RNF-010 | Responsividade | Mobile-first (tablet/celular no balcão) |
| RNF-011 | Segurança | Nunca expor `service_role`. Validações no server (Zod + RPC). RLS em todas as tabelas. |
| RNF-012 | Design | Impeccable como estratégia padrão. `impeccable init` logo após bootstrap/template. Tokens OKLCH do workspace. |

---

## 5. User Stories

| ID | História | Critérios de Aceite |
|----|----------|---------------------|
| US-001 | Como operador, quero cadastrar produtos para controlar o que entra e sai. | Criar/editar/desativar produto; listar com busca por nome/código/categoria; **desativar permitido mesmo com histórico**; excluir físico apenas se sem movimentação |
| US-002 | Como gestor, quero cadastrar fornecedores para vincular nas compras. | Criar/editar/desativar fornecedor; CNPJ com validação (formato + algoritmo real); desativar permitido; excluir físico apenas se sem entradas |
| US-003 | Como operador, quero registrar entrada de mercadoria (nota fiscal) para atualizar o estoque. | Selecionar fornecedor cadastrado; adicionar múltiplos itens; informar NF e data; ao salvar: estoque += qtd **atomicamente** via RPC; validação: qtd > 0, preço ≥ 0; **produto não pode repetir na mesma entrada** (UNIQUE constraint) |
| US-004 | Como operador, quero registrar saídas (venda, consumo, perda) para baixar do estoque. | Selecionar tipo; adicionar itens; ao salvar: estoque -= qtd **atomicamente** via RPC; **produto não pode repetir na mesma saída**; **permitir estoque negativo** (apenas alerta) |
| US-005 | Como gestor, quero ver dashboard com indicadores essenciais para tomar decisões. | Cards: total itens, valor total (custo atual), qtd alertas mínimo, movimentações (30d); gráfico entradas vs saídas (30d); tabela top 20 alertas (nome, atual, mínimo, deficit) |
| US-006 | Como operador, quero identificar rapidamente produtos em estoque crítico. | Badge/cor vermelha em produtos ≤ mínimo na listagem e dashboard; contador de alertas no sidebar |
| US-007 | Como usuário, quero navegar entre módulos com sidebar responsiva. | Sidebar fixa (desktop) / drawer (mobile); links: Dashboard, Produtos, Fornecedores, Entradas, Saídas; estado ativo destacado; **apenas ícones Lucide** (sem emojis) |

---

## 6. Fora do Escopo (MVP)

- Múltiplas filiais/locais
- Controle de validade/lote
- Conversão de unidades (kg ↔ g)
- Emissão de NF-e / cupom fiscal
- Integração com PDV externo
- Relatórios avançados (curva ABC, giro, previsão)
- Custo médio ou último custo (apenas custo atual)
- Edição/exclusão de movimentações confirmadas (imutáveis)
- Auditoria/log de alterações
- Multi-instance Supabase (uma organização por projeto)

---

## 7. Restrições e Suposições

- **Multiempresa preparada:** schema com `organizations` e `organization_members`; RLS por org. Não confundir com multi-filial (location).
- **Estoque negativo permitido** em saídas, apenas alerta visual.
- **Sem centro de custo / frete / impostos** nas entradas.
- **Sem composição de produtos** (receitas).
- **Offline não suportado.**
- **CNPJ validado por algoritmo real** (módulo 11), não apenas formato.

---

## 8. Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Concorrência em entradas/saídas simultâneas | Baixa | Alto | RPC atômica com `SELECT ... FOR UPDATE` em `produtos`; isolamento `READ COMMITTED` |
| Trigger não ser suficiente para integridade | Média | Alto | Toda lógica de estoque na **RPC** (não em trigger); trigger apenas como barreira secundária |
| Edição manual de `produtos.estoque_atual` | Baixa | Crítico | Revogar `UPDATE` em colunas críticas via trigger `BEFORE UPDATE` que rejeita alteração manual |
| CNPJ inválido contornar validação | Baixa | Médio | Validação no client (Zod com algoritmo) **e** check no server action + RPC |
| RLS mal configurada entre orgs | Baixa | Crítico | Testes E2E com 2 orgs distintas verificam isolamento |
| Custo desatualizado inflar valor do dashboard | Média | Médio | Documentar limitação; sugerir recálculo manual ao alterar preço |

---

## 9. Próximos Passos

1. **Decisões Técnicas (atualizadas)** — confirmar RPCs, schema, RLS multi-org
2. **SPEC (atualizada)** — detalhar contratos RPC, telas, estados
3. **Planejamento (atualizado)** — T-001 = clone template
4. **Sprint Validator (atualizado)**
5. **APROVAR PLANO E INICIAR**
