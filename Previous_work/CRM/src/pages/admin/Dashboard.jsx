import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatCurrency, STATUS_OPTIONS, isFollowUpToday } from '../../lib/utils';

const STAGE_ORDER = ['new', 'contacted', 'docs', 'approved', 'completed'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      const currentLeads = leadsData || [];
      setLeads(currentLeads);

      const { data: callData } = await supabase
        .from('call_logs')
        .select('*')
        .not('follow_up_date', 'is', null);

      const formattedCalls = (callData || []).map((call) => {
        const leadObj = currentLeads.find((l) => l.id === call.lead_id);
        return {
          ...call,
          leads: leadObj ? { name: leadObj.name, phone: leadObj.phone } : null,
        };
      });

      const todayFU = formattedCalls.filter((c) => isFollowUpToday(c.follow_up_date));
      setFollowUps(todayFU);
    } catch (err) {
      console.error('Error in Dashboard fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {});

  const kpis = [
    { label: 'Total Leads', value: leads.length, icon: '👥', color: 'var(--accent)' },
    { label: "Today's Follow-ups", value: followUps.length, icon: '📅', color: 'var(--amber)' },
    { label: 'Docs Pending', value: statusCounts['docs'] || 0, icon: '📂', color: 'var(--indigo)' },
    { label: 'Approved', value: (statusCounts['approved'] || 0) + (statusCounts['completed'] || 0), icon: '✅', color: 'var(--green)' },
  ];

  const maxCount = Math.max(...STATUS_OPTIONS.map((s) => statusCounts[s] || 0), 1);

  if (loading) return (
    <div className="loader-center"><div className="spinner spinner-lg" /></div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your loan pipeline</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/leads?new=1')}>
          + Add Lead
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card" style={{ '--kpi-color': k.color }}>
            <span className="kpi-icon">{k.icon}</span>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)' }}>
        {/* Pipeline distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pipeline Distribution</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {STAGE_ORDER.map((s) => {
              const count = statusCounts[s] || 0;
              const pct = Math.round((count / maxCount) * 100);
              const colors = {
                new: 'var(--indigo)', contacted: 'var(--amber)',
                docs: 'var(--accent)', approved: 'var(--green)', completed: 'var(--purple)',
              };
              return (
                <div key={s} onClick={() => navigate(`/leads?status=${s}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{s}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: colors[s] }}>{count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-active)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: colors[s], borderRadius: 99, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's follow-ups */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📅 Today's Follow-ups</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{followUps.length} tasks</span>
          </div>
          {followUps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <div className="empty-state-title">All clear!</div>
              <div className="empty-state-text">No follow-ups scheduled for today</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {followUps.slice(0, 6).map((fu) => (
                <div
                  key={fu.id}
                  className="doc-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/leads/${fu.lead_id}`)}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--r-md)',
                    background: 'var(--amber-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>📞</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }} className="truncate">
                      {fu.leads?.name || 'Lead'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {fu.leads?.phone} · {fu.outcome}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--amber)', fontWeight: 600 }}>Today</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card mt-6">
        <div className="card-header">
          <span className="card-title">Recent Leads</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View all →</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Loan Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 8).map((lead) => (
                <tr key={lead.id} className="clickable" onClick={() => navigate(`/leads/${lead.id}`)}>
                  <td><span className="font-mono text-muted" style={{ fontSize: '0.8rem' }}>{lead.lead_id}</span></td>
                  <td><span style={{ fontWeight: 600 }}>{lead.name}</span></td>
                  <td><span style={{ color: 'var(--text-secondary)' }}>{lead.phone}</span></td>
                  <td><span className="text-accent font-semibold">{formatCurrency(lead.loan_amount)}</span></td>
                  <td><Badge status={lead.status} /></td>
                  <td><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(lead.created_at)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No leads yet</div>
              <div className="empty-state-text">Add your first lead to get started</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
