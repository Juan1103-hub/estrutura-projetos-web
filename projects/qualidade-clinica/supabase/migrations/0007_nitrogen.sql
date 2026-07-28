-- Migration 0007: Nitrogen — cryo_tanks + weekly readings

CREATE TABLE cryo_tanks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code            text NOT NULL,
  group_name      text NOT NULL,
  min_level       numeric NOT NULL,
  max_level       numeric NOT NULL,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_tanks_org ON cryo_tanks(organization_id);

ALTER TABLE cryo_tanks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tanks_select ON cryo_tanks FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY tanks_insert ON cryo_tanks FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY tanks_update ON cryo_tanks FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE TABLE nitrogen_readings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id         uuid NOT NULL REFERENCES cryo_tanks(id) ON DELETE CASCADE,
  week_start      date NOT NULL CHECK (EXTRACT(DOW FROM week_start) = 1),
  level           numeric NOT NULL,
  out_of_range    boolean GENERATED ALWAYS AS (
    level < (SELECT min_level FROM cryo_tanks WHERE id = tank_id)
    OR level > (SELECT max_level FROM cryo_tanks WHERE id = tank_id)
  ) STORED,
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tank_id, week_start)
);

CREATE INDEX idx_readings_tank ON nitrogen_readings(tank_id);
CREATE INDEX idx_readings_week ON nitrogen_readings(week_start);

ALTER TABLE nitrogen_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY readings_select ON nitrogen_readings FOR SELECT USING (true);
CREATE POLICY readings_insert ON nitrogen_readings FOR INSERT WITH CHECK (true);

-- Seed: 10 tanks
INSERT INTO cryo_tanks (organization_id, code, group_name, min_level, max_level) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Bot 1', 'Congelamento', 10, 100),
  ('00000000-0000-0000-0000-000000000001', 'Bot 2', 'Congelamento', 10, 100),
  ('00000000-0000-0000-0000-000000000001', 'Bot 3', 'Congelamento', 10, 100),
  ('00000000-0000-0000-0000-000000000001', 'Bot 4', 'Congelamento', 10, 100),
  ('00000000-0000-0000-0000-000000000001', 'Bot 5', 'Congelamento', 10, 100),
  ('00000000-0000-0000-0000-000000000001', 'Bot 6', 'Sêmen Fresco', 15, 95),
  ('00000000-0000-0000-0000-000000000001', 'Bot 7', 'Sêmen Fresco', 15, 95),
  ('00000000-0000-0000-0000-000000000001', 'Bot 8', 'Meios', 20, 90),
  ('00000000-0000-0000-0000-000000000001', 'Bot 9', 'Meios', 20, 90),
  ('00000000-0000-0000-0000-000000000001', 'Bot 10', 'Reserva', 5, 100);