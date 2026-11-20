import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getAllEmployees } from '../../lib/auth';
import { formatDate, formatDateTime } from '../../lib/utils';

import { useAuth } from '../../context/AuthContext';

const ROLE_COLOR = {
  admin:    { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  manager:  { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  employee: { bg: 'rgba(79,142,247,0.15)', color: '#4f8ef7' },
};

const ACTION_META = {
  account_created: { icon: '🎉', label: 'Account Created',   color: 'var(--green)'  },
  lead_created:    { icon: '➕', label: 'Lead Added',        color: 'var(--accent)' },
  call_logged:     { icon: '📞', label: 'Call Logged',       color: 'var(--amber)'  },
  doc_uploaded:    { icon: '📂', label: 'Document Uploaded', color: 'var(--indigo)' },
  lead_updated:    { icon: '✏️', label: 'Lead Updated',      color: 'var(--purple)' },
  note_added:      { icon: '📝', label: 'Note Added',        color: 'var(--text-secondary)' },
};

export default function Employees() {
  const { user } = useAuth();
  const [profiles, setProfiles]   = useState([]);
  const [logs, setLogs]           = useState([]);
  const [selected, setSelected]   = useState(null); // selected employee id
  const [loading, setLoading]     = useState(true);
  const [dateFilter, setDateFilter] = useState('');   // YYYY-MM-DD

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const companyId = user?.company_id;
    
    const [emps, { data: l }] = await Promise.all([
      getAllEmployees(companyId),
      (() => {
        let q = supabase.from('activity_logs').select('*').order('created_at', { ascending: false });
        if (companyId) q = q.eq('company_id', companyId);
        return q;
      })(),
    ]);
    setProfiles(emps || []);
    setLogs(l || []);
    setLoading(false);
  };

  // Filtered logs based on selected employee + date filter
  const filteredLogs = logs.filter((l) => {
    const matchEmp  = !selected || l.employee_id === selected;
    const matchDate = !dateFilter || l.created_at?.startsWith(dateFilter);
    return matchEmp && matchDate;
  });

  // Group logs by date for the timeline
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = log.created_at?.slice(0, 10) || 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const selectedProfile = profiles.find((p) => p.id === selected);

  if (loading) return <div className="loader-center"><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Team members and their day-by-day activity</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="Filter by date"
          />
          {dateFilter && (
            <button className="btn btn-ghost btn-sm" onClick={() => setDateFilter('')}>✕ Clear</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--sp-5)', alignItems: 'start' }}>
        {/* Employee list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {/* All employees option */}
          <div
            onClick={() => setSelected(null)}
            style={{
              padding: 'var(--sp-3) var(--sp-4)',
              borderRadius: 'var(--r-md)',
              background: !selected ? 'rgba(79,142,247,0.12)' : 'var(--bg-surface)',
              border: `1px solid ${!selected ? 'rgba(79,142,247,0.35)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>👥</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>All Employees</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{logs.length} total activities</div>
            </div>
          </div>

          {profiles.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-6)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🧑‍💼</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>No employees yet</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Employees appear here after signing up
              </div>
            </div>
          ) : profiles.map((emp) => {
            const empLogs  = logs.filter((l) => l.employee_id === emp.id);
            const isActive = selected === emp.id;
            const rc       = ROLE_COLOR[emp.role] || ROLE_COLOR.employee;
            return (
              <div
                key={emp.id}
                onClick={() => setSelected(isActive ? null : emp.id)}
                style={{
                  padding: 'var(--sp-3) var(--sp-4)',
                  borderRadius: 'var(--r-md)',
                  background: isActive ? 'rgba(79,142,247,0.1)' : 'var(--bg-surface)',
                  border: `1px solid ${isActive ? 'rgba(79,142,247,0.35)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '1rem',
                }}>{emp.full_name?.[0]?.toUpperCase() || '?'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }} className="truncate">{emp.full_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.phone || emp.email || '—'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700,
                    background: rc.bg, color: rc.color, textTransform: 'capitalize',
                  }}>{emp.role || 'employee'}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{empLogs.length} acts</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* Header bar */}
          <div className="card" style={{ padding: 'var(--sp-4) var(--sp-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {selectedProfile ? `${selectedProfile.full_name}'s Activity` : 'All Activity'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {filteredLogs.length} {dateFilter ? `activities on ${dateFilter}` : 'total activities'}
              </div>
            </div>
            {selectedProfile && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Joined</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{formatDate(selectedProfile.created_at)}</div>
              </div>
            )}
          </div>

          {filteredLogs.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-title">No activity found</div>
                <div className="empty-state-text">
                  {dateFilter ? 'No activity on this date.' : 'Activity will appear here as employees use the system.'}
                </div>
              </div>
            </div>
          ) : (
            Object.entries(groupedLogs)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, dayLogs]) => (
                <div key={date} className="card">
                  {/* Date header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                    marginBottom: 'var(--sp-4)', paddingBottom: 'var(--sp-3)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                      background: 'rgba(79,142,247,0.12)', color: 'var(--accent)',
                    }}>
                      {date === new Date().toISOString().slice(0, 10) ? '📅 Today' : `📅 ${formatDate(date + 'T00:00:00')}`}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dayLogs.length} activities</span>
                  </div>

                  {/* Log entries */}
                  <div className="timeline">
                    {dayLogs.map((log, i) => {
                      const meta = ACTION_META[log.action] || { icon: '🔹', label: log.action, color: 'var(--text-muted)' };
                      return (
                        <div key={log.id} className="timeline-item">
                          <div className="timeline-line">
                            <div className="timeline-dot" style={{ background: meta.color }} />
                            {i < dayLogs.length - 1 && <div className="timeline-connector" />}
                          </div>
                          <div className="timeline-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                              <span>{meta.icon}</span>
                              <span className="timeline-title" style={{ color: meta.color }}>{meta.label}</span>
                              {!selected && log.employee_name && (
                                <span style={{
                                  padding: '1px 8px', borderRadius: 20, fontSize: '0.68rem',
                                  background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                                }}>👤 {log.employee_name}</span>
                              )}
                            </div>
                            {log.description && (
                              <div className="timeline-sub" style={{ marginTop: 2 }}>{log.description}</div>
                            )}
                            <div className="timeline-time">{formatDateTime(log.created_at)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
