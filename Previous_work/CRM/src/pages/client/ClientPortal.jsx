import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, uploadDocToDb, getLeadDocuments } from '../../lib/supabase';
import { FileUpload, UploadProgress } from '../../components/common/FileUpload';
import { formatDate } from '../../lib/utils';
import ChatBot from '../../components/common/ChatBot';

const STATUS_STEPS = [
  { key: 'submitted', label: 'Application Submitted', sub: 'We received your documents', icon: '📋' },
  { key: 'review',    label: 'Under Review',          sub: 'Our team is reviewing your application', icon: '🔍' },
  { key: 'decision',  label: 'Decision Made',         sub: 'We will notify you shortly', icon: '✅' },
];

const STATUS_TO_STEP = {
  new: 0, contacted: 0, docs: 1, approved: 2, completed: 2, rejected: 2,
};

const ALL_DOCS = [
  { key: 'pan',            label: 'PAN Card',         icon: '💳', hint: 'Clear photo or scan of your PAN card' },
  { key: 'aadhaar',        label: 'Aadhaar Card',    icon: '🪪', hint: 'Front & back of your Aadhaar card' },
  { key: 'bank_statement', label: 'Bank Statement',   icon: '🏦', hint: 'Last 6 months bank statement' },
  { key: 'itr',            label: 'ITR',              icon: '📝', hint: 'Income Tax Returns for the last 2–3 years' },
  { key: 'gst',            label: 'GST Certificate',  icon: '🏢', hint: 'GST registration certificate if applicable' },
  { key: 'property_papers', label: 'Property Papers', icon: '🏠', hint: 'Copies of relevant property documents' },
];

