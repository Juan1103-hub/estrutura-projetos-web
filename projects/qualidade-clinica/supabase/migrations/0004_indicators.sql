-- Migration 0004: Indicators, targets, entries + confirm RPC

CREATE TABLE indicators (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  module         text NOT NULL CHECK (module IN ('FARMACIA','LABORATORIO')),
  code           text NOT NULL,
  name           text NOT NULL,
  measure_method text,
  unit           text,
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_indicators_module ON indicators(module);

ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY indicators_select_org ON indicators
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY indicators_insert_qualidade ON indicators
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qualidade','admin') AND organization_id = indicators.organization_id)
  );

CREATE POLICY indicators_update_qualidade ON indicators
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qualidade','admin') AND organization_id = indicators.organization_id)
  );

CREATE POLICY indicators_delete_qualidade ON indicators
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qualidade','admin') AND organization_id = indicators.organization_id)
  );

-- 2. Indicator targets
CREATE TABLE indicator_targets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id   uuid NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  target         numeric NOT NULL,
  comparator     text NOT NULL CHECK (comparator IN ('>=', '<=')),
  valid_from     date NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_targets_indicator ON indicator_targets(indicator_id);

ALTER TABLE indicator_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY targets_select_org ON indicator_targets
  FOR SELECT USING (
    indicator_id IN (SELECT id FROM indicators WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
  );

CREATE POLICY targets_insert_qualidade ON indicator_targets
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('qualidade','admin'))
  );

-- 3. Indicator entries
CREATE TABLE indicator_entries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id   uuid NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  month          date NOT NULL CHECK (EXTRACT(DAY FROM month) = 1),
  value          numeric NOT NULL,
  created_by     uuid NOT NULL REFERENCES auth.users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(indicator_id, month)
);

CREATE INDEX idx_entries_indicator ON indicator_entries(indicator_id);
CREATE INDEX idx_entries_month ON indicator_entries(month);

ALTER TABLE indicator_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY entries_select_org ON indicator_entries
  FOR SELECT USING (
    indicator_id IN (SELECT id FROM indicators WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
  );

CREATE POLICY entries_insert_org ON indicator_entries
  FOR INSERT WITH CHECK (
    indicator_id IN (SELECT id FROM indicators WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
  );

-- 4. RPC: confirm indicator entry (atomic, validates target exists)
CREATE OR REPLACE FUNCTION confirm_indicator_entry(
  p_indicator_id uuid,
  p_month date,
  p_value numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_org_id uuid;
  v_target numeric;
  v_comparator text;
BEGIN
  -- Get indicator org
  SELECT organization_id INTO v_org_id FROM public.indicators WHERE id = p_indicator_id;
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Indicador não encontrado';
  END IF;

  -- Check org access
  IF v_org_id != (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Check target exists for this month
  SELECT target, comparator INTO v_target, v_comparator
  FROM public.indicator_targets
  WHERE indicator_id = p_indicator_id AND valid_from <= p_month
  ORDER BY valid_from DESC
  LIMIT 1;

  IF v_target IS NULL THEN
    RAISE EXCEPTION 'Meta não definida para este período. Solicite à qualidade.';
  END IF;

  -- Insert entry (UNIQUE constraint catches duplicate month)
  INSERT INTO public.indicator_entries (indicator_id, month, value, created_by)
  VALUES (p_indicator_id, p_month, p_value, auth.uid());

  -- Return comparison
  RETURN jsonb_build_object(
    'value', p_value,
    'target', v_target,
    'comparator', v_comparator,
    'met', CASE WHEN v_comparator = '>=' THEN p_value >= v_target ELSE p_value <= v_target END
  );
END;
$$;