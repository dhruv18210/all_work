import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, generateLeadId, logActivity } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Drawer } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { formatDate, formatCurrency, SOURCE_OPTIONS, BUSINESS_TYPE_OPTIONS, STATUS_OPTIONS } from '../../lib/utils';

const EMPTY_FORM = { name: '', phone: '', loan_amount: '', source: '', business_type: '' };

export default function Leads() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { user } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sourceFilter, setSourceFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(searchParams.get('new') === '1');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [dupWarning, setDupWarning] = useState('');

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    setLoading(true);
    let q = supabase.from('leads').select('*').order('created_at', { ascending: false });
    // Filter by company if user belongs to one
    if (user?.company_id) {
      q = q.eq('company_id', user.company_id);
    }
    const { data } = await q;
    setLeads(data || []);
    setLoading(false);
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name?.toLowerCase().includes(q) || l.phone?.includes(q) || l.lead_id?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || l.status === statusFilter;
    const matchSource = !sourceFilter || l.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const handlePhoneChange = useCallback(async (phone) => {
    setForm((f) => ({ ...f, phone }));
    if (phone.length >= 10) {
      const { data } = await supabase.from('leads').select('id, name').eq('phone', phone).single();
      if (data) setDupWarning(`⚠️ Phone already exists: ${data.name}`);
      else setDupWarning('');
    } else setDupWarning('');
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { toast('Name and phone are required', 'error'); return; }
    setFormLoading(true);
    const { error } = await supabase.from('leads').insert({
      lead_id: generateLeadId(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      loan_amount: form.loan_amount ? parseFloat(form.loan_amount) : null,
      source: form.source,
      business_type: form.business_type,
      status: 'new',
      // Tag with company + employee for HR reporting
      company_id:             user?.company_id || null,
      assigned_employee_id:   user?.id || null,
      assigned_employee_name: user?.user_metadata?.full_name || user?.email || null,
    });
    setFormLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    
    // Log activity using helper
    await logActivity(user, 'lead_created', `Lead added: ${form.name.trim()}`);
    
    toast('Lead added successfully!', 'success');
    setDrawerOpen(false); setForm(EMPTY_FORM); setDupWarning('');
    fetchLeads();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">{filtered.length} of {leads.length} leads</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDrawerOpen(true)}>+ Add Lead</button>
      </div>

      {/* Filter Bar */}
      <div className="card card-sm mb-4">
        <div className="filter-bar">
          <div className="search-input-wrap" style={{ flex: 2 }}>
            <span className="search-icon">🔍</span>
            <input
              className="form-input"
              placeholder="Search name, phone, lead ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-input"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select
            className="form-input"
            style={{ width: 'auto' }}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="">All Sources</option>
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(search || statusFilter || sourceFilter) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); setSourceFilter(''); }}>Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loader-center"><div className="spinner spinner-lg" /></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Loan Amount</th>
                  <th>Source</th>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="clickable" onClick={() => navigate(`/leads/${lead.id}`)}>
                    <td><span className="font-mono text-muted" style={{ fontSize: '0.78rem' }}>{lead.lead_id}</span></td>
                    <td><span style={{ fontWeight: 600 }}>{lead.name}</span></td>
                    <td><span style={{ color: 'var(--text-secondary)' }}>{lead.phone}</span></td>
                    <td><span className="text-accent font-semibold">{formatCurrency(lead.loan_amount)}</span></td>
                    <td><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{lead.source || '—'}</span></td>
                    <td><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{lead.business_type || '—'}</span></td>
                    <td><Badge status={lead.status} /></td>
                    <td><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(lead.created_at)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-title">No leads found</div>
                <div className="empty-state-text">Try adjusting your search or filters</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Lead Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setForm(EMPTY_FORM); setDupWarning(''); }}
        title="Add New Lead"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? 'Adding…' : 'Add Lead'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="Ravi Kumar" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input className="form-input" placeholder="9876543210" value={form.phone}
              onChange={(e) => handlePhoneChange(e.target.value)} />
            {dupWarning && <span className="form-error">{dupWarning}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Loan Amount (₹)</label>
            <input className="form-input" type="number" placeholder="500000" value={form.loan_amount}
              onChange={(e) => setForm((f) => ({ ...f, loan_amount: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Source</label>
            <select className="form-input" value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}>
              <option value="">Select source…</option>
              {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Business Type</label>
            <select className="form-input" value={form.business_type}
              onChange={(e) => setForm((f) => ({ ...f, business_type: e.target.value }))}>
              <option value="">Select type…</option>
              {BUSINESS_TYPE_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
