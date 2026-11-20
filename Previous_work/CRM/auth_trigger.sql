-- ============================================================
-- Supabase Auth Trigger to auto-sync users to public tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create the function that handles the sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if the user is a Company (HR) based on metadata
  IF (NEW.raw_user_meta_data->>'is_hr')::boolean = true THEN
    INSERT INTO public.companies (id, name, email, company_code, password_hash)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'Unknown Company'),
      NEW.email,
      'LOAN-' || upper(substring(md5(random()::text) from 1 for 6)),
      'managed_by_supabase_auth'
    )
    ON CONFLICT (id) DO NOTHING;

  -- Otherwise, check if the user is an Employee based on metadata
  ELSIF (NEW.raw_user_meta_data->>'isEmployee')::boolean = true THEN
    INSERT INTO public.employees (id, company_id, full_name, email, phone, role)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'company_id')::uuid,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
    )
    ON CONFLICT (id) DO NOTHING;
  
  -- Fallback: If metadata isn't set (e.g. manual creation in Dashboard), create an employee by default without company_id
  ELSE
    INSERT INTO public.employees (id, full_name, email, role)
    VALUES (
      NEW.id,
      'Dashboard User',
      NEW.email,
      'employee'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
