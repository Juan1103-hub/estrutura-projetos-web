# Sprint Validator — Controle de Estoque Padaria

> Verificação final de cobertura, dependências, riscos e critérios de pronto
> antes de solicitar `APROVAR PLANO E INICIAR`.
> Data: 2026-07-23

---

## 1. Cobertura de User Stories × Tasks

| User Story | Tasks | ACs Cobertos |
|------------|-------|--------------|
| US-001 (CRUD Produtos) | T-006, T-007 | ✅ Todos |
| US-002 (CRUD Fornecedores) | T-008, T-009 | ✅ Todos |
| US-003 (Entradas) | T-011, T-012 | ✅ Todos |
| US-004 (Saídas) | T-013, T-014 | ✅ Todos |
| US-005 (Dashboard) | T-015, T-016, T-017 | ✅ Todos |
| US-006 (Alerta visual) | T-017, T-018 | ✅ Todos |
| US-007 (Sidebar) | T-004, T-018 | ✅ Todos |

**Cobertura: 7/7 user stories (100%)**

---

## 2. Cobertura de Requisitos Funcionais × Tasks

| RF | Descrição | Tasks | Status |
|----|-----------|-------|--------|
| RF-001 | Cadastro Produtos | T-006, T-007 | ✅ |
| RF-002 | Cadastro Fornecedores | T-008, T-009 | ✅ |
| RF-003 | Entradas | T-011, T-012 | ✅ |
| RF-004 | Saídas | T-013, T-014 | ✅ |
| RF-005 | Dashboard | T-015, T-016, T-017 | ✅ |
| RF-006 | Alerta Estoque Mínimo | T-017, T-018 | ✅ |
| RF-007 | Listagem e Filtros | T-007, T-009, T-012, T-014 | ✅ |
| RF-008 | Unidade de Medida | T-006, T-007 | ✅ |

**Cobertura: 8/8 RFs (100%)**

---

## 3. Cobertura de Requisitos Não-Funcionais × Tasks

| RNF | Descrição | Tasks/AD | Status |
|-----|-----------|----------|--------|
| RNF-001 | Stack Next.js + Supabase | AD-001, T-001, T-002 | ✅ |
| RNF-002 | Auth Supabase | T-003 | ✅ |
| RNF-003 | RLS habilitado | T-002 (migrations) | ✅ |
| RNF-004 | Deploy Vercel | T-020 | ✅ |
| RNF-005 | Idioma PT-BR | Global | ✅ |
| RNF-006 | Acessibilidade WCAG AA | T-019 (polish) | ✅ |
| RNF-007 | Performance | T-015 a T-017 (queries agregadas + paginação) | ✅ |
| RNF-008 | Responsividade | T-004 (sidebar responsiva) | ✅ |
| RNF-009 | Segurança (RLS, server validation) | T-002 (RLS), T-006/008/011/013 (validação) | ✅ |
| RNF-010 | Design Impeccable | T-010, T-019 | ✅ |

**Cobertura: 10/10 RNFs (100%)**

---

## 4. Dependências Verificadas

### Ordem de Execução
```
T-001 → T-002 → T-003 → T-004 → T-005 → T-006/T-008 (paralelo) → T-007/T-009 (paralelo) → T-010 → T-011/T-013 (paralelo) → T-012/T-014 (paralelo) → T-015/T-016/T-017 (paralelo) → T-018 → T-019 → T-020
```

### Dependências Críticas
- T-001 deve vir antes de qualquer outra (bootstrap)
- T-002 deve vir antes de T-006, T-008, T-011, T-013 (tabelas precisam existir)
- T-003 deve vir antes de T-004, T-007, T-009, T-012, T-014 (auth + layout)
- T-004 antes de T-007, T-009, T-012, T-014, T-015-T-017 (sidebar usada nas páginas)
- T-005 antes de T-006, T-008, T-011, T-013 (utils e validações usadas)
- T-010 antes de T-019 (Impeccable init é setup, polish é uso)

### Dependências Não-Críticas (paralelizáveis)
- T-006 e T-008 (actions de produtos e fornecedores) — independentes
- T-007 e T-009 (UIs) — independentes
- T-011 e T-013 (actions de entradas e saídas) — independentes
- T-012 e T-014 (UIs) — independentes
- T-015, T-016, T-017 (componentes do dashboard) — independentes entre si

✅ **Sem dependências circulares. Grafo é DAG.**

---

