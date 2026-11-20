-- ============================================================
-- LoanCRM – employees + activity_logs tables
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kzsxlveehfjhugyarqks/sql/new
-- NOTE: Safe to re-run — uses DROP IF EXISTS before every CREATE POLICY
-- ============================================================

-- ── 1. EMPLOYEES TABLE ────────────────────────────────────────────────────────
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

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Auth can manage employees" ON public.employees;
CREATE POLICY "Anon can manage employees" ON public.employees FOR ALL TO anon          USING (true) WITH CHECK (true);
CREATE POLICY "Auth can manage employees" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ── 2. ACTIVITY LOGS TABLE ────────────────────────────────────────────────────
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

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can manage activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Auth can manage activity_logs" ON public.activity_logs;
CREATE POLICY "Anon can manage activity_logs" ON public.activity_logs FOR ALL TO anon          USING (true) WITH CHECK (true);
CREATE POLICY "Auth can manage activity_logs" ON public.activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ── 3. INDEXES ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_employees_email       ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_company_id  ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_emp_id       ON public.activity_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_company_id   ON public.activity_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_created      ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_action       ON public.activity_logs(action);
