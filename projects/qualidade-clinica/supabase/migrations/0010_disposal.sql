-- Migration 0010: Disposal — 2-level categories + disposal terms

CREATE TABLE disposal_categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  color           text NOT NULL DEFAULT 'zinc',
  parent_id       uuid REFERENCES disposal_categories(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'))
);

ALTER TABLE disposal_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY dc_select ON disposal_categories FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY dc_insert ON disposal_categories FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY dc_update ON disposal_categories FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE TABLE disposal_terms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid NOT NULL REFERENCES disposal_categories(id) ON DELETE CASCADE,
  reference_date  date NOT NULL DEFAULT CURRENT_DATE,
  quantity        numeric NOT NULL CHECK (quantity > 0),
  unit            text NOT NULL DEFAULT 'un',
  method          text NOT NULL,
  responsible     text NOT NULL,
  notes           text,
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_terms_category ON disposal_terms(category_id);
CREATE INDEX idx_terms_date ON disposal_terms(reference_date);

ALTER TABLE disposal_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY dt_select ON disposal_terms FOR SELECT USING (true);
CREATE POLICY dt_insert ON disposal_terms FOR INSERT WITH CHECK (true);

-- Seed 2-level categories
INSERT INTO disposal_categories (organization_id, name, description, color, parent_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Biológico', 'Resíduos biológicos', 'red', NULL);
WITH bio AS (SELECT id FROM disposal_categories WHERE name = 'Biológico')
INSERT INTO disposal_categories (organization_id, name, description, color, parent_id)
  SELECT '00000000-0000-0000-0000-000000000001', name, descr, color, bio.id FROM bio, (VALUES
    ('Sangue', 'Amostras de sangue e derivados', 'rose'),
    ('Urina', 'Amostras de urina', 'amber'),
    ('Sêmen', 'Amostras e resíduos de sêmen', 'blue'),
    ('Embrides', 'Embriões descartados', 'violet'),
    ('Meios de Cultura', 'Meios vencidos ou contaminados', 'slate')
  ) AS t(name, descr, color);

INSERT INTO disposal_categories (organization_id, name, description, color, parent_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Químico', 'Resíduos químicos', 'orange', NULL);
WITH chem AS (SELECT id FROM disposal_categories WHERE name = 'Químico')
INSERT INTO disposal_categories (organization_id, name, description, color, parent_id)
  SELECT '00000000-0000-0000-0000-000000000001', name, descr, color, chem.id FROM chem, (VALUES
    ('Reagentes', 'Reagentes vencidos ou não utilizados', 'yellow'),
    ('Solventes', 'Solventes orgânicos', 'amber'),
    ('Óleos', 'Óleos e graxas', 'stone')
  ) AS t(name, descr, color);