-- ============================================================
-- Loan CRM – Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  loan_amount NUMERIC,
  source TEXT,
  business_type TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','docs','approved','completed','rejected')),
  assigned_to UUID REFERENCES auth.users(id),
  client_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CALL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  outcome TEXT CHECK (outcome IN ('Interested','Not Interested','Follow-up','No Answer')),
  notes TEXT,
  follow_up_date DATE,
  logged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  doc_type TEXT CHECK (doc_type IN ('aadhaar','pan','income_proof','bank_statement','other')),
  file_path TEXT,
  file_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','uploaded','verified','rejected')),
  uploaded_by TEXT DEFAULT 'client',
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- ELIGIBILITY TABLE
CREATE TABLE IF NOT EXISTS public.eligibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE UNIQUE,
  income NUMERIC,
  existing_emi NUMERIC,
  cibil_score INTEGER,
  requested_amount NUMERIC,
  suggested_amount NUMERIC,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- NOTES TABLE
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AUTO UPDATE updated_at on leads
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Leads: authenticated users can read/write all leads
CREATE POLICY "Employees can manage leads" ON public.leads
  FOR ALL USING (auth.role() = 'authenticated');

-- Call logs: authenticated users
CREATE POLICY "Employees can manage call_logs" ON public.call_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- Eligibility: authenticated users
CREATE POLICY "Employees can manage eligibility" ON public.eligibility
  FOR ALL USING (auth.role() = 'authenticated');

-- Notes: authenticated users
CREATE POLICY "Employees can manage notes" ON public.notes
  FOR ALL USING (auth.role() = 'authenticated');

-- Documents: authenticated users can do everything; clients can insert/select by token
CREATE POLICY "Employees can manage documents" ON public.documents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Clients can upload documents" ON public.documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = documents.lead_id
        AND leads.client_token::text = current_setting('request.jwt.claims', true)::json->>'client_token'
    )
  );

-- ============================================================
-- STORAGE BUCKET (run via Supabase Storage UI or this SQL)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('loan-documents', 'loan-documents', false);
-- Storage policies allow authenticated users to manage, clients upload only by token.
