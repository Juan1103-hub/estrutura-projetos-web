# Tasks — qualidade-clinica

> 1 task por vez → code review → commit atômico. Batches sequenciais.
> Total: 24 tasks em 4 batches (~6/batch) → workers sub-agent serão ofertados no início da execução.

## Batch 1 — Fundação (auth, org, audit, layout)

### T-001: Bootstrap Next.js 16 + Tailwind v4 + shadcn/ui + Supabase clients
- [ ] create-next-app em projects/qualidade-clinica (TS strict, App Router)
- [ ] shadcn init + lucide + chart.js + sonner; fonte Inter; tokens OKLCH do workspace
- [ ] supabase client (browser/server) + middleware de sessão
- Validação: `npm run build` sem erros; lint ok
- Arquivos: projects/qualidade-clinica/**

### T-002: Migration base — organizations, profiles, auth, RLS
- [ ] Tabelas organizations/profiles + role enum
- [ ] RLS: org + papel; policies SELECT/INSERT/UPDATE/DELETE
- [ ] Seed: 1 org + 1 admin
- Validação: `supabase db push` local; teste JWT de outro user → 0 linhas
- Arquivos: supabase/migrations/0001_base.sql, supabase/seed.sql

### T-003: Login + proteção de rotas + gestão de usuários (admin)
- [ ] Tela login (PT-BR), logout, guard por papel
- [ ] CRUD usuários admin (convite, papel, desativar)
- Validação: Vitest (guard) + Playwright (login→dashboard)
- Arquivos: app/(auth)/**, app/(app)/admin/**, middleware.ts

### T-004: Audit log genérico + access_log + consent_records
- [ ] Trigger audit (old/new JSONB) registrável por tabela
- [ ] Tabelas consent_records (imutável) + access_log
- [ ] Teste: update gera linha audit; consent não aceita UPDATE/DELETE
- Validação: queries de verificação + Vitest RPC
- Arquivos: supabase/migrations/0002_audit.sql

### T-005: Layout app — sidebar 2 módulos + dashboard geral + central de alertas (shell)
- [ ] Sidebar dark 260px: Farmácia, Laboratório, Alertas (badge), Admin
- [ ] Shell dashboard geral + shell central de alertas (dados mock)
- Validação: chrome-devtools (0 erros console, screenshot), /audit-ui
- Arquivos: app/(app)/layout.tsx, components/layout/**, app/(app)/dashboard/**

### T-006: PII — patients/donors com mascaramento + RPC de detalhe
- [ ] Tabelas patients/donors; views mascaradas; RPC detail com access_log
- [ ] Utils de máscara (nome, documento) + testes unit
- Validação: listagem mascara; RPC registra access_log
- Arquivos: supabase/migrations/0003_pii.sql, lib/masks.ts

## Batch 2 — Módulo Farmácia

### T-007: Indicadores — schema (indicators, targets, entries) + RPC confirm
- [ ] DDL + UNIQUE(indicator, month) + meta por vigência + RPC transacional
- [ ] Seed dos 4 indicadores FAR
- Validação: duplicado no mês rejeitado; meta sem vigência bloqueia
- Arquivos: supabase/migrations/0004_indicators.sql

### T-008: Tela Indicadores Farmácia — CRUD indicadores + lançamento mensal
- [ ] CRUD (qualidade/admin) + grid mensal valor×meta com destaque
- [ ] Estados loading/empty/erro; toasts
- Validação: Vitest (comparação meta) + chrome-devtools + /audit-ui
- Arquivos: app/(app)/farmacia/indicadores/**, components/**

### T-009: Gráficos de indicadores + filtro período
- [ ] Chart.js linha/barra por indicador; filtro mês/ano
- Validação: chrome-devtools screenshot; dados batem com grid
- Arquivos: components/charts/**, farmacia/indicadores/**

### T-010: Matriz de riscos — schema + tela com semáforo e filtros
- [ ] DDL risks (grade GENERATED) + CRUD completo
- [ ] Semáforo baixo/médio/alto; filtros setor/grau
- Validação: grade calculado no banco; Vitest faixas; chrome-devtools
- Arquivos: supabase/migrations/0005_risks.sql, app/(app)/farmacia/riscos/**

### T-011: Rastreio medicação controlada — schema + telas
- [ ] DDL controlled_med_entries + índices (lot, patient, date)
- [ ] Abas por medicamento, cadastro rápido, busca paciente/lote/período
- Validação: rastreio por lote retorna trilha completa; E2E Playwright
- Arquivos: supabase/migrations/0006_controlled.sql, app/(app)/farmacia/medicacao-controlada/**

### T-012: Batch review checkpoint Farmácia
- [ ] Verifier do batch: ACs RF-001..007, evidências, sensor
- Validação: validation-batch2.md PASS

## Batch 3 — Módulo Laboratório

### T-013: Indicadores Laboratório — dashboard consolidado
- [ ] Reutiliza T-007/008/009; grid de cards de todos os indicadores LAB
- Validação: dezenas de indicadores lado a lado sem quebra de layout
- Arquivos: app/(app)/laboratorio/indicadores/**

### T-014: Nitrogênio — schema + cadastro semanal + histórico anual
- [ ] cryo_tanks (Bot 1–10, grupos, limites) + readings (out_of_range GENERATED)
- [ ] Cadastro semanal com validação de faixa + alerta; navegação por mês/ano
- Validação: leitura fora do limite gera alerta; Vitest faixas
- Arquivos: supabase/migrations/0007_nitrogen.sql, app/(app)/laboratorio/nitrogenio/**

### T-015: Andrologia — equipamentos, leituras diárias, não conformidades
- [ ] equipment + readings (out_of_range) + nonconformities
- [ ] Lançamento diário por equipamento; alerta fora da faixa
- Validação: alerta criado no lançamento fora; vínculo NC↔equipamento/data
- Arquivos: supabase/migrations/0008_andrology.sql, app/(app)/laboratorio/andrologia/**

### T-016: Congelamento — schema (samples, cryo_locations) + RPC alocação atômica
- [ ] semen_samples (own|donor) + trace_code sequencial + cryo_locations UNIQUE
- [ ] RPC allocate_sample_location (ocupa + grava, transacional)
- Validação: dupla ocupação rejeitada; trace_code único
- Arquivos: supabase/migrations/0009_cryo.sql

### T-017: Congelamento — telas (tabela 2000+, cadastro, mapa do botijão)
- [ ] Tabela server-side paginada + filtros; cadastro com trace_code
- [ ] Mapa: seletor Bot → grid rack×caçapa livre/ocupada → detalhe
- Validação: E2E Playwright (cadastro→mapa→localização); chrome-devtools
- Arquivos: app/(app)/laboratorio/congelamento/**

### T-018: Descarte — fluxo 2 níveis + termo Storage
- [ ] disposal_requests + RPC request/approve/reject (termo obrigatório)
- [ ] Fila de aprovação (qualidade/admin) + upload termo + alerta pendente
- Validação: aprovar sem anexo falha; amostra vira discarded só após aprovação
- Arquivos: supabase/migrations/0010_disposal.sql, congelamento/descarte/**

### T-019: Controle de meios — schema + tela + alertas de vencimento
- [ ] supplies_receipts + filtros fornecedor/mês/insumo
- [ ] Cron diário: alertas 30/15/7 dias antes do vencimento
- Validação: cron gera alertas corretos; filtro por insumo
- Arquivos: supabase/migrations/0011_supplies.sql, app/(app)/laboratorio/meios/**

## Batch 4 — Transversais + migração + go-live

### T-020: Central de alertas real + dashboard geral real + cron de metas
- [ ] Substitui mocks: agrega alertas (vencimento, temperatura, N2, meta, descarte)
- [ ] Cron diário: indicador abaixo da meta → alerta
- Validação: badge conta correta; marcar lida por usuário
- Arquivos: app/(app)/alertas/**, dashboard/**, supabase/migrations/0012_alerts_cron.sql

### T-021: Exportação xlsx/pdf — réplica fiel (framework + 2 formulários piloto)
- [ ] exceljs server-side; layout extraído das planilhas reais (FO NSP 003 + 1 LAB)
- [ ] PDF via react-pdf
- Validação: diff visual contra planilha original aprovado pelo usuário
- Arquivos: server/export/**, app/api/export/**
- Depende: arquivos Excel reais [PENDENTE usuário]

### T-022: Exportação — demais formulários (batch por módulo)
- [ ] Todos os formulários FAR/LAB mapeados na importação
- Validação: checklist formulário × exportação

### T-023: Importação Excel histórica (ETL + relatório)
- [ ] Script scripts/import-excel: staging → validação → carga + relatório inconsistências
- [ ] Carga de indicadores, riscos, medicação, congelamento (2000+), meios, N2
- Validação: contagens batem; relatório aprovado pelo usuário
- Depende: arquivos Excel reais [PENDENTE usuário]

### T-024: Hardening go-live — RLS negativo, Security Advisor, deploy Vercel
- [ ] Testes negativos RLS por papel; grep service_role no bundle
- [ ] DEPLOY.md fases 1–5; Security Advisor zero críticos
- Validação: /deploy-check qualidade-clinica

## Matriz de teste

| Task | Teste unit | Teste E2E | Status |
|---|---|---|---|
| T-002 | rls-policies | — | pendente |
| T-003 | route-guard | login | pendente |
| T-004 | audit-trigger | — | pendente |
| T-006 | masks | — | pendente |
| T-007 | indicator-rpc | — | pendente |
| T-008 | target-compare | — | pendente |
| T-010 | risk-grade | — | pendente |
| T-011 | lot-trace | med-controlada | pendente |
| T-014 | range-check | — | pendente |
| T-016 | allocate-atomic | — | pendente |
| T-017 | — | cryo-flow | pendente |
| T-018 | disposal-rpc | — | pendente |
| T-020 | alert-cron | — | pendente |
| T-023 | import-validation | — | pendente |