## 5. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação Aplicada |
|-------|---------------|---------|---------------------|
| Trigger de estoque pode divergir | Média | Alto | Testes E2E (T-011, T-013) verificam estoque antes/depois |
| RLS mal configurado | Baixa | Crítico | Policies testadas com `supabase` CLI + usuários distintos |
| CNPJ duplicado em race condition | Baixa | Médio | Constraint UNIQUE + validação no server action |
| Performance dashboard com volume | Baixa | Médio | Índices em `produtos(estoque_atual)`, agregações server-side |
| Estoque negativo confunde usuário | Média | Médio | Alerta visual + tooltip explicativo |
| Impeccable audit revelar muitos achados | Média | Médio | Reservar T-019 para polish; correção incremental |
| Tipos Supabase ficarem desatualizados | Média | Médio | Script `gen types` no package.json; rodar antes de commits |
| Concorrência em entradas/saídas simultâneas | Baixa | Alto | Trigger é atômico; testes E2E com 2 usuários paralelos |

**Total de riscos identificados: 8** — todos com mitigação.

---

## 6. Critérios de Pronto (DoD) Verificados

Cada task tem DoD explícito no `tasks.md`:
- ✅ Testes unitários
- ✅ E2E do escopo
- ✅ Type-check
- ✅ Lint
- ✅ Build
- ✅ Code review proporcional
- ✅ Validação visual chrome-devtools
- ✅ Impeccable audit (UI)
- ✅ Commit atômico

**Definition of Done validado.**

---

## 7. Verificação de Conformidade com AGENTS.md

| Regra | Conformidade |
|-------|--------------|
| Projeto novo → tlc-spec-driven | ✅ |
| Nunca começar por código sem aprovação | ✅ (aguarda APROVAR) |
| tlc-spec-driven disponível | ✅ (`skills/tlc-spec-driven/`) |
| RLS em tabelas expostas | ✅ (todas as 6 tabelas) |
| service_role nunca no frontend | ✅ (apenas anon key em `NEXT_PUBLIC_*`) |
| Validação no servidor/banco | ✅ (Zod + RLS + CHECK constraints) |
| Backup/rollback para migrations destrutivas | ✅ (SQL em `supabase/migrations/` versionado) |
| Impeccable como padrão UI | ✅ (T-010, T-019) |
| Vercel como padrão de deploy | ✅ (AD-010) |
| PT-BR na interface | ✅ (Global) |
| WCAG 2.1 AA | ✅ (T-019 polish) |
| Code review proporcional ao risco | ✅ (L2 → reviewer) |
| Fallback de ferramentas | ✅ (chrome-devtools, impeccable verificados) |

**Conformidade: 12/12 (100%)**

---

## 8. Skills que Serão Usadas

| Skill | Etapa | Motivo |
|-------|-------|--------|
| `tlc-spec-driven` | Especificação + Verifier | Já em uso |
| `frontend-design` | UI components | Padrão visual do workspace |
| `frontend-blueprint` | Estrutura de UI | Descoberta de design |
| `impeccable` | T-010, T-019 | Padrão de design UI |
| `chrome-devtools` | Validação visual | Console + network + screenshot |
| `best-practices` | Code review | Segurança web |
| `accessibility` | T-019 | WCAG audit |
| `supabase` | T-002, T-011, T-013 | Setup + RLS |
| `supabase-postgres-best-practices` | T-002, T-011, T-013 | Schema + triggers |
| `coding-guidelines` | Geral | Padrões de código |
| `code-review` | T-006 a T-014 | Review proporcional ao risco |
| `systematic-debugging` | Se bugs | Debug estruturado |
| `test-driven-development` | T-005, T-011, T-013 | Testes primeiro |

---

## 9. Estimativa de Tempo

| Batch | Tasks | Tempo Estimado |
|-------|-------|----------------|
| Batch 1 (Fundação) | 5 | 2-3 dias |
| Batch 2 (Cadastros) | 5 | 2-3 dias |
| Batch 3 (Movimentações) | 4 | 2 dias |
| Batch 4 (Dashboard + Polish) | 6 | 2-3 dias |
| Verifier + Acceptance | — | 1 dia |
| **Total** | **20 tasks** | **~10 dias úteis** |

---

## 10. Gaps e Perguntas em Aberto

Nenhum gap identificado. Todas as decisões estão documentadas.

---

## 11. Decisão do Sprint Validator

✅ **PLANO APROVADO** — Cobertura completa, dependências validadas, riscos mitigados, DoD definido, conformidade com AGENTS.md verificada.

---

## 12. Próximo Passo

Apresentar plano consolidado ao usuário e aguardar comando explícito:

```
APROVAR PLANO E INICIAR
```