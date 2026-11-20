import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { getAllEmployees, updateCompanySettings } from '../../lib/auth';
import { formatDate, formatCurrency } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

// ── Date helpers ──────────────────────────────────────────────────────────────
const today      = () => new Date().toISOString().slice(0, 10);
const weekStart  = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10); };
const monthStart = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

function countFor(items, empId, fromDate) {
  return items.filter((x) => {
    const matchEmp  = !empId || x.assigned_employee_id === empId || x.employee_id === empId;
    const matchDate = !fromDate || (x.created_at || '').slice(0, 10) >= fromDate;
    return matchEmp && matchDate;
  }).length;
}

function sumFor(items, empId, fromDate) {
  return items.filter((x) => {
    const matchEmp  = !empId || x.assigned_employee_id === empId;
    const matchDate = !fromDate || (x.created_at || '').slice(0, 10) >= fromDate;
    return matchEmp && matchDate;
  }).reduce((s, x) => s + (parseFloat(x.loan_amount) || 0), 0);
}

function sumFinancial(items, field, empId, fromDate) {
  return items.filter((x) => {
    const matchEmp  = !empId || x.assigned_employee_id === empId;
    const matchDate = !fromDate || (x.created_at || '').slice(0, 10) >= fromDate;
    const isApproved = ['approved','completed'].includes(x.status);
    return matchEmp && matchDate && isApproved;
  }).reduce((s, x) => s + (parseFloat(x[field]) || 0), 0);
}

const PERIOD_TABS = [
  { key: 'today',   label: 'Today',      from: today      },
  { key: 'week',    label: 'This Week',  from: weekStart  },
  { key: 'month',   label: 'This Month', from: monthStart },
  { key: 'all',     label: 'All Time',   from: () => ''   },
];

