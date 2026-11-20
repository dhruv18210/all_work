import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err.message); return; }
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 'var(--sp-4)',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,142,247,0.12), transparent)',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)', animation: 'slideUp 0.6s ease' }}>
          <div style={{
            width: 72, height: 72,
            background: 'var(--accent-gradient)',
            borderRadius: 'var(--r-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, margin: '0 auto var(--sp-4)',
            boxShadow: 'var(--accent-glow)',
            animation: 'float 3s ease-in-out infinite'
          }}>💰</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LoanCRM</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--sp-1)', fontSize: '0.95rem' }}>
            Elevating your loan management experience
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 'var(--sp-8)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div style={{
                  background: 'var(--red-light)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 'var(--r-md)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  color: 'var(--red)',
                  fontSize: '0.85rem',
                }}>
                  ⚠️ {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
                style={{ justifyContent: 'center', padding: '12px' }}
              >
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</> : '→ Sign In'}
              </button>
            </div>
          </form>
        </div>

        {/* Demo login removed */}
        {/* Demo login removed */}
        <div style={{ animation: 'slideUp 0.8s ease', textAlign: 'center' }}>
          <p style={{ marginTop: 'var(--sp-6)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            New employee?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create an account →</Link>
          </p>
          <p style={{ marginTop: 'var(--sp-2)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Company HR?{' '}
            <Link to="/register-company" style={{ color: 'var(--purple)', fontWeight: 600 }}>Register your company →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
