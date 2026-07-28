# STATE.md — qualidade-clinica

> Project memory: Decisions log (AD-NNN) + Handoff snapshot.

## Decisions

- AD-001: organization_id em todas as tabelas + RLS por org (multi-unidade ready, 1 org inicial)
- AD-002: Indicadores cadastráveis (indicators + indicator_targets vigência + indicator_entries)
- AD-003: Grau de risco = severidade × probabilidade calculado no banco
- AD-004: cryo_locations com UNIQUE de ocupação (mapa do botijão real)
- AD-005: Descarte via disposal_requests + termo em Storage privado (2 níveis)
- AD-006: Alertas somente in-app (tabela alerts + cron diário)
- AD-007: audit_log via triggers + access_log para leitura de PII
- AD-008: Importação via script ETL 1× (não é feature de UI)
- AD-009: Exportação = réplica fiel das planilhas (exceljs server-side + react-pdf)
- AD-010: PII isolada em patients/donors, mascaramento em listagens
- AD-011: Soft-delete + expurgo por prazo legal (CFM ≥ 20 anos)
- AD-012: Mutações multi-item via RPC transacional
- AD-013: Stack Next.js 16 + Supabase, sem ORM (Supabase JS + RPC), sem template pronto
- AD-014: Dados LGPD identificados + consentimento versionado (consent_records)

## Handoff

### Current State
- **Fase atual:** Planning concluído — AGUARDANDO APROVAÇÃO
- **Aguardando:** comando `APROVAR PLANO E INICIAR` do usuário

### Artifacts
- `.specs/projects/qualidade-clinica/prd.md`
- `.specs/projects/qualidade-clinica/tech-decisions.md`
- `.specs/projects/qualidade-clinica/spec.md`
- `.specs/projects/qualidade-clinica/tasks.md`
- `.specs/projects/qualidade-clinica/sprint-validator.md`

### Pendências do usuário
- Fornecer arquivos Excel FAR e LAB (necessários a partir de T-021/T-023; batches 1–3 não bloqueiam)
- Confirmar papel "auditor (somente leitura)" no MVP
- Fornecer texto da política de privacidade / termo de consentimento

### Resume Instructions
Se aprovado: iniciar Batch 1 na T-001 (bootstrap). 24 tasks / 4 batches.
Antes de codar: ler spec.md + tasks.md; ofertar workers sub-agent (24 tasks > 8).

## Lessons

(vazio até Validator registrar lições)
