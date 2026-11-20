import { STATUS_META } from '../../lib/utils';

export function Badge({ status, label }) {
  const meta = STATUS_META[status] || { label: status || '—', color: '#8b9ab0', bg: 'rgba(139,154,176,0.15)' };
  return (
    <span
      className="badge"
      style={{ color: meta.color, background: meta.bg }}
    >
      {label || meta.label}
    </span>
  );
}

export function DocBadge({ status }) {
  const map = {
    pending:  { label: 'Pending',  color: '#8b9ab0', bg: 'rgba(139,154,176,0.15)' },
    uploaded: { label: 'Uploaded', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    verified: { label: 'Verified', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  };
  const m = map[status] || map.pending;
  return (
    <span className="badge" style={{ color: m.color, background: m.bg }}>{m.label}</span>
  );
}
