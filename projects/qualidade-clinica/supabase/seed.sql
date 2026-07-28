-- Seed: 4 FAR indicators + targets (placeholders — substituir na importação real)
-- Organization ID: 00000000-0000-0000-0000-000000000001

INSERT INTO indicators (organization_id, module, code, name, measure_method, unit) VALUES
  ('00000000-0000-0000-0000-000000000001', 'FARMACIA', 'FO NSP 003', 'Percentual de Dispensas Corretas', 'Total dispensas corretas / total dispensas × 100', '%'),
  ('00000000-0000-0000-0000-000000000001', 'FARMACIA', 'FO NSP XXX', 'Tempo Médio de Atendimento', 'Soma dos tempos de atendimento / total atendimentos', 'min'),
  ('00000000-0000-0000-0000-000000000001', 'FARMACIA', 'FO NSP XXX', 'Taxa de Erros de Medicação', 'Total erros / total dispensas × 100', '%'),
  ('00000000-0000-0000-0000-000000000001', 'FARMACIA', 'FO NSP XXX', 'Controle de Temperatura Ambiente', 'Dias dentro da faixa / total dias do mês × 100', '%');

-- Targets (valid from Jan 2026)
INSERT INTO indicator_targets (indicator_id, target, comparator, valid_from)
SELECT id, 98, '>=', '2026-01-01' FROM indicators WHERE code = 'FO NSP 003';

INSERT INTO indicator_targets (indicator_id, target, comparator, valid_from)
SELECT id, 30, '<=', '2026-01-01' FROM indicators WHERE code LIKE 'FO NSP XXX' AND name = 'Tempo Médio de Atendimento';

INSERT INTO indicator_targets (indicator_id, target, comparator, valid_from)
SELECT id, 0, '<=', '2026-01-01' FROM indicators WHERE code LIKE 'FO NSP XXX' AND name = 'Taxa de Erros de Medicação';

INSERT INTO indicator_targets (indicator_id, target, comparator, valid_from)
SELECT id, 90, '>=', '2026-01-01' FROM indicators WHERE code LIKE 'FO NSP XXX' AND name = 'Controle de Temperatura Ambiente';