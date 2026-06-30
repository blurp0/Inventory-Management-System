-- ============================================================
-- Phase 3 Migration — Run this ENTIRE file in Supabase SQL Editor
-- Copy everything below and paste it all at once.
-- ============================================================

-- 1. Create the warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  location    TEXT,
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add warehouse_id FK to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL;

-- 3. Enable RLS on warehouses
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4b. Expand the role check constraint to include 'manager'.
--     The original constraint only allowed 'admin' and 'viewer'.
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('admin', 'manager', 'viewer'));

-- 5. Create the is_admin() helper FIRST so policies can reference it.
--    SECURITY DEFINER bypasses RLS inside the function, breaking the
--    self-reference deadlock that caused "violates row-level security policy".
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = uid AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- 6. RLS policies for warehouses
DROP POLICY IF EXISTS "Authenticated users can read warehouses" ON warehouses;
CREATE POLICY "Authenticated users can read warehouses"
  ON warehouses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert warehouses" ON warehouses;
CREATE POLICY "Admins can insert warehouses"
  ON warehouses FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update warehouses" ON warehouses;
CREATE POLICY "Admins can update warehouses"
  ON warehouses FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete warehouses" ON warehouses;
CREATE POLICY "Admins can delete warehouses"
  ON warehouses FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- 7. RLS policies for user_roles
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert user_roles" ON user_roles;
CREATE POLICY "Admins can insert user_roles"
  ON user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update user_roles" ON user_roles;
CREATE POLICY "Admins can update user_roles"
  ON user_roles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete user_roles" ON user_roles;
CREATE POLICY "Admins can delete user_roles"
  ON user_roles FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- 8. Drop the duplicate users_with_roles VIEW (both name spellings).
--    It was created as a VIEW, not a table, so DROP VIEW is correct.
DROP VIEW IF EXISTS public.users_with_roles CASCADE;
DROP VIEW IF EXISTS public.user_with_roles CASCADE;

-- 9. Create get_users_with_roles() RPC function.
--    The app calls supabase.rpc('get_users_with_roles') to list all users.
--    SECURITY DEFINER allows it to read auth.users safely.
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE(user_id uuid, email text, role text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    au.id                       AS user_id,
    au.email                    AS email,
    COALESCE(ur.role, 'viewer') AS role
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON ur.user_id = au.id
  ORDER BY au.email;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;

-- 10. Seed every existing auth user that has no user_roles row yet.
--     This makes all accounts visible in the Role Management tab.
INSERT INTO user_roles (user_id, role)
SELECT id, 'viewer'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- 11. Trigger: auto-insert a viewer row for every future signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