function DocStatusBadge({ status }) {
  const map = {
    pending:  { label: 'Not Uploaded', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    uploaded: { label: 'Uploaded ✓',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    verified: { label: 'Verified ✓',   color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    rejected: { label: 'Re-upload ⚠️', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
      color: s.color, background: s.bg,
    }}>{s.label}</span>
  );
}

export default function ClientPortal() {
  const { token } = useParams();
  const [lead, setLead]         = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [view, setView]         = useState('docs'); // 'docs' | 'status'

  // per-doc upload state
  const [uploadFiles, setUploadFiles]   = useState({});
  const [uploadingDoc, setUploadingDoc] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess]   = useState({});

  useEffect(() => { if (token) fetchLead(); }, [token]);

  const fetchLead = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .eq('client_token', token)
      .single();
    if (err || !data) { setError('Invalid or expired application link.'); setLoading(false); return; }
    setLead(data);
    const docs = await getLeadDocuments(data.id);
    setDocuments(docs || []);
    // If already submitted docs, show status view
    if (['approved', 'completed', 'rejected'].includes(data.status)) setView('status');
    setLoading(false);
  };


  const uploadDoc = async (docKey) => {
    const file = uploadFiles[docKey];
    if (!file) return;
    setUploadingDoc(docKey);
    setUploadProgress(20);
    const { error } = await uploadDocToDb(lead.id, docKey, file, 'client');
    setUploadProgress(90);
    if (error) { setUploadingDoc(''); setUploadProgress(0); return; }
    if (['new', 'contacted'].includes(lead.status)) {
      await supabase.from('leads').update({ status: 'docs' }).eq('id', lead.id);
      setLead((l) => ({ ...l, status: 'docs' }));
    }
    setUploadProgress(100);
    setTimeout(async () => {
      setUploadingDoc('');
      setUploadProgress(0);
      setUploadFiles((u) => ({ ...u, [docKey]: null }));
      setUploadSuccess((s) => ({ ...s, [docKey]: true }));
      const docs = await getLeadDocuments(lead.id);
      setDocuments(docs || []);
    }, 500);
  };

  const currentStepIdx = lead ? (STATUS_TO_STEP[lead.status] ?? 0) : 0;
  const uploadedCount  = ALL_DOCS.filter(({ key }) => {
    const d = documents.find((doc) => doc.doc_type === key);
    return d && d.status !== 'pending';
  }).length;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (error) return (
    <div className="portal-wrap">
      <div className="portal-card">
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Link Invalid</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="portal-wrap">
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(79,142,247,0.1), transparent)' }} />

      <div className="portal-card" style={{ position: 'relative', maxWidth: 560 }}>
        {/* Header */}
        <div className="portal-header" style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
          <div className="portal-brand" style={{ marginBottom: 'var(--sp-4)' }}>
            <div className="portal-brand-icon" style={{ 
              width: 54, height: 54, background: 'var(--accent-gradient)', 
              borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', margin: '0 auto', fontSize: 28, 
              boxShadow: 'var(--accent-glow)', marginBottom: 'var(--sp-3)',
              animation: 'float 3s ease-in-out infinite'
            }}>💰</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', margin: 0, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LoanCRM</h1>
          </div>
          <h2 className="portal-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Application Portal</h2>
          <p className="portal-subtitle" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ID: <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: 'monospace' }}>{lead.lead_id}</span></p>
        </div>

        <div className="portal-body">
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--sp-6)', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 4 }}>
            {[['docs', '📂 Upload Documents'], ['status', '📋 Application Status']].map(([k, l]) => (
              <button key={k} onClick={() => setView(k)} style={{
                flex: 1, padding: '8px 12px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                background: view === k ? 'var(--accent)' : 'transparent',
                color: view === k ? '#fff' : 'var(--text-secondary)',
              }}>{l}</button>
            ))}
          </div>

          {/* ── DOCUMENTS VIEW ─────────────────────────── */}
          {view === 'docs' && (
            <div style={{ animation: 'slideUp 0.3s ease' }}>
              {/* Client info card */}
              <div className="card card-sm" style={{ marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{lead.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{lead.phone}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 'var(--sp-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Documents Uploaded</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{uploadedCount} / {ALL_DOCS.length}</span>
                </div>
                <div style={{ height: 10, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}>
                  <div style={{ 
                    height: '100%', width: `${(uploadedCount / ALL_DOCS.length) * 100}%`, 
                    background: 'var(--accent-gradient)', borderRadius: 99, 
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'var(--accent-glow)'
                  }} />
                </div>
              </div>

              {/* Document cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                {ALL_DOCS.map(({ key, label, icon, hint }) => {
                  const doc = documents.find((d) => d.doc_type === key);
                  const status = doc?.status || 'pending';
                  const isUploading = uploadingDoc === key;
                  const isDone = status === 'uploaded' || status === 'verified';
                  const isRejected = status === 'rejected';

                  return (
                    <div key={key} style={{
                      background: 'var(--bg-elevated)',
                      border: `1px solid ${isRejected ? 'rgba(239,68,68,0.4)' : isDone ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-lg)',
                      padding: 'var(--sp-4)',
                      transition: 'border-color 0.2s',
                    }}>
                      {/* Doc header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                          <span style={{ fontSize: 22 }}>{icon}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{label}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{hint}</div>
                          </div>
                        </div>
                        <DocStatusBadge status={status} />
                      </div>

                      {/* Rejection warning */}
                      {isRejected && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-sm)', padding: 'var(--sp-2) var(--sp-3)', marginBottom: 'var(--sp-3)', fontSize: '0.78rem', color: '#ef4444' }}>
                          ⚠️ Your {label} was rejected. Please re-upload a clearer copy.
                        </div>
                      )}

                      {/* Already uploaded info */}
                      {isDone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--sp-2) var(--sp-3)', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--r-sm)', marginBottom: 'var(--sp-3)', fontSize: '0.78rem', color: 'var(--green)' }}>
                          ✅ {doc.file_name} {doc.uploaded_at ? `· ${formatDate(doc.uploaded_at)}` : ''}
                        </div>
                      )}

                      {/* Upload area — always shown (allow re-upload) */}
                      {(!isDone || isRejected) && (
                        <>
                          <FileUpload
                            label={`Drop ${label} here or click to browse`}
                            onFile={(f) => setUploadFiles((u) => ({ ...u, [key]: f }))}
                          />
                          {isUploading && <UploadProgress progress={uploadProgress} />}
                          <button
                            className="btn btn-primary w-full"
                            style={{ justifyContent: 'center', marginTop: 'var(--sp-3)' }}
                            onClick={() => uploadDoc(key)}
                            disabled={!uploadFiles[key] || isUploading}
                          >
                            {isUploading ? 'Uploading…' : `⬆ Upload ${label}`}
                          </button>
                        </>
                      )}

                      {/* Re-upload option for done docs */}
                      {isDone && !isRejected && (
                        <details style={{ marginTop: 'var(--sp-2)' }}>
                          <summary style={{ fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Replace document</summary>
                          <div style={{ marginTop: 'var(--sp-3)' }}>
                            <FileUpload label="Drop new file here" onFile={(f) => setUploadFiles((u) => ({ ...u, [key]: f }))} />
                            {isUploading && <UploadProgress progress={uploadProgress} />}
                            <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => uploadDoc(key)} disabled={!uploadFiles[key] || isUploading}>
                              {isUploading ? 'Uploading…' : 'Replace'}
                            </button>
                          </div>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>

              {uploadedCount === ALL_DOCS.length && (
                <div style={{ marginTop: 'var(--sp-5)', padding: 'var(--sp-4)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontWeight: 700, color: 'var(--green)' }}>All documents submitted!</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Our team will review your application and get back to you shortly.</div>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setView('status')}>View Application Status →</button>
                </div>
              )}
            </div>
          )}

          {/* ── STATUS VIEW ─────────────────────────────── */}
          {view === 'status' && (
            <div style={{ animation: 'slideUp 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>
                  {lead.status === 'approved' || lead.status === 'completed' ? '🎉' : lead.status === 'rejected' ? '😔' : '⏳'}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {lead.status === 'approved' ? 'Loan Approved!' : lead.status === 'completed' ? 'Loan Disbursed!' : lead.status === 'rejected' ? 'Not Approved' : 'Application Under Review'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.875rem' }}>
                  Application ID: <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{lead.lead_id}</span>
                </p>
              </div>

              {lead.status === 'rejected' && (
                <div style={{ background: 'var(--red-light)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-md)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-5)', color: 'var(--red)', fontSize: '0.875rem' }}>
                  We regret to inform you that your loan application could not be approved at this time. Please contact our team for more information.
                </div>
              )}

              <div className="status-timeline">
                {STATUS_STEPS.map((s, i) => {
                  const isDone = i < currentStepIdx || (lead.status === 'approved' || lead.status === 'completed');
                  const isCurrent = i === currentStepIdx && lead.status !== 'approved' && lead.status !== 'completed';
                  return (
                    <div key={s.key} className={`status-step${isDone ? ' done' : isCurrent ? ' current-step' : ''}`}>
                      <span className="status-step-icon">{s.icon}</span>
                      <div>
                        <div className="status-step-label">{s.label}</div>
                        <div className="status-step-sub">{s.sub}</div>
                      </div>
                      {isDone && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontWeight: 700 }}>✓</span>}
                      {isCurrent && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}>In Progress</span>}
                    </div>
                  );
                })}
              </div>

              {/* Doc mini-summary */}
              <div style={{ marginTop: 'var(--sp-5)', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 'var(--sp-4)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 'var(--sp-3)' }}>📂 Document Summary</div>
                {ALL_DOCS.map(({ key, label, icon }) => {
                  const doc = documents.find((d) => d.doc_type === key);
                  const status = doc?.status || 'pending';
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                      <span>{icon} {label}</span>
                      <DocStatusBadge status={status} />
                    </div>
                  );
                })}
                {documents.some(d => d.status === 'rejected') && (
                  <button className="btn btn-primary btn-sm w-full" style={{ marginTop: 12, justifyContent: 'center' }} onClick={() => setView('docs')}>
                    ⬆ Re-upload Rejected Documents
                  </button>
                )}
              </div>

              <div style={{ marginTop: 'var(--sp-5)', padding: 'var(--sp-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>📞 Need help?</strong> Contact us if you have any questions about your application.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--sp-4) var(--sp-8)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Your data is encrypted and secure. © {new Date().getFullYear()} LoanCRM
        </div>
      </div>
      <ChatBot />
    </div>
  );
}
