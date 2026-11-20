import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const ROLE_COLOR = {
  admin:    { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  manager:  { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  employee: { bg: 'rgba(79,142,247,0.15)', color: '#4f8ef7' },
};

export default function Sidebar({ followUpCount = 0 }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initial     = displayName[0]?.toUpperCase() || 'U';
  const role        = user?.role || 'employee';
  const roleStyle   = ROLE_COLOR[role] || ROLE_COLOR.employee;
  const isHR        = user?.is_hr === true;
  const companyName = user?.company_name || '';

  // Nav items — HR sees HR Dashboard too
  const NAV = [
    ...(isHR ? [{ to: '/hr-dashboard', icon: '📊', label: 'HR Dashboard' }] : []),
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/leads',     icon: '👥', label: 'Leads' },
    { to: '/employees', icon: '🧑‍💼', label: 'Employees' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--accent-glow)' }}>💰</div>
        <div>
          <div className="sidebar-logo-text" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>LoanCRM</div>
          <div className="sidebar-logo-sub">{companyName || 'Management'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-item-icon">{icon}</span>
            <span>{label}</span>
            {label === 'Dashboard' && followUpCount > 0 && (
              <span className="nav-badge">{followUpCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Company code widget for HR */}
      {isHR && user?.company_code && (
        <div style={{ margin: '0 var(--sp-3) var(--sp-3)', padding: 'var(--sp-3)', background: 'rgba(79,142,247,0.08)', border: '1px dashed rgba(79,142,247,0.3)', borderRadius: 'var(--r-md)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>EMPLOYEE CODE</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent)', letterSpacing: '0.05em' }}>{user.company_code}</div>
          <button
            style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 2, padding: 0 }}
            onClick={() => navigator.clipboard.writeText(user.company_code)}>📋 Copy</button>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="sidebar-user" style={{ cursor: 'default' }}>
          <div className="sidebar-avatar">{initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name truncate" style={{ maxWidth: 130, fontWeight: 700 }}>{displayName}</div>
            <span style={{ 
              display: 'inline-block', marginTop: 3, padding: '2px 10px', 
              borderRadius: 20, fontSize: '0.65rem', fontWeight: 800, 
              background: roleStyle.bg, color: roleStyle.color, 
              textTransform: 'uppercase', letterSpacing: '0.02em' 
            }}>
              {isHR ? 'HR Admin' : role}
            </span>
          </div>
          <button onClick={handleSignOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: 4, borderRadius: 'var(--r-sm)', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--red)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>⏻</button>
        </div>
      </div>
    </aside>
  );
}
