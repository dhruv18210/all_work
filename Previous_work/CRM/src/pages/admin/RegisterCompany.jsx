import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerCompany } from '../../lib/auth';

export default function RegisterCompany() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null); // { company_code, name }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim())              { setError('Company name is required.');           return; }
    if (!form.email.includes('@'))      { setError('Enter a valid email.');                return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 chars.');  return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.');              return; }

    setLoading(true);
    const { company, error: err } = await registerCompany({
      name: form.name.trim(), email: form.email.trim(), password: form.password,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setResult({ company_code: company.company_code, name: company.name });
  };

  /* ── Success screen with company code ─── */
  if (result) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 'var(--sp-4)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.1), transparent)' }} />
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🏢</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Company Registered!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)', lineHeight: 1.7 }}>
          Welcome, <strong>{result.name}</strong>! Your company is ready.
        </p>

        {/* Company Code box */}
        <div style={{
          background: 'var(--bg-elevated)', border: '2px dashed var(--accent)',
          borderRadius: 'var(--r-lg)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
            🔑 YOUR COMPANY CODE — Share this with your employees
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900,
            color: 'var(--accent)', letterSpacing: '0.1em',
          }}>{result.company_code}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Employees need this code to join your company during signup
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 12 }}
            onClick={() => { navigator.clipboard.writeText(result.company_code); }}
          >📋 Copy Code</button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexDirection: 'column' }}>
          <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => navigate('/login')}>
            → Sign In as HR
          </button>
          <button className="btn btn-ghost w-full" style={{ justifyContent: 'center' }} onClick={() => navigate('/signup')}>
            Add an Employee →
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Registration form ─── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 'var(--sp-4)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,142,247,0.1), transparent)' }} />
      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
          <div style={{
            width: 60, height: 60, background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto var(--sp-4)', boxShadow: 'var(--shadow-glow)',
          }}>🏢</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Register Company</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--sp-1)', fontSize: '0.9rem' }}>
            Create your company account and get a team code
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--sp-8)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input id="company_name" className="form-input" type="text" placeholder="Acme Finance Pvt Ltd"
                  value={form.name} onChange={set('name')} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">HR / Admin Email</label>
                <input id="company_email" className="form-input" type="email" placeholder="hr@company.com"
                  value={form.email} onChange={set('email')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input id="company_password" className="form-input" type="password" placeholder="Min 6 characters"
                  value={form.password} onChange={set('password')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input id="company_confirm" className="form-input" type="password" placeholder="Re-enter password"
                  value={form.confirm} onChange={set('confirm')} required />
              </div>
              {error && (
                <div style={{ background: 'var(--red-light)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', padding: 'var(--sp-3) var(--sp-4)', color: 'var(--red)', fontSize: '0.85rem' }}>
                  ⚠️ {error}
                </div>
              )}
              <button type="submit" id="register-company-btn" className="btn btn-primary w-full"
                disabled={loading} style={{ justifyContent: 'center', padding: '12px', marginTop: 4 }}>
                {loading
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Registering…</>
                  : '🏢 Register Company'}
              </button>
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 'var(--sp-5)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign In →</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 'var(--sp-2)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Are you an employee?{' '}
          <Link to="/signup" style={{ color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>Employee Signup →</Link>
        </p>
      </div>
    </div>
  );
}
