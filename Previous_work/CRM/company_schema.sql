-- ============================================================
-- LoanCRM – Company Multi-Tenant Schema
-- Run ALL of this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kzsxlveehfjhugyarqks/sql/new
-- ============================================================

-- ── 1. COMPANIES TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.companies (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  company_code  TEXT NOT NULL UNIQUE,
  plan          TEXT DEFAULT 'free',
  created_at    TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Auth can manage companies" ON public.companies;
CREATE POLICY "Anon can manage companies" ON public.companies FOR ALL TO anon          USING (true) WITH CHECK (true);
CREATE POLICY "Auth can manage companies" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 2. EMPLOYEES TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employees (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id    UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  role          TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
-- If the table already existed from before, add the column
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Auth can manage employees" ON public.employees;
CREATE POLICY "Anon can manage employees" ON public.employees FOR ALL TO anon          USING (true) WITH CHECK (true);
CREATE POLICY "Auth can manage employees" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 3. ACTIVITY LOGS TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id     UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id    UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name  TEXT,
  action         TEXT NOT NULL,
  description    TEXT,
  metadata       JSONB,
  created_at     TIMESTAMPTZ DEFAULT now()
);
-- If the table already existed from before, add the column
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can manage activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Auth can manage activity_logs" ON public.activity_logs;
CREATE POLICY "Anon can manage activity_logs" ON public.activity_logs FOR ALL TO anon          USING (true) WITH CHECK (true);
CREATE POLICY "Auth can manage activity_logs" ON public.activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 4. ADD company columns to existing tables ─────────────────────────────────
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_id             UUID REFERENCES public.companies(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_employee_id   UUID;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_employee_name TEXT;

ALTER TABLE public.call_logs ADD COLUMN IF NOT EXISTS company_id    UUID REFERENCES public.companies(id);
ALTER TABLE public.call_logs ADD COLUMN IF NOT EXISTS employee_id   UUID REFERENCES public.employees(id) ON DELETE SET NULL;
ALTER TABLE public.call_logs ADD COLUMN IF NOT EXISTS employee_name TEXT;

-- ── 5. ALLOW ANON on all existing tables ─────────────────────────────────────
-- PostgreSQL does NOT support CREATE POLICY IF NOT EXISTS.
-- Use DROP + CREATE pattern to make it safe to re-run.

DROP POLICY IF EXISTS "Anon can manage leads"       ON public.leads;
DROP POLICY IF EXISTS "Anon can manage call_logs"   ON public.call_logs;
DROP POLICY IF EXISTS "Anon can manage documents"   ON public.documents;
DROP POLICY IF EXISTS "Anon can manage eligibility" ON public.eligibility;
DROP POLICY IF EXISTS "Anon can manage notes"       ON public.notes;

CREATE POLICY "Anon can manage leads"       ON public.leads       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage call_logs"   ON public.call_logs   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage documents"   ON public.documents   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage eligibility" ON public.eligibility FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage notes"       ON public.notes       FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── 6. INDEXES ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_employees_company  ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_email    ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_leads_company      ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_employee     ON public.leads(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_company  ON public.call_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_employee ON public.call_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_emp       ON public.activity_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_co        ON public.activity_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_date      ON public.activity_logs(created_at DESC);