export default function HRDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [leads,     setLeads]     = useState([]);
  const [calls,     setCalls]     = useState([]);
  const [docs,      setDocs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [period,    setPeriod]    = useState('today');
  const [dateFilter, setDateFilter] = useState('');

  // Settings Modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ rev: 2.0, comm: 0.5 });
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => { 
    fetchAll(); 
    if (user) setSettingsForm({ rev: user.default_revenue_pct || 2.0, comm: user.default_commission_pct || 0.5 });
  }, [user?.id]);

  const fetchAll = async () => {
    setLoading(true);
    const companyId = user?.company_id;

    const [emps, { data: leadsData }, { data: callsData }, { data: docsData }] = await Promise.all([
      getAllEmployees(companyId),
      (() => {
        let q = supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (companyId) q = q.eq('company_id', companyId);
        return q;
      })(),
      (() => {
        let q = supabase.from('call_logs').select('*').order('created_at', { ascending: false });
        if (companyId) q = q.eq('company_id', companyId);
        return q;
      })(),
      (() => {
        let q = supabase.from('documents').select('lead_id, doc_type, status, uploaded_at, uploaded_by');
        return q;
      })(),
    ]);

    setEmployees(emps || []);
    setLeads(leadsData || []);
    setCalls(callsData || []);
    setDocs(docsData || []);
    setLoading(false);
  };

  const fromDate = useMemo(() => {
    if (dateFilter) return dateFilter;
    const tab = PERIOD_TABS.find((t) => t.key === period);
    return tab ? tab.from() : '';
  }, [period, dateFilter]);

  // Summary KPIs
  const totalLeads = countFor(leads, null, fromDate);
  const totalCalls = countFor(calls, null, fromDate);
  const totalValue = sumFor(leads, null, fromDate);
  const approvedLeads = leads.filter((l) => ['approved','completed'].includes(l.status) && (!fromDate || l.created_at?.slice(0,10) >= fromDate)).length;
  const totalRevenue = sumFinancial(leads, 'revenue', null, fromDate);
  const totalCommission = sumFinancial(leads, 'commission', null, fromDate);

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    const { error } = await updateCompanySettings(user.company_id, {
      default_revenue_pct: parseFloat(settingsForm.rev),
      default_commission_pct: parseFloat(settingsForm.comm),
    });
    setSettingsLoading(false);
    if (error) { toast('Failed to save settings', 'error'); return; }
    toast('Settings updated! (Requires re-login to apply to new leads)', 'success');
    setSettingsOpen(false);
  };

  const exportCSV = () => {
    const rows = [
      ['Employee', 'Role', 'Leads', 'Calls', 'Docs Uploaded', 'Loan Value (₹)', 'Approved', 'Revenue Gen (₹)', 'Commission (₹)'],
      ...employees.map((emp) => [
        emp.full_name, emp.role || 'employee',
        countFor(leads, emp.id, fromDate),
        countFor(calls, emp.id, fromDate),
        docs.filter((d) => d.uploaded_by === emp.full_name && (!fromDate || d.uploaded_at?.slice(0,10) >= fromDate)).length,
        sumFor(leads, emp.id, fromDate).toFixed(0),
        leads.filter((l) => ['approved','completed'].includes(l.status) && l.assigned_employee_id === emp.id && (!fromDate || l.created_at?.slice(0,10) >= fromDate)).length,
        sumFinancial(leads, 'revenue', emp.id, fromDate).toFixed(0),
        sumFinancial(leads, 'commission', emp.id, fromDate).toFixed(0),
      ]),
    ];
    const csv  = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `hr_report_${today()}.csv` });
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loader-center"><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 HR Dashboard</h1>
          <p className="page-subtitle">
            {user?.company_name || 'Company'} · Employee performance report
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
          <input type="date" className="form-input" style={{ width: 'auto' }}
            value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPeriod(''); }}
            title="Filter by specific date" />
          {dateFilter && <button className="btn btn-ghost btn-sm" onClick={() => { setDateFilter(''); setPeriod('today'); }}>✕</button>}
          <button className="btn btn-ghost btn-sm" onClick={() => setSettingsOpen(true)}>⚙️ Settings</button>
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={fetchAll}>🔄 Refresh</button>
        </div>
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', padding: 4, width: 'fit-content' }}>
        {PERIOD_TABS.map((t) => (
          <button key={t.key} onClick={() => { setPeriod(t.key); setDateFilter(''); }} style={{
            padding: '6px 16px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
            background: period === t.key && !dateFilter ? 'var(--accent)' : 'transparent',
            color: period === t.key && !dateFilter ? '#fff' : 'var(--text-secondary)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {[
          { label: 'Total Leads',    value: totalLeads,   icon: '👥', color: 'var(--accent)' },
          { label: 'Total Calls',    value: totalCalls,   icon: '📞', color: 'var(--amber)'  },
          { label: 'Approved Loans', value: approvedLeads,icon: '✅', color: 'var(--green)'  },
          { label: 'Total Value',    value: formatCurrency(totalValue), icon: '🏦', color: 'var(--purple)' },
          { label: 'Total Revenue',  value: formatCurrency(totalRevenue), icon: '💰', color: '#10b981' },
          { label: 'Commissions',    value: formatCurrency(totalCommission), icon: '💸', color: '#f59e0b' },
        ].map((k) => (
          <div key={k.label} className="kpi-card" style={{ '--kpi-color': k.color }}>
            <span className="kpi-icon">{k.icon}</span>
            <div className="kpi-value" style={{ fontSize: typeof k.value === 'string' ? '1.2rem' : undefined }}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Employee Performance Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <span className="card-title">👤 Employee Performance</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {employees.length} employees · {dateFilter ? `on ${dateFilter}` : PERIOD_TABS.find(t=>t.key===period)?.label}
          </span>
        </div>

        {employees.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
            <div className="empty-state-icon">🧑‍💼</div>
            <div className="empty-state-title">No employees yet</div>
            <div className="empty-state-text">Share your company code so employees can sign up</div>
            {user?.company_code && (
              <div style={{ marginTop: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-5)', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--accent)', fontWeight: 700 }}>
                {user.company_code}
              </div>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'center' }}>Leads</th>
                  <th style={{ textAlign: 'center' }}>Calls</th>
                  <th style={{ textAlign: 'center' }}>Approved</th>
                  <th style={{ textAlign: 'right'  }}>Loan Value</th>
                  <th style={{ textAlign: 'right'  }}>Revenue</th>
                  <th style={{ textAlign: 'right'  }}>Comm.</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const empLeads    = countFor(leads, emp.id, fromDate);
                  const empCalls    = countFor(calls, emp.id, fromDate);
                  const empApproved = leads.filter((l) => ['approved','completed'].includes(l.status) && l.assigned_employee_id === emp.id && (!fromDate || l.created_at?.slice(0,10) >= fromDate)).length;
                  const empValue    = sumFor(leads, emp.id, fromDate);
                  const score       = empLeads * 2 + empCalls + empApproved * 5;
                  const maxScore    = Math.max(...employees.map((e) => countFor(leads, e.id, fromDate) * 2 + countFor(calls, e.id, fromDate) + 1), 1);
                  const pct         = Math.round((score / maxScore) * 100);

                  const ROLE_COLOR = { admin: '#8b5cf6', manager: '#f59e0b', employee: '#4f8ef7' };
                  const rc = ROLE_COLOR[emp.role] || ROLE_COLOR.employee;

                  return (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                            {emp.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{emp.full_name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.phone || emp.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, background: `${rc}22`, color: rc, textTransform: 'capitalize' }}>{emp.role || 'employee'}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)' }}>{empLeads}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--amber)' }}>{empCalls}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--green)' }}>{empApproved}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: 'var(--purple)', fontSize: '0.875rem' }}>{formatCurrency(empValue)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#10b981', fontSize: '0.875rem' }}>{formatCurrency(sumFinancial(leads, 'revenue', emp.id, fromDate))}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.875rem' }}>{formatCurrency(sumFinancial(leads, 'commission', emp.id, fromDate))}</span>
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--bg-active)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct > 66 ? 'var(--green)' : pct > 33 ? 'var(--amber)' : 'var(--accent)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: 28 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead breakdown per employee — cards */}
      {employees.length > 0 && (
        <div style={{ marginTop: 'var(--sp-6)' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 'var(--sp-4)' }}>📋 Lead Breakdown by Employee</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
            {employees.map((emp) => {
              const empLeads = leads.filter((l) => l.assigned_employee_id === emp.id && (!fromDate || l.created_at?.slice(0,10) >= fromDate));
              const statuses = ['new','contacted','docs','approved','completed','rejected'];
              const STATUS_COLORS = { new:'var(--indigo)', contacted:'var(--amber)', docs:'var(--accent)', approved:'var(--green)', completed:'var(--purple)', rejected:'var(--red)' };
              return (
                <div key={emp.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                      {emp.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{emp.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{empLeads.length} leads</div>
                    </div>
                  </div>
                  {empLeads.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: 'var(--sp-3)' }}>No leads in this period</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {statuses.map((s) => {
                        const cnt = empLeads.filter((l) => l.status === s).length;
                        if (cnt === 0) return null;
                        return (
                          <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                            <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{s}</span>
                            <span style={{ fontWeight: 700, color: STATUS_COLORS[s] }}>{cnt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="⚙️ Company Settings"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSettingsOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveSettings} disabled={settingsLoading}>
              {settingsLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)' }}>
          These percentages will be used to automatically calculate the expected Revenue and Commission on all new leads.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="form-group">
            <label className="form-label">Default Revenue % (Company Share)</label>
            <input className="form-input" type="number" step="0.1" value={settingsForm.rev}
              onChange={(e) => setSettingsForm(f => ({ ...f, rev: e.target.value }))} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Example: 2.0 = 2% of total loan amount</div>
          </div>
          <div className="form-group">
            <label className="form-label">Default Commission % (Employee Share)</label>
            <input className="form-input" type="number" step="0.1" value={settingsForm.comm}
              onChange={(e) => setSettingsForm(f => ({ ...f, comm: e.target.value }))} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Example: 0.5 = 0.5% of total loan amount</div>
          </div>
        </div>
      </Modal>

    </div>
  );
}
