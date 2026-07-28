-- Migration 0002: Audit log, access log, consent records

-- 1. Audit log (generic change tracking)
CREATE TABLE audit_log (
  id          bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  table_name  text NOT NULL,
  record_id   uuid NOT NULL,
  action      text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  changed_by  uuid NOT NULL REFERENCES auth.users(id),
  changed_at  timestamptz NOT NULL DEFAULT now(),
  old_data    jsonb,
  new_data    jsonb,
  ip_address  inet
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only see audit logs of their org (via profile)
CREATE POLICY audit_select_org ON audit_log
  FOR SELECT
  USING (
    changed_by IN (
      SELECT id FROM profiles
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- 2. Access log (who viewed PII)
CREATE TABLE access_log (
  id           bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id      uuid NOT NULL REFERENCES auth.users(id),
  table_name   text NOT NULL,
  record_id    uuid NOT NULL,
  accessed_at  timestamptz NOT NULL DEFAULT now(),
  ip_address   inet,
  user_agent   text
);

CREATE INDEX idx_access_log_user ON access_log(user_id);
CREATE INDEX idx_access_log_record ON access_log(record_id);
CREATE INDEX idx_access_log_table ON access_log(table_name);
CREATE INDEX idx_access_log_accessed_at ON access_log(accessed_at);

ALTER TABLE access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY access_log_select_org ON access_log
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM profiles
      WHERE organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- 3. Consent records (LGPD)
CREATE TYPE consent_purpose AS ENUM (
  'tratamento_clinico',
  'gestao_qualidade',
  'pesquisa_cientifica',
  'marketing'
);

CREATE TABLE consent_records (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     uuid,  -- will reference patients table (T-006)
  purpose        consent_purpose NOT NULL,
  policy_version text NOT NULL,
  consented_at   timestamptz NOT NULL DEFAULT now(),
  revoked_at     timestamptz,
  ip_address     inet,
  user_agent     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_consent_patient ON consent_records(patient_id);
CREATE INDEX idx_consent_purpose ON consent_records(purpose);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Only qualidade/admin can manage consent records
CREATE POLICY consent_select_org ON consent_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('qualidade','admin')
      AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY consent_insert_qualidade ON consent_records
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('qualidade','admin')
      AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- 4. Trigger function for automatic audit on any table
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, changed_by, old_data)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, changed_by, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, changed_by, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- 5. Helper function: log PII access
CREATE OR REPLACE FUNCTION log_access(
  p_table_name text,
  p_record_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.access_log (user_id, table_name, record_id, ip_address, user_agent)
  VALUES (
    auth.uid(),
    p_table_name,
    p_record_id,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$;