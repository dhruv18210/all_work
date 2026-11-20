-- ============================================================
-- AI-CRM SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor to initialize the DB
-- TIP: Select all text (Ctrl+A) and click "Run" (NOT "Explain")
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CLEANUP: Remove existing tables if re-running
-- ============================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS compliance_settings CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS system_alerts CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS agent_performance CASCADE;
DROP TABLE IF EXISTS calls CASCADE;
DROP TABLE IF EXISTS campaign_leads CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ============================================================
-- TABLE: organizations
-- Stores multi-tenant company accounts
-- ============================================================
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  invite_code     TEXT UNIQUE NOT NULL,
  plan_id         UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: subscription_plans
-- Platform service tiers
-- ============================================================
CREATE TABLE subscription_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  price           TEXT NOT NULL, -- e.g., "$49", "Custom"
  calls_limit     TEXT NOT NULL, -- e.g., "500", "Unlimited"
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ADD CONSTRAINT fk_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id);

-- ============================================================
-- TABLE: users
-- Stores team members linked to an organization
-- ============================================================
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT UNIQUE NOT NULL,
  name            TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'AGENT', -- 'ADMIN', 'MANAGER', 'AGENT'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: agents
-- Stores AI agent configurations (voice, prompt, behavior)
-- ============================================================
CREATE TABLE agents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'Sales', -- 'Sales', 'Support', 'Collections'
  prompt          TEXT,                           -- System prompt / persona
  voice_id        TEXT,                           -- ElevenLabs / Deepgram voice ID
  max_duration    INT DEFAULT 300,                -- Max call duration in seconds
  temperature     FLOAT DEFAULT 0.7,              -- LLM creativity (0.0 - 1.0)
  handoff_enabled BOOLEAN DEFAULT FALSE,          -- Enable human handoff on frustration
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: leads
-- Stores potential customers to be called
-- ============================================================
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  status          TEXT NOT NULL DEFAULT 'NEW', -- 'NEW', 'INTERESTED', 'CALLBACK', 'QUALIFIED', 'NOT_INTERESTED'
  interest_score  INT DEFAULT 0,               -- 0-10, updated by AI analysis
  notes           TEXT,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL, -- Assigned human agent
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: campaigns
-- Groups of leads assigned to an agent for bulk outreach
-- ============================================================
CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL, -- AI Agent
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL, -- Human manager/agent
  name            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'
  leads_count     INT DEFAULT 0,
  contacted_count INT DEFAULT 0,
  converted_count INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: campaign_leads (Junction Table)
-- Links many leads to many campaigns
-- ============================================================
CREATE TABLE campaign_leads (
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id     UUID REFERENCES leads(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, lead_id)
);

-- ============================================================
-- TABLE: calls
-- Records every call attempt and its outcome
-- ============================================================
CREATE TABLE calls (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
  agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL, -- AI Agent
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL, -- Human who triggered the call
  -- Telephony
  room_name       TEXT UNIQUE,          -- LiveKit room name
  twilio_sid      TEXT,                 -- Twilio call SID
  -- Status
  status          TEXT NOT NULL DEFAULT 'INITIATING', -- 'INITIATING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'NO_ANSWER'
  duration_sec    INT,                  -- Actual call duration in seconds
  -- AI Analysis (populated after call ends)
  transcript      TEXT,
  summary         TEXT,
  sentiment       TEXT,                 -- 'Positive', 'Neutral', 'Negative'
  interest_score  INT,                  -- 0-10
  outcome         TEXT,                 -- 'Interested', 'Not Interested', 'Callback', 'Busy'
  -- Timestamps
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: workflows
-- Automations for the CRM
-- ============================================================
CREATE TABLE workflows (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  trigger         TEXT NOT NULL, -- e.g. 'LEAD_CREATED', 'CALL_COMPLETED'
  action          TEXT NOT NULL, -- e.g. 'SEND_EMAIL', 'NOTIFY_MANAGER'
  enabled         BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: agent_performance (For Leaderboard)
-- ============================================================
CREATE TABLE agent_performance (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    total_calls INTEGER DEFAULT 0,
    successful_handoffs INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: audit_logs
-- Tracks administrative and system actions
-- ============================================================
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email      TEXT,
  action          TEXT NOT NULL,
  resource        TEXT,
  status          TEXT DEFAULT 'Success', -- 'Success', 'Flagged', 'Failed'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: compliance_settings
-- Global or per-org compliance configurations
-- ============================================================
CREATE TABLE compliance_settings (
  organization_id    UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  global_dnd_check   BOOLEAN DEFAULT TRUE,
  record_consent     BOOLEAN DEFAULT TRUE,
  max_calls_per_lead INT DEFAULT 2,
  consents_count_24h INT DEFAULT 0,
  withdrawals_count_24h INT DEFAULT 0,
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: support_tickets
-- Tracks organization support requests
-- ============================================================
CREATE TABLE support_tickets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number   TEXT UNIQUE NOT NULL, -- e.g., T-1024
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subject         TEXT NOT NULL,
  priority        TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
  status          TEXT DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'PENDING', 'CLOSED'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: system_alerts
-- Global system health alerts
-- ============================================================
CREATE TABLE system_alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL, -- 'ERROR', 'WARNING', 'INFO'
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: incidents
-- Major system incidents
-- ============================================================
CREATE TABLE incidents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  severity    TEXT DEFAULT 'MAJOR', -- 'MINOR', 'MAJOR', 'CRITICAL'
  status      TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'RESOLVED'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each organization can only see its own data
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns        ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_leads   ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls            ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- 1. Organizations Policy (Users see their own org)
CREATE POLICY "Users see own org"
  ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM users WHERE email = auth.email()));

-- 2. Users Policy
-- To avoid infinite recursion, we use a separate check for the user's own record
CREATE POLICY "Users see own record"
  ON users FOR SELECT
  USING (email = auth.email());

CREATE POLICY "Users see team members"
  ON users FOR SELECT
  USING (organization_id = (SELECT u.organization_id FROM users u WHERE u.email = auth.email()));

-- 3. Leads Policy
CREATE POLICY "Users see own org leads"
  ON leads FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE email = auth.email()));

