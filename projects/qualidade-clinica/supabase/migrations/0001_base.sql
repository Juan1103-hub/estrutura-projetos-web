-- Migration 0001: Base schema — organizations, profiles, auth

-- 1. Role type
CREATE TYPE user_role AS ENUM ('farmacia', 'laboratorio', 'qualidade', 'admin');

-- 2. Organizations
CREATE TABLE organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. Profiles (extends auth.users)
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'farmacia',
  display_name    text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_org ON profiles(organization_id);

-- 4. Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  default_org_id uuid;
BEGIN
  -- Assign to first organization (single org setup; multi-org later)
  SELECT id INTO default_org_id FROM public.organizations ORDER BY created_at LIMIT 1;

  INSERT INTO public.profiles (id, organization_id, role, display_name)
  VALUES (
    NEW.id,
    default_org_id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'farmacia'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage organizations
CREATE POLICY org_admin_all ON organizations
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND organization_id = id)
  );

-- Users see org they belong to
CREATE POLICY org_select_own ON organizations
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND organization_id = id)
  );

-- Profiles: users see their own org members
CREATE POLICY profiles_select_org ON profiles
  FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Users can update own profile (but not role)
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can manage all profiles in their org
CREATE POLICY profiles_admin_all ON profiles
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND organization_id = profiles.organization_id)
  );