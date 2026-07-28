-- Migration 0005: Risk matrix

CREATE TABLE risks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sector          text NOT NULL,
  activity        text NOT NULL,
  what_if         text NOT NULL,
  consequence     text,
  severity        integer NOT NULL CHECK (severity BETWEEN 1 AND 5),
  probability     integer NOT NULL CHECK (probability BETWEEN 1 AND 5),
  grade           integer GENERATED ALWAYS AS (severity * probability) STORED,
  contingency     text,
  treatment       text,
  action_plan     text,
  monitoring      text,
  goal            text,
  owner           text,
  review_date     date,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_risks_org ON risks(organization_id);
CREATE INDEX idx_risks_sector ON risks(sector);
CREATE INDEX idx_risks_grade ON risks(grade);

ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY risks_select_org ON risks
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY risks_insert_org ON risks
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY risks_update_org ON risks
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY risks_delete_qualidade ON risks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qualidade','admin') AND organization_id = risks.organization_id)
  );

-- Seed: sample risks
INSERT INTO risks (organization_id, sector, activity, what_if, consequence, severity, probability, contingency, treatment, action_plan, owner) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Farmácia', 'Dispensa de medicamento', 'Dispensar medicamento errado', 'Evento adverso ao paciente', 5, 2, 'Conferência dupla', 'Dupla checagem na dispenssa', 'Implementar checklist de conferência', 'Farmacêutica'),
  ('00000000-0000-0000-0000-000000000001', 'Farmácia', 'Controle de temperatura', 'Falha no monitoramento de temperatura', 'Perda de estabilidade de medicamentos', 4, 3, 'Registro manual diário', 'Calibração semanal dos termômetros', 'Automatizar leituras com alarme', 'Farmacêutica'),
  ('00000000-0000-0000-0000-000000000001', 'Laboratório', 'Criopreservação', 'Vazamento de nitrogênio', 'Perda de amostras', 5, 2, 'Alarme de nível baixo', 'Verificação semanal do nível', 'Sensor automático com alerta remoto', 'Embriologista'),
  ('00000000-0000-0000-0000-000000000001', 'Laboratório', 'Processamento de amostra', 'Troca de amostra', 'Diagnóstico/tratamento incorreto', 5, 2, 'Dupla identificação', 'Protocolo de dupla checagem', 'Implementar leitor código barras', 'Embriologista');