-- Migration 0011: Supplies — media/supplies control + expiry

CREATE TABLE supplies (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                text NOT NULL,
  category            text NOT NULL DEFAULT 'media',
  batch               text,
  expiry_date         date NOT NULL,
  lot_entry_date      date NOT NULL DEFAULT CURRENT_DATE,
  expected_qty        integer NOT NULL CHECK (expected_qty > 0),
  current_qty         integer NOT NULL CHECK (current_qty >= 0),
  unit                text NOT NULL DEFAULT 'un',
  manufacturer        text,
  supplier            text,
  storage_location    text,
  notes               text,
  created_by          uuid NOT NULL REFERENCES auth.users(id),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_supplies_org ON supplies(organization_id);
CREATE INDEX idx_supplies_expiry ON supplies(expiry_date);
CREATE INDEX idx_supplies_category ON supplies(category);

ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
CREATE POLICY sup_select ON supplies FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY sup_insert ON supplies FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY sup_update ON supplies FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Seed supplies
INSERT INTO supplies (organization_id, name, category, batch, expiry_date, lot_entry_date, expected_qty, current_qty, unit, manufacturer) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Global Total LP', 'media', 'GT-2025-01', '2026-06-15', '2025-01-10', 10, 8, 'fr', 'Vitrolife'),
  ('00000000-0000-0000-0000-000000000001', 'Gamete Buffer', 'media', 'GB-2025-02', '2026-03-20', '2025-02-01', 5, 3, 'fr', 'Vitrolife'),
  ('00000000-0000-0000-0000-000000000001', 'Oil for Tissue Culture', 'media', 'OIL-2024-03', '2025-12-01', '2024-03-15', 12, 5, 'fr', 'Irvine'),
  ('00000000-0000-0000-0000-000000000001', 'Ponteiras 1000µL', 'consumable', 'P1000-2025', '2026-12-31', '2025-01-05', 100, 85, 'cx', 'LabPlast'),
  ('00000000-0000-0000-0000-000000000001', 'Ponteiras 200µL', 'consumable', 'P200-2025', '2026-12-31', '2025-01-05', 100, 92, 'cx', 'LabPlast'),
  ('00000000-0000-0000-0000-000000000001', 'Placas Petri', 'consumable', 'PETRI-2025', '2026-09-30', '2025-03-01', 30, 22, 'un', 'Falcon'),
  ('00000000-0000-0000-0000-000000000001', 'Criotubos 2mL', 'consumable', 'CRYO-2025', '2027-01-31', '2025-04-01', 200, 180, 'un', 'Nunc');