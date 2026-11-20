import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, getSignedUrl, uploadDocToDb, logActivity, getLeadDocuments } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Badge, DocBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FileUpload, UploadProgress } from '../../components/common/FileUpload';
import { useToast } from '../../components/common/Toast';
import {
  formatDate, formatDateTime, formatCurrency,
  STATUS_OPTIONS, SOURCE_OPTIONS, BUSINESS_TYPE_OPTIONS,
  copyToClipboard, STATUS_META,
  buildPortalLinkMessage, buildReminderMessage, openWhatsApp, DOC_LABELS,
} from '../../lib/utils';

const PIPELINE = ['new', 'contacted', 'docs', 'approved', 'completed'];
const DOC_LIST = [
  { key: 'pan', label: 'PAN Card', icon: '💳' },
  { key: 'aadhaar', label: 'Aadhaar Card', icon: '🪪' },
  { key: 'bank_statement', label: 'Bank Statement (6m)', icon: '🏦' },
  { key: 'itr', label: 'ITR (2-3 years)', icon: '📝' },
  { key: 'gst', label: 'GST Certificate', icon: '🏢' },
  { key: 'property_papers', label: 'Property Papers', icon: '🏠' },
];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [lead, setLead] = useState(null);
  const [callLogs, setCallLogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  // Call Log form
  const [callForm, setCallForm] = useState({ outcome: 'Interested', notes: '', follow_up_date: '' });
  const [callLoading, setCallLoading] = useState(false);

  // Document upload
  const [uploadModal, setUploadModal] = useState(null); // { docType, label }
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Eligibility form
  const [eligForm, setEligForm] = useState({ income: '', existing_emi: '', cibil_score: '', requested_amount: '' });
  const [eligLoading, setEligLoading] = useState(false);

  // Note form
  const [noteText, setNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  // Reminder modal
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderDocs, setReminderDocs] = useState([]);

  // Financials (HR Only)
  const [finForm, setFinForm] = useState({ revenue: '', commission: '' });
  const [finLoading, setFinLoading] = useState(false);

  // Edit Lead
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', loan_amount: '', source: '', business_type: '' });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: leadData }, { data: callData }, docs, { data: eligData }, { data: noteData }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).maybeSingle(),
      supabase.from('call_logs').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
      getLeadDocuments(id),
      supabase.from('eligibility').select('*').eq('lead_id', id).maybeSingle(),
      supabase.from('notes').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    ]);
    setLead(leadData);
    setCallLogs(callData || []);
    setDocuments(docs || []);
    
    if (leadData && user?.is_hr) {
      // Setup financial form
      const loanAmt = leadData.loan_amount || 0;
      const expectedRev = (loanAmt * (user.default_revenue_pct || 2.0) / 100).toFixed(0);
      const expectedCom = (loanAmt * (user.default_commission_pct || 0.5) / 100).toFixed(0);
      setFinForm({
        revenue: leadData.revenue !== null ? leadData.revenue : expectedRev,
        commission: leadData.commission !== null ? leadData.commission : expectedCom,
      });
    }

    if (eligData) {
      setEligibility(eligData);
      setEligForm({
        income: eligData.income || '',
        existing_emi: eligData.existing_emi || '',
        cibil_score: eligData.cibil_score || '',
        requested_amount: eligData.requested_amount || '',
      });
    }

    if (leadData) {
      setEditForm({
        name: leadData.name || '',
        phone: leadData.phone || '',
        loan_amount: leadData.loan_amount || '',
        source: leadData.source || '',
        business_type: leadData.business_type || '',
      });
    }

    setNotes(noteData || []);
    setLoading(false);
  };

  const updateStatus = async (newStatus) => {
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    setLead((l) => ({ ...l, status: newStatus }));
    
    await logActivity(user, 'lead_updated', `Status changed to ${newStatus} for ${lead.name}`);
    
    toast(`Status updated to "${newStatus}"`, 'success');
  };

  const handleUpdateLead = async () => {
    if (!editForm.name || !editForm.phone) { toast('Name and phone are required', 'error'); return; }
    setEditLoading(true);
    const { error } = await supabase.from('leads').update({
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      loan_amount: parseFloat(editForm.loan_amount) || null,
      source: editForm.source,
      business_type: editForm.business_type,
    }).eq('id', id);
    setEditLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    
    await logActivity(user, 'lead_updated', `Updated basic info for ${editForm.name}`);
    
    toast('Lead details updated!', 'success');
    setEditMode(false);
    fetchAll();
  };

  const handleLogCall = async () => {
    if (!callForm.notes.trim()) { toast('Please add call notes', 'error'); return; }
    setCallLoading(true);
    const { error } = await supabase.from('call_logs').insert({
      lead_id: id,
      outcome: callForm.outcome,
      notes: callForm.notes,
      follow_up_date: callForm.follow_up_date || null,
      company_id: user?.company_id,
      employee_id: user?.id,
      employee_name: user?.user_metadata?.full_name || user?.email,
    });
    setCallLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    
    await logActivity(user, 'call_logged', `Logged a call with ${lead.name} (${callForm.outcome})`);
    
    toast('Call logged!', 'success');
    setCallForm({ outcome: 'Interested', notes: '', follow_up_date: '' });
    fetchAll();
  };

  const handleUpload = async () => {
    if (!uploadFile) { toast('Please select a file', 'error'); return; }
    setUploading(true);
    setUploadProgress(20);
    const uploadedByName = user?.user_metadata?.full_name || user?.email || 'admin';
    const { error } = await uploadDocToDb(id, uploadModal.docType, uploadFile, uploadedByName);
    setUploadProgress(90);
    if (error) { toast(error.message, 'error'); setUploading(false); setUploadProgress(0); return; }
    setUploadProgress(100);
    
    await logActivity(user, 'doc_uploaded', `Uploaded ${uploadModal.label} for ${lead.name}`);
    
    setTimeout(() => {
      setUploading(false); setUploadProgress(0);
      setUploadModal(null); setUploadFile(null);
      fetchAll();
      toast('Document uploaded!', 'success');
    }, 400);
  };

  const handleVerifyDoc = async (docId, newStatus) => {
    await supabase.from('documents').update({ status: newStatus }).eq('id', docId);
    fetchAll();
    toast(`Document ${newStatus}`, newStatus === 'verified' ? 'success' : 'warning');
  };

  const handleViewDoc = async (filePath) => {
    const url = await getSignedUrl(filePath);
    if (!url) { toast('Could not open document', 'error'); return; }
    // Browsers block window.open() with data: URIs → convert to Blob URL first
    if (url.startsWith('data:')) {
      try {
        const res  = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        // Revoke after tab has loaded to free memory
        if (win) setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch {
        toast('Could not open document', 'error');
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const handleSaveEligibility = async () => {
    setEligLoading(true);
    const income = parseFloat(eligForm.income) || 0;
    const existingEmi = parseFloat(eligForm.existing_emi) || 0;
    const cibil = parseInt(eligForm.cibil_score) || 0;
    const foir = 0.5; // 50% FOIR
    const availableEmi = income * foir - existingEmi;
    const rate = 0.01; // 1% monthly
    const tenure = 60;
    const suggested = availableEmi > 0 ? Math.round(availableEmi * ((Math.pow(1 + rate, tenure) - 1) / (rate * Math.pow(1 + rate, tenure)))) : 0;
    const payload = {
      lead_id: id,
      income, existing_emi: existingEmi, cibil_score: cibil,
      requested_amount: parseFloat(eligForm.requested_amount) || null,
      suggested_amount: suggested,
    };
    const existing = eligibility;
    if (existing) {
      await supabase.from('eligibility').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabase.from('eligibility').insert(payload);
    }
    setEligLoading(false);
    toast('Eligibility saved!', 'success');
    fetchAll();
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setNoteLoading(true);
    await supabase.from('notes').insert({ lead_id: id, content: noteText.trim() });
    
    await logActivity(user, 'note_added', `Added a note on ${lead.name}`);
    
    setNoteLoading(false);
    setNoteText('');
    fetchAll();
    toast('Note added', 'success');
  };

  const handleSaveFinancials = async () => {
    setFinLoading(true);
    const { error } = await supabase.from('leads').update({
      revenue: parseFloat(finForm.revenue) || 0,
      commission: parseFloat(finForm.commission) || 0,
    }).eq('id', id);
    setFinLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Financials saved!', 'success');
    fetchAll();
  };

  const sendClientLink = () => {
    if (!lead?.client_token) return;
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const url = `${appUrl}/apply/${lead.client_token}`;
    copyToClipboard(url);
    const msg = buildPortalLinkMessage(lead, url);
    openWhatsApp(lead.phone, msg);
    toast('Link copied & WhatsApp opened!', 'success');
  };

  const openReminderModal = () => {
    // Auto-select docs that are missing or rejected
    const missing = DOC_LIST
      .filter(({ key }) => {
        const doc = documents.find((d) => d.doc_type === key);
        return !doc || doc.status === 'pending' || doc.status === 'rejected';
      })
      .map(({ key }) => key);
    setReminderDocs(missing);
    setReminderOpen(true);
  };

  const sendReminder = () => {
    if (!reminderDocs.length) { toast('Select at least one document', 'error'); return; }
    const msg = buildReminderMessage(lead, reminderDocs);
    openWhatsApp(lead.phone, msg);
    setReminderOpen(false);
    toast('WhatsApp reminder opened!', 'success');
  };

  if (loading) return <div className="loader-center"><div className="spinner spinner-lg" /></div>;
  if (!lead) return <div className="empty-state"><div className="empty-state-title">Lead not found</div></div>;

  const stageIdx = PIPELINE.indexOf(lead.status);
  const allDocsUploaded = DOC_LIST.every(({ key }) => documents.find((d) => d.doc_type === key && d.status !== 'pending'));
  const allDocsVerified = DOC_LIST.every(({ key }) => documents.find((d) => d.doc_type === key && d.status === 'verified'));

  const cibilClass = !eligibility?.cibil_score ? '' : eligibility.cibil_score >= 750 ? 'cibil-good' : eligibility.cibil_score >= 650 ? 'cibil-average' : 'cibil-poor';
  const cibilLabel = !eligibility?.cibil_score ? '—' : eligibility.cibil_score >= 750 ? 'Excellent' : eligibility.cibil_score >= 650 ? 'Average' : 'Poor';

  return (
    <div>
      {/* Back + Lead ID */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>← Back</button>
        <span className="font-mono text-muted" style={{ fontSize: '0.85rem' }}>{lead.lead_id}</span>
        <Badge status={lead.status} />
      </div>

      {/* Lead header */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-elevated))' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 'var(--r-lg)',
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {lead.name[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{lead.name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{lead.phone} · {lead.source || 'Unknown'} · {lead.business_type || ''}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>Created {formatDate(lead.created_at)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(lead.loan_amount)}</span>
            <button className="btn btn-green btn-sm" onClick={sendClientLink}>📲 Send Portal Link</button>
            <button className="btn btn-secondary btn-sm" onClick={openReminderModal}>🔔 Send Reminder</button>
            <select className="form-input" style={{ width: 'auto', fontSize: '0.85rem' }}
              value={lead.status} onChange={(e) => updateStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* Pipeline progress */}
        <div className="lead-pipeline mt-6">
          {PIPELINE.map((stage, i) => (
            <div key={stage}
              className={`lead-stage ${i < stageIdx ? 'completed' : i === stageIdx ? 'current-stage' : ''}`}
            >
              <div className="stage-dot">{i < stageIdx ? '✓' : i + 1}</div>
              <div className="stage-label">{stage.charAt(0).toUpperCase() + stage.slice(1)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['overview','Overview'],['calls','📞 Call Logs'],['docs','📂 Documents'],['eligibility','📊 Eligibility'],['notes','📝 Notes']].map(([k,l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────── */}
      {tab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Basic Information</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Cancel' : '✏️ Edit Details'}
              </button>
            </div>
            
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Loan Amount (₹)</label>
                  <input className="form-input" type="number" value={editForm.loan_amount} onChange={(e) => setEditForm(f => ({ ...f, loan_amount: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Source</label>
                  <select className="form-input" value={editForm.source} onChange={(e) => setEditForm(f => ({ ...f, source: e.target.value }))}>
                    <option value="">Select source…</option>
                    {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Business Type</label>
                  <select className="form-input" value={editForm.business_type} onChange={(e) => setEditForm(f => ({ ...f, business_type: e.target.value }))}>
                    <option value="">Select type…</option>
                    {BUSINESS_TYPE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={handleUpdateLead} disabled={editLoading}>
                  {editLoading ? 'Saving…' : '💾 Save Changes'}
                </button>
              </div>
            ) : (
              [
                ['Lead ID', lead.lead_id],
                ['Name', lead.name],
                ['Phone', lead.phone],
                ['Loan Amount', formatCurrency(lead.loan_amount)],
                ['Source', lead.source || '—'],
                ['Business Type', lead.business_type || '—'],
                ['Status', <Badge key="s" status={lead.status} />],
                ['Created', formatDate(lead.created_at)],
                ['Last Updated', formatDate(lead.updated_at)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{val}</span>
                </div>
              ))
            )}
          </div>

          {user?.is_hr && (
            <div className="card mt-4" style={{ border: '1px solid var(--purple)', background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), transparent)' }}>
              <div className="card-title mb-4" style={{ color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>💰</span> Financials (HR Only)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)' }}>
                Auto-calculated based on company settings ({user.default_revenue_pct}% Revenue, {user.default_commission_pct}% Commission). You can override these before saving.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                <div className="form-group">
                  <label className="form-label">Revenue Generated (₹)</label>
                  <input className="form-input" type="number" value={finForm.revenue}
                    onChange={(e) => setFinForm(f => ({ ...f, revenue: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Commission to Employee (₹)</label>
                  <input className="form-input" type="number" value={finForm.commission}
                    onChange={(e) => setFinForm(f => ({ ...f, commission: e.target.value }))} />
                </div>
                <button className="btn btn-primary" style={{ background: 'var(--purple)' }} onClick={handleSaveFinancials} disabled={finLoading}>
                  {finLoading ? 'Saving…' : '💾 Save Financials'}
                </button>
              </div>
            </div>
          )}

          <div className="card mt-4">
            <div className="card-title mb-4">Document Status</div>
            {DOC_LIST.map(({ key, label, icon }) => {
              const doc = documents.find((d) => d.doc_type === key);
              return (
                <div key={key} className={`doc-item${doc?.status === 'verified' ? ' verified' : ''}`}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc?.file_name || 'Not uploaded'}</div>
                  </div>
                  <DocBadge status={doc?.status || 'pending'} />
                </div>
              );
            })}
            <div style={{ marginTop: 'var(--sp-4)', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)', background: allDocsVerified ? 'var(--green-light)' : allDocsUploaded ? 'var(--amber-light)' : 'var(--bg-elevated)', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: allDocsVerified ? 'var(--green)' : allDocsUploaded ? 'var(--amber)' : 'var(--text-muted)' }}>
              {allDocsVerified ? '✅ All documents verified' : allDocsUploaded ? '⏳ Awaiting verification' : '❌ Documents incomplete'}
            </div>
          </div>
        </div>
      )}

      {/* ── CALL LOGS ──────────────────────────────── */}
      {tab === 'calls' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-title mb-4">Log a Call</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div className="form-group">
                <label className="form-label">Outcome</label>
                <select className="form-input" value={callForm.outcome} onChange={(e) => setCallForm((f) => ({ ...f, outcome: e.target.value }))}>
                  {['Interested', 'Not Interested', 'Follow-up', 'No Answer'].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={4} placeholder="Call summary…" value={callForm.notes}
                  onChange={(e) => setCallForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Follow-up Date & Time</label>
                <input type="datetime-local" className="form-input" value={callForm.follow_up_date}
                  onChange={(e) => setCallForm((f) => ({ ...f, follow_up_date: e.target.value }))} />
              </div>
              <button className="btn btn-primary" onClick={handleLogCall} disabled={callLoading}>
                {callLoading ? 'Logging…' : '📞 Log Call'}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="card-title mb-4">Call History</div>
            {callLogs.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📞</div><div className="empty-state-title">No calls logged yet</div></div>
            ) : (
              <div className="timeline">
                {callLogs.map((log, i) => {
                  const dotClass = log.outcome === 'Interested' ? 'outcome-interested' : log.outcome === 'Not Interested' ? 'outcome-not' : 'outcome-followup';
                  return (
                    <div key={log.id} className="timeline-item">
                      <div className="timeline-line">
                        <div className={`timeline-dot ${dotClass}`} />
                        {i < callLogs.length - 1 && <div className="timeline-connector" />}
                      </div>
                      <div className="timeline-body">
                        <div className="timeline-title">{log.outcome}</div>
                        <div className="timeline-sub">{log.notes}</div>
                        {log.follow_up_date && <div style={{ fontSize: '0.75rem', color: 'var(--amber)', marginTop: 2, fontWeight: 600 }}>🔔 Follow-up: {formatDateTime(log.follow_up_date)}</div>}
                        <div className="timeline-time">{formatDateTime(log.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DOCUMENTS ─────────────────────────────── */}
      {tab === 'docs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* Summary bar */}
          <div className="card" style={{ padding: 'var(--sp-4) var(--sp-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-5)' }}>
              {[['Uploaded', documents.filter(d => d.status !== 'pending').length, 'var(--accent)'],
                ['Verified', documents.filter(d => d.status === 'verified').length, 'var(--green)'],
                ['Pending', DOC_LIST.length - documents.filter(d => d.status !== 'pending').length, 'var(--amber)'],
              ].map(([lbl, val, color]) => (
                <div key={lbl} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{val}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem' }}>/{DOC_LIST.length}</span></div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={openReminderModal}>
              🔔 Send Reminder for Missing Docs
            </button>
          </div>

          <div className="card">
            <div className="card-title mb-4">Document Checklist</div>
            {DOC_LIST.map(({ key, label, icon }) => {
              const doc = documents.find((d) => d.doc_type === key);
              const isMissing = !doc || doc.status === 'pending';
              const isRejected = doc?.status === 'rejected';
              return (
                <div key={key} className={`doc-item${doc?.status === 'verified' ? ' verified' : ''}`}
                  style={{ marginBottom: 'var(--sp-3)', borderLeft: isRejected ? '3px solid var(--red)' : isMissing ? '3px solid var(--amber)' : '3px solid transparent', paddingLeft: 'var(--sp-3)' }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {doc?.file_name || 'Not uploaded'}
                      {doc?.uploaded_by && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-elevated)', fontSize: '0.7rem' }}>by {doc.uploaded_by}</span>}
                    </div>
                    {doc?.uploaded_at && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Uploaded {formatDate(doc.uploaded_at)}</div>}
                    {isRejected && <div style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: 2, fontWeight: 600 }}>⚠️ Rejected — client must re-upload</div>}
                    {isMissing && <div style={{ fontSize: '0.75rem', color: 'var(--amber)', marginTop: 2 }}>📤 Not yet uploaded</div>}
                  </div>
                  <DocBadge status={doc?.status || 'pending'} />
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    {doc?.file_path && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleViewDoc(doc.file_path)}>👁 View</button>
                    )}
                    {doc && doc.status !== 'verified' && (
                      <button className="btn btn-green btn-sm" onClick={() => handleVerifyDoc(doc.id, 'verified')}>✓ Verify</button>
                    )}
                    {doc && doc.status !== 'rejected' && doc.status !== 'pending' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleVerifyDoc(doc.id, 'rejected')}>✕ Reject</button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => setUploadModal({ docType: key, label })}>⬆ Upload</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ELIGIBILITY ───────────────────────────── */}
      {tab === 'eligibility' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-title mb-4">Financial Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {[
                { key: 'income', label: 'Monthly Income (₹)', placeholder: '50000' },
                { key: 'existing_emi', label: 'Existing EMI (₹)', placeholder: '5000' },
                { key: 'cibil_score', label: 'CIBIL Score', placeholder: '750' },
                { key: 'requested_amount', label: 'Requested Loan Amount (₹)', placeholder: '500000' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type="number" placeholder={placeholder}
                    value={eligForm[key]} onChange={(e) => setEligForm((f) => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <button className="btn btn-primary" onClick={handleSaveEligibility} disabled={eligLoading}>
                {eligLoading ? 'Saving…' : '📊 Calculate & Save'}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="card-title mb-4">Eligibility Result</div>
            {eligibility ? (
              <>
                <div style={{ marginBottom: 'var(--sp-4)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Suggested Loan Amount</div>
                  <div className="eligibility-amount">{formatCurrency(eligibility.suggested_amount)}</div>
                </div>
                {[
                  ['Monthly Income', formatCurrency(eligibility.income)],
                  ['Existing EMI', formatCurrency(eligibility.existing_emi)],
                  ['Requested Amount', formatCurrency(eligibility.requested_amount)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>CIBIL Score:</span>
                  <span className={`cibil-badge ${cibilClass}`}>{eligibility.cibil_score} – {cibilLabel}</span>
                </div>
                <div style={{ marginTop: 'var(--sp-5)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', background: eligibility.suggested_amount >= (eligibility.requested_amount || 0) ? 'var(--green-light)' : 'var(--red-light)', color: eligibility.suggested_amount >= (eligibility.requested_amount || 0) ? 'var(--green)' : 'var(--red)', fontWeight: 700, textAlign: 'center' }}>
                  {eligibility.suggested_amount >= (eligibility.requested_amount || 0) ? '✅ Eligible – Proceed' : '⚠️ Under-eligible – Review required'}
                </div>
              </>
            ) : <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">Fill in financial details to calculate eligibility</div></div>}
          </div>
        </div>
      )}

      {/* ── NOTES ─────────────────────────────────── */}
      {tab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div className="card">
            <div className="form-group">
              <label className="form-label">Add Note</label>
              <textarea className="form-input" rows={3} placeholder="Add a note about this lead…"
                value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            </div>
            <button className="btn btn-primary mt-4" onClick={handleAddNote} disabled={noteLoading}>
              {noteLoading ? 'Saving…' : '+ Add Note'}
            </button>
          </div>
          {notes.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📝</div><div className="empty-state-title">No notes yet</div></div>
          ) : notes.map((n) => (
            <div key={n.id} className="card card-sm">
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{n.content}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--sp-2)' }}>{formatDateTime(n.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={!!uploadModal}
        onClose={() => { setUploadModal(null); setUploadFile(null); setUploadProgress(0); }}
        title={`Upload ${uploadModal?.label}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setUploadModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !uploadFile}>
              {uploading ? 'Uploading…' : '⬆ Upload'}
            </button>
          </>
        }
      >
        <FileUpload label={`Drop ${uploadModal?.label} here`} onFile={setUploadFile} />
        {uploading && <UploadProgress progress={uploadProgress} />}
      </Modal>

      {/* Reminder Modal */}
      <Modal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        title="🔔 Send Document Reminder"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setReminderOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={sendReminder} disabled={!reminderDocs.length}>
              📲 Send via WhatsApp
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)' }}>
          Select the documents to remind <strong>{lead?.name}</strong> to upload:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {DOC_LIST.map(({ key, label, icon }) => {
            const doc = documents.find((d) => d.doc_type === key);
            const status = doc?.status || 'pending';
            const checked = reminderDocs.includes(key);
            return (
              <label key={key} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                padding: 'var(--sp-3)', borderRadius: 'var(--r-md)',
                border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                background: checked ? 'rgba(79,142,247,0.07)' : 'var(--bg-elevated)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setReminderDocs(e.target.checked
                    ? [...reminderDocs, key]
                    : reminderDocs.filter((k) => k !== key)
                  )}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                />
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: status === 'verified' ? 'var(--green)' : status === 'rejected' ? 'var(--red)' : status === 'uploaded' ? 'var(--accent)' : 'var(--amber)' }}>
                    {status === 'verified' ? '✓ Verified' : status === 'rejected' ? '✕ Rejected — re-upload needed' : status === 'uploaded' ? '⏳ Uploaded, awaiting review' : '📤 Not uploaded yet'}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        {reminderDocs.length > 0 && (
          <div style={{ marginTop: 'var(--sp-4)', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)', background: 'rgba(79,142,247,0.07)', border: '1px solid rgba(79,142,247,0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            💬 WhatsApp will open with a message listing <strong>{reminderDocs.length}</strong> missing document(s) for {lead?.name}.
          </div>
        )}
      </Modal>
    </div>
  );
}
