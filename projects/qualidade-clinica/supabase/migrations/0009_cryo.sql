-- Migration 0009: Cryo — freezing records + tank map

CREATE TABLE freezing_records (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name    text NOT NULL,
  record_type     text NOT NULL CHECK (record_type IN ('oocyte', 'embryo', 'sperm')),
  material_qty    integer NOT NULL CHECK (material_qty > 0),
  tank_id         uuid REFERENCES cryo_tanks(id) ON DELETE SET NULL,
  storage_date    date NOT NULL DEFAULT CURRENT_DATE,
  responsible     text NOT NULL,
  notes           text,
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_freezing_tank ON freezing_records(tank_id);
CREATE INDEX idx_freezing_date ON freezing_records(storage_date);

ALTER TABLE freezing_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY freeze_select ON freezing_records FOR SELECT USING (true);
CREATE POLICY freeze_insert ON freezing_records FOR INSERT WITH CHECK (true);
CREATE POLICY freeze_update ON freezing_records FOR UPDATE USING (true);

CREATE TABLE tank_cells (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tank_id         uuid NOT NULL REFERENCES cryo_tanks(id) ON DELETE CASCADE,
  cell_row        integer NOT NULL,
  cell_col        integer NOT NULL,
  recording_id    uuid REFERENCES freezing_records(id) ON DELETE SET NULL,
  label           text,
  UNIQUE(tank_id, cell_row, cell_col)
);

CREATE INDEX idx_cells_tank ON tank_cells(tank_id);

ALTER TABLE tank_cells ENABLE ROW LEVEL SECURITY;
CREATE POLICY cells_select ON tank_cells FOR SELECT USING (true);
CREATE POLICY cells_insert ON tank_cells FOR INSERT WITH CHECK (true);
CREATE POLICY cells_update ON tank_cells FOR UPDATE USING (true);