-- 4. Campaigns Policy
CREATE POLICY "Users see own org campaigns"
  ON campaigns FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE email = auth.email()));

-- 5. Agents Policy
CREATE POLICY "Users see own org agents"
  ON agents FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE email = auth.email()));

-- 6. Calls Policy
CREATE POLICY "Users see own org calls"
  ON calls FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE email = auth.email()));

-- 7. Workflows Policy
CREATE POLICY "Users see own org workflows"
  ON workflows FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE email = auth.email()));

-- 8. Campaign Leads Policy
CREATE POLICY "Users see own org campaign leads"
  ON campaign_leads FOR ALL
  USING (campaign_id IN (SELECT id FROM campaigns));

-- 9. Agent Performance Policy
CREATE POLICY "Users see own org performance"
  ON agent_performance FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE email = auth.email()));

-- 10. Audit Logs Policy (Admins only for global, Managers for own org)
CREATE POLICY "Admins see all audit logs"
  ON audit_logs FOR SELECT
  USING ((SELECT role FROM users WHERE email = auth.email()) = 'ADMIN');

CREATE POLICY "Managers see own org audit logs"
  ON audit_logs FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE email = auth.email()));

-- 11. Compliance Settings Policy
CREATE POLICY "Admins see all compliance"
  ON compliance_settings FOR ALL
  USING ((SELECT role FROM users WHERE email = auth.email()) = 'ADMIN');

CREATE POLICY "Managers see own org compliance"
  ON compliance_settings FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE email = auth.email()));

-- 12. Support Tickets Policy
CREATE POLICY "Admins see all support tickets"
  ON support_tickets FOR ALL
  USING ((SELECT role FROM users WHERE email = auth.email()) = 'ADMIN');

CREATE POLICY "Managers see own org support tickets"
  ON support_tickets FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE email = auth.email()));

-- 13. System Alerts Policy (All can read, Admins manage)
CREATE POLICY "Everyone see system alerts"
  ON system_alerts FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins manage system alerts"
  ON system_alerts FOR ALL
  USING ((SELECT role FROM users WHERE email = auth.email()) = 'ADMIN');

-- 14. Incidents Policy (All can read, Admins manage)
CREATE POLICY "Everyone see incidents"
  ON incidents FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins manage incidents"
  ON incidents FOR ALL
  USING ((SELECT role FROM users WHERE email = auth.email()) = 'ADMIN');

-- 15. Subscription Plans Policy
CREATE POLICY "Everyone see active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins manage plans"
  ON subscription_plans FOR ALL
  USING ((SELECT role FROM users WHERE email = auth.email()) = 'ADMIN');

-- ============================================================
-- INDEXES (for performance on common queries)
-- ============================================================
CREATE INDEX idx_leads_org_id       ON leads(organization_id);
CREATE INDEX idx_leads_status       ON leads(status);
CREATE INDEX idx_calls_room_name    ON calls(room_name);
CREATE INDEX idx_calls_lead_id      ON calls(lead_id);
CREATE INDEX idx_calls_status       ON calls(status);
CREATE INDEX idx_campaigns_org_id   ON campaigns(organization_id);
CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_org_id       ON users(organization_id);
CREATE INDEX idx_workflows_org_id   ON workflows(organization_id);
CREATE INDEX idx_perf_org_id        ON agent_performance(organization_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS (Auto-update updated_at)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_modtime BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_agents_modtime BEFORE UPDATE ON agents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaigns_modtime BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_calls_modtime BEFORE UPDATE ON calls FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workflows_modtime BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
