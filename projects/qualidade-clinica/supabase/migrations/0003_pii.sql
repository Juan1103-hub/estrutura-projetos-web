-- Migration 0003: PII — patients, donors, masking, detail RPC

-- 1. Patients
CREATE TABLE patients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  cpf             text,
  rg              text,
  birth_date      date,
  phone           text,
  email           text,
  address_street  text,
  address_number  text,
  address_city    text,
  address_state   text,
  notes           text,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_org ON patients(organization_id);
CREATE INDEX idx_patients_name ON patients(name);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY patients_select_org ON patients
  FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY patients_insert_org ON patients
  FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY patients_update_org ON patients
  FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY patients_delete_admin ON patients
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND organization_id = patients.organization_id
    )
  );

-- 2. Donors
CREATE TABLE donors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  cpf             text,
  rg              text,
  birth_date      date,
  blood_type      text,
  cmv             text,
  genetic_tests   text,
  notes           text,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_donors_org ON donors(organization_id);
CREATE INDEX idx_donors_code ON donors(code);

ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

CREATE POLICY donors_select_org ON donors
  FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY donors_insert_org ON donors
  FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY donors_update_org ON donors
  FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY donors_delete_admin ON donors
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND organization_id = donors.organization_id
    )
  );

-- 3. Masked view for patients (listing)
CREATE VIEW patients_masked AS
SELECT
  id,
  organization_id,
  CASE
    WHEN name IS NULL THEN NULL
    ELSE left(name, 1) || repeat('*', length(name) - 2) || right(name, 1)
  END AS name_masked,
  CASE
    WHEN cpf IS NULL THEN NULL
    ELSE '***.' || substring(cpf, 5, 3) || '.' || substring(cpf, 9, 3) || '-**'
  END AS cpf_masked,
  CASE
    WHEN rg IS NULL THEN NULL
    ELSE repeat('*', length(rg) - 2) || right(rg, 2)
  END AS rg_masked,
  birth_date,
  CASE
    WHEN phone IS NULL THEN NULL
    ELSE '(' || substring(phone, 1, 2) || ') ****-' || right(phone, 4)
  END AS phone_masked,
  active,
  created_at
FROM patients;

ALTER VIEW patients_masked SET (security_invoker = true);

-- 4. Masked view for donors (listing)
CREATE VIEW donors_masked AS
SELECT
  id,
  organization_id,
  code,
  CASE
    WHEN name IS NULL THEN NULL
    ELSE left(name, 1) || repeat('*', length(name) - 2) || right(name, 1)
  END AS name_masked,
  CASE
    WHEN cpf IS NULL THEN NULL
    ELSE '***.' || substring(cpf, 5, 3) || '.' || substring(cpf, 9, 3) || '-**'
  END AS cpf_masked,
  blood_type,
  cmv,
  active,
  created_at
FROM donors;

ALTER VIEW donors_masked SET (security_invoker = true);

-- 5. RPC: get patient detail (logs access)
CREATE OR REPLACE FUNCTION get_patient_detail(p_patient_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_patient jsonb;
  v_user_org uuid;
  v_patient_org uuid;
BEGIN
  -- Get user's org
  SELECT organization_id INTO v_user_org FROM public.profiles WHERE id = auth.uid();
  IF v_user_org IS NULL THEN
    RAISE EXCEPTION 'Acesso negado' USING HINT = 'Usuário sem organização';
  END IF;

  -- Get patient's org + check access
  SELECT organization_id, to_jsonb(patients.*) INTO v_patient_org, v_patient
  FROM public.patients WHERE id = p_patient_id;

  IF v_patient IS NULL THEN
    RAISE EXCEPTION 'Paciente não encontrado';
  END IF;

  IF v_patient_org != v_user_org THEN
    RAISE EXCEPTION 'Acesso negado' USING HINT = 'Paciente não pertence à sua organização';
  END IF;

  -- Log access
  INSERT INTO public.access_log (user_id, table_name, record_id)
  VALUES (auth.uid(), 'patients', p_patient_id);

  RETURN v_patient;
END;
$$;

-- 6. RPC: get donor detail (logs access)
CREATE OR REPLACE FUNCTION get_donor_detail(p_donor_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_donor jsonb;
  v_user_org uuid;
  v_donor_org uuid;
BEGIN
  SELECT organization_id INTO v_user_org FROM public.profiles WHERE id = auth.uid();
  IF v_user_org IS NULL THEN
    RAISE EXCEPTION 'Acesso negado' USING HINT = 'Usuário sem organização';
  END IF;

  SELECT organization_id, to_jsonb(donors.*) INTO v_donor_org, v_donor
  FROM public.donors WHERE id = p_donor_id;

  IF v_donor IS NULL THEN
    RAISE EXCEPTION 'Doador não encontrado';
  END IF;

  IF v_donor_org != v_user_org THEN
    RAISE EXCEPTION 'Acesso negado' USING HINT = 'Doador não pertence à sua organização';
  END IF;

  INSERT INTO public.access_log (user_id, table_name, record_id)
  VALUES (auth.uid(), 'donors', p_donor_id);

  RETURN v_donor;
END;
$$;