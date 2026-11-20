-- ============================================================
-- LoanCRM – Revenue and Commission Schema Update
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kzsxlveehfjhugyarqks/sql/new
-- ============================================================

-- 1. Add default percentages to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS default_revenue_pct NUMERIC DEFAULT 2.0;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS default_commission_pct NUMERIC DEFAULT 0.5;

-- 2. Add revenue and commission amounts to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS revenue NUMERIC;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS commission NUMERIC;
