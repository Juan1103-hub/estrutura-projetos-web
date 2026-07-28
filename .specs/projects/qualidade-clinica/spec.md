# SPEC — qualidade-clinica

## Arquitetura

Next.js App Router, route groups `(auth)` e `(app)`. Server Components leem via
Supabase com RLS; mutações passam por Server Actions → RPCs transacionais.
Layout `(app)`: sidebar dark 260px com 2 módulos (Farmácia, Laboratório) +
Dashboard Geral + Central de Alertas + Administração. Seções lazy (`React.lazy`).

```
src/
  app/
    (auth)/login/
    (app)/
      layout.tsx                 # sidebar + providers
      dashboard/                 # RF-017 geral
      alertas/                   # RF-018 central
      farmacia/
        indicadores/             # RF-001..003
        riscos/                  # RF-004/005
        medicacao-controlada/    # RF-006/007
      laboratorio/
        indicadores/             # RF-008 (dashboard consolidado)
        nitrogenio/              # RF-009
        andrologia/              # RF-010
        congelamento/            # RF-011..014 (+ mapa botijão, descarte)
        meios/                   # RF-015
      admin/usuarios/            # RF-016 gestão
  components/ ui/ layout/ forms/ tables/ charts/ alerts/
  lib/ supabase/ utils/ masks/ audit/
  server/ actions/ rpc/ export/  # Server Actions, exportação xlsx/pdf
  types/
supabase/
  migrations/                    # DDL + RLS + triggers + RPCs
  seed/                          # org inicial, faixas, indicadores FAR/LAB
scripts/
  import-excel/                  # AD-008 migração (xlsx → staging → validação → carga)
```

## Schema do banco (resumo)

Todas as tabelas: `organization_id uuid NOT NULL REFERENCES organizations`, RLS por org + papel.

- **organizations**, **profiles** (user_id, role: farmacia|laboratorio|qualidade|admin)
- **patients** (id interno, nome, dados PII), **donors** — mascaramento em listagem; SELECT via RPC com `access_log`
- **consent_records** (subject_type, subject_id, policy_version, purposes, accepted_at) — imutável
- **indicators** (module, code ex. 'FO NSP 003', name, measure_method, unit, active)
- **indicator_targets** (indicator_id, target, comparator(>=|<=), valid_from)
- **indicator_entries** (indicator_id, month date(1º dia), value, created_by) UNIQUE(indicator, month)
- **risks** (sector, activity, what_if, consequence, severity 1–5, probability 1–5, grade GENERATED s×p, contingency, treatment, action_plan, monitoring, goal, owner, review_date)
- **controlled_med_entries** (date, patient_id, medication, lot, quantity, prescription_id, notes, created_by) — índices: lot, patient, date
- **cryo_tanks** (code 'Bot 1'..'Bot 10', group_name, min_level, max_level)
- **nitrogen_readings** (tank_id, week_start, level, out_of_range GENERATED, created_by)
- **equipment** (name, type, min_temp, max_temp, min_humidity, max_humidity)
- **equipment_readings** (equipment_id, date, temperature, humidity, out_of_range GENERATED, created_by)
- **nonconformities** (equipment_id, date, description, action, created_by)
- **semen_samples** (origin: own|donor, trace_code UNIQUE gerado, patient_id/donor fields, straws, collected_at, pregnancy_result, birth_date, birth_weight, donor_bank, technique ICSI|IIU, sg_weeks, status active|disposal_pending|discarded)
- **cryo_locations** (tank_id, rack, canister, position, sample_id NULL=livre, UNIQUE(tank,rack,canister,position))
- **disposal_requests** (sample_id, reason, requested_by, requested_at, status, approved_by, approved_at, term_path Storage)
- **supplies_receipts** (supplier, item, received_at, lot, expires_at, receipt_temp, appearance, responsible) — índice expires_at
- **alerts** (type, severity, title, message, ref_table, ref_id, due_at, read_by[]) — gerados por trigger/cron
- **audit_log** (table_name, record_id, action, old JSONB, new JSONB, user_id, at) — imutável, trigger genérico
- **access_log** (user_id, table_name, record_id, at) — leitura de PII

RPCs: `confirm_indicator_entry`, `request_disposal`, `approve_disposal` (exige term_path),
`reject_disposal`, `confirm_nitrogen_week`, `register_equipment_reading` (gera alerta se fora),
`receive_supply`, `allocate_sample_location` (atômico: ocupa posição + grava amostra),
`expire_alerts_daily` (cron: meios vencendo em 30/15/7 dias, metas descumpridas, descartes pendentes).

## UI/UX

- Dashboard geral: cards de indicadores fora da meta (2 módulos), alertas abertos por severidade, gráficos resumo.
- Indicadores (FAR/LAB): tabela mensal (12 meses × meta) + destaque vermelho fora da meta + Chart.js linha/barra + filtro período. LAB: grid consolidado de cards por indicador.
- Riscos: tabela com semáforo (grade 1–6 baixo / 8–12 médio / 15–25 alto — confirmar faixas na importação), filtros setor/grau.
- Medicação controlada: abas por medicamento (dinâmico), cadastro rápido, busca paciente/lote/período; listagem mascara nome do paciente (ex.: `M***a S***a`).
- Mapa do botijão: seletor Bot → grid rack × caçapa com células livre/ocupada; clique mostra amostra (trace_code, paciente mascarado).
- Congelamento: tabela paginada server-side (2000+), filtros; cadastro gera trace_code (ex.: `AMO-2026-000123`); botão "Solicitar descarte" → modal com motivo; aprovador vê fila com upload do termo.
- Alertas: central com filtros tipo/severidade/lidas; badge na sidebar com contagem.
- Estados: skeleton loading, empty states com ícone, erros inline PT-BR, toasts (sonner).

## Edge Cases

- Lançamento de indicador duplicado no mês → UNIQUE + mensagem; correção via retificação (nova versão, audit).
- Meta sem vigência para o mês → bloqueia lançamento com aviso à qualidade.
- Temperatura/N2 fora da faixa → registro salvo + alerta crítico + sugestão de não conformidade.
- Ocupação dupla de posição no botijão → UNIQUE violation → RPC retorna erro amigável.
- Aprovação de descarte sem termo → RPC rejeita (`term_path` obrigatório).
- Amostra com gravidez confirmada → exige confirmação extra antes de descarte.
- Meio vencido sem uso → alerta diário até baixa/descarte; expurgo nunca remove histórico clínico.
- Importação com linhas inválidas → relatório por aba/linha, sem carga parcial por arquivo.
- Usuário troca de papel → RLS imediata; sessões antigas invalidadas.
- Mascaramento: relatórios internos completos; telas de listagem mascaram; RPC de detalhe exige papel clínico e gera access_log.

## Pendências

- [PENDENTE]: faixas do semáforo de risco, limites de botijões/equipamentos e metas — das planilhas reais.
- [PENDENTE]: formato do trace_code e códigos de formulário — confirmados na importação.
