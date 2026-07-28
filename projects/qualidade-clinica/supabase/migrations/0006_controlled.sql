-- Migration 0006: Controlled medication tracking

CREATE TABLE controlled_med_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id    uuid REFERENCES patients(id),
  medication    text NOT NULL,
  lot           text NOT NULL,
  quantity      numeric NOT NULL CHECK (quantity > 0),
  unit          text NOT NULL DEFAULT 'ampola',
  prescription_id text,
  notes         text,
  entry_date    date NOT NULL DEFAULT CURRENT_DATE,
  created_by    uuid NOT NULL REFERENCES auth.users(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cme_medication ON controlled_med_entries(medication);
CREATE INDEX idx_cme_lot ON controlled_med_entries(lot);
CREATE INDEX idx_cme_patient ON controlled_med_entries(patient_id);
CREATE INDEX idx_cme_date ON controlled_med_entries(entry_date);
CREATE INDEX idx_cme_org ON controlled_med_entries(organization_id);

ALTER TABLE controlled_med_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY cme_select_org ON controlled_med_entries
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY cme_insert_org ON controlled_med_entries
  FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY cme_update_org ON controlled_med_entries
  FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Seed: sample medications
INSERT INTO controlled_med_entries (organization_id, medication, lot, quantity, unit, entry_date, created_by)
SELECT
  '00000000-0000-0000-0000-000000000001',
  m.med,
  m.lot,
  m.qty,
  m.unit,
  m.dt,
  (SELECT id FROM auth.users LIMIT 1)
FROM (VALUES
  ('Propofol 10mg/mL', 'LOT-2026-001', 50, 'ampola', '2026-01-15'::date),
  ('Propofol 10mg/mL', 'LOT-2026-001', 30, 'ampola', '2026-02-10'::date),
  ('Fentanila 0,05mg/mL', 'LOT-2026-002', 20, 'ampola', '2026-01-20'::date),
  ('Midazolam 5mg/mL', 'LOT-2026-003', 15, 'ampola', '2026-03-05'::date)
) AS m(med, lot, qty, unit, dt)
WHERE EXISTS (SELECT 1 FROM auth.users); -- only seed if auth user exists