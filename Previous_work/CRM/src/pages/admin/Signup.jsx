import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerEmployee, emailExists, getCompanyByCode } from '../../lib/auth';

const ROLES = ['Employee', 'Manager', 'Admin'];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', role: 'Employee',
    company_code: '', password: '', confirm: '',
  });
  const [error, setError]         = useState('');
  const [codeStatus, setCodeStatus] = useState(null); // null | 'checking' | { name } | 'invalid'
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Validate company code as user types
  const handleCodeChange = async (val) => {
    setForm((f) => ({ ...f, company_code: val }));
    const trimmed = val.trim().toUpperCase();
    if (trimmed.length < 4) { setCodeStatus(null); return; }
    setCodeStatus('checking');
    const co = await getCompanyByCode(trimmed);
    setCodeStatus(co ? { name: co.name, id: co.id } : 'invalid');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim())         { setError('Full name is required.');                return; }
    if (!form.email.includes('@'))      { setError('Enter a valid email.');                   return; }
    if (!form.company_code.trim())      { setError('Company code is required.');              return; }
    if (!codeStatus || codeStatus === 'invalid' || codeStatus === 'checking') {
      setError('Enter a valid company code.'); return;
    }
    if (form.password.length < 6)       { setError('Password must be at least 6 chars.');    return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.');                return; }

    setLoading(true);
    const exists = await emailExists(form.email);
    if (exists) { setError('Email already registered.'); setLoading(false); return; }

    const { error: regErr } = await registerEmployee({
      full_name:  form.full_name.trim(),
      email:      form.email.trim(),
      phone:      form.phone.trim(),
      role:       form.role,
      password:   form.password,
      company_id: codeStatus.id,
    });
    setLoading(false);
    if (regErr) { setError(regErr.message); return; }
    setSuccess(true);
  };

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 'var(--sp-4)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.1), transparent)' }} />
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Account Created!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)', lineHeight: 1.7 }}>
          Welcome to <strong>{codeStatus?.name || 'LoanCRM'}</strong>, <strong>{form.full_name}</strong>!<br />
          Your account is ready.
        </p>
        <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => navigate('/login')}>
          → Sign In
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 'var(--sp-4)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,142,247,0.12), transparent)' }} />
      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, var(--accent), var(--purple))', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto var(--sp-4)', boxShadow: 'var(--shadow-glow)' }}>💰</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Employee Sign Up</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--sp-1)', fontSize: '0.9rem' }}>Join your company on LoanCRM</p>
        </div>

        <div className="card" style={{ padding: 'var(--sp-8)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

              {/* Company Code — first field */}
              <div className="form-group">
                <label className="form-label">🔑 Company Code <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="company_code" className="form-input" type="text"
                  placeholder="e.g. LOAN-AB12CD" value={form.company_code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.05em' }} />
                {codeStatus === 'checking' && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🔄 Checking…</span>}
                {codeStatus === 'invalid'  && <span style={{ fontSize: '0.78rem', color: 'var(--red)', fontWeight: 600 }}>❌ Invalid company code</span>}
                {codeStatus?.name         && <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>✅ {codeStatus.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="full_name" className="form-input" type="text" placeholder="Rahul Sharma"
                  value={form.full_name} onChange={set('full_name')} required />
              </div>

              <div className="form-group">
                <label className="form-label">Work Email</label>
                <input id="email" className="form-input" type="email" placeholder="rahul@company.com"
                  value={form.email} onChange={set('email')} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input id="phone" className="form-input" type="tel" placeholder="9876543210"
                    value={form.phone} onChange={set('phone')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select id="role" className="form-input" value={form.role} onChange={set('role')}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input id="password" className="form-input" type="password" placeholder="Min 6 characters"
                  value={form.password} onChange={set('password')} required />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input id="confirm" className="form-input" type="password" placeholder="Re-enter password"
                  value={form.confirm} onChange={set('confirm')} required />
              </div>

              {error && (
                <div style={{ background: 'var(--red-light)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', padding: 'var(--sp-3) var(--sp-4)', color: 'var(--red)', fontSize: '0.85rem' }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" id="signup-btn" className="btn btn-primary w-full"
                disabled={loading} style={{ justifyContent: 'center', padding: '12px', marginTop: 4 }}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating…</> : '🚀 Create Account'}
              </button>
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 'var(--sp-4)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign In →</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 'var(--sp-2)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Company HR? <Link to="/register-company" style={{ color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>Register Company →</Link>
        </p>
      </div>
    </div>
  );
}
