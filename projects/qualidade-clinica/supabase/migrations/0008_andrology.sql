-- Migration 0008: Andrology — equipment + daily readings + nonconformities

CREATE TABLE equipment (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  equipment_type  text NOT NULL,
  min_temp        numeric,
  max_temp        numeric,
  min_humidity    numeric,
  max_humidity    numeric,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY equip_select ON equipment FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY equip_insert ON equipment FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY equip_update ON equipment FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE TABLE equipment_readings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id    uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  reading_date    date NOT NULL DEFAULT CURRENT_DATE,
  temperature     numeric,
  humidity        numeric,
  out_of_range    boolean GENERATED ALWAYS AS (
    (temperature IS NOT NULL AND equipment_id IN (SELECT id FROM equipment WHERE min_temp IS NOT NULL)
      AND (temperature < (SELECT min_temp FROM equipment WHERE id = equipment_id)
        OR temperature > (SELECT max_temp FROM equipment WHERE id = equipment_id)))
    OR
    (humidity IS NOT NULL AND equipment_id IN (SELECT id FROM equipment WHERE min_humidity IS NOT NULL)
      AND (humidity < (SELECT min_humidity FROM equipment WHERE id = equipment_id)
        OR humidity > (SELECT max_humidity FROM equipment WHERE id = equipment_id)))
  ) STORED,
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(equipment_id, reading_date)
);

CREATE INDEX idx_readings_equip ON equipment_readings(equipment_id);
CREATE INDEX idx_readings_date ON equipment_readings(reading_date);

ALTER TABLE equipment_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY eqread_select ON equipment_readings FOR SELECT USING (true);
CREATE POLICY eqread_insert ON equipment_readings FOR INSERT WITH CHECK (true);

CREATE TABLE nonconformities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id    uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  reading_date    date NOT NULL,
  description     text NOT NULL,
  action_taken    text,
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nonconformities ENABLE ROW LEVEL SECURITY;
CREATE POLICY nc_select ON nonconformities FOR SELECT USING (true);
CREATE POLICY nc_insert ON nonconformities FOR INSERT WITH CHECK (true);

-- Seed equipment
INSERT INTO equipment (organization_id, name, equipment_type, min_temp, max_temp, min_humidity, max_humidity) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Estufa 1', 'Estufa', 36.5, 37.5, NULL, NULL),
  ('00000000-0000-0000-0000-000000000001', 'Estufa 2', 'Estufa', 36.5, 37.5, NULL, NULL),
  ('00000000-0000-0000-0000-000000000001', 'Placa Aquecedora 1', 'Placa', 36.0, 38.0, NULL, NULL),
  ('00000000-0000-0000-0000-000000000001', 'Fluxo Laminar 1', 'Fluxo', NULL, NULL, 40, 60),
  ('00000000-0000-0000-0000-000000000001', 'Sala de Laboratório', 'Ambiente', 20, 25, 40, 60),
  ('00000000-0000-0000-0000-000000000001', 'Sala de Criopreservação', 'Ambiente', 18, 22, 30, 50);