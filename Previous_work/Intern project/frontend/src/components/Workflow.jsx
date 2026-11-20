import React, { useState } from 'react';
import { 
  Activity, Check, X, Edit2, Calendar, 
  Stethoscope, Shield, ArrowRight, Focus, 
  Image as ImageIcon, HeartPulse, Clock 
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

const Workflow = () => {
  const [stage, setStage] = useState('INTAKE'); 
  const [url, setUrl] = useState('');
  
  // Strategy State
  const [strategyData, setStrategyData] = useState(null);
  const [strategyStatus, setStrategyStatus] = useState(null);
  const [strategyComment, setStrategyComment] = useState('');

  // Asset State
  const [assetData, setAssetData] = useState(null);
  
  // Schedule State
  const [scheduleData, setScheduleData] = useState(null);

  const mockAnalysisSteps = [
    "Connecting to social media graph...",
    "Extracting clinical profile & patient demographics...",
    "Analyzing competitor presence...",
    "Identifying local healthcare trends...",
    "Synthesizing 30-day growth strategy..."
  ];
  const [loadingStep, setLoadingStep] = useState(0);

  const triggerAnalysisFeedback = () => {
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < mockAnalysisSteps.length) {
        setLoadingStep(currentStep);
      } else {
        clearInterval(interval);
      }
    }, 800);
    return interval;
  };

  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setStage('ANALYZING');
    setStrategyStatus(null);
    setLoadingStep(0);
    const interval = triggerAnalysisFeedback();
    
    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      
      clearInterval(interval);
      setLoadingStep(mockAnalysisSteps.length);
      setStrategyData(data.strategy);
      setStage('STRATEGY');
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      alert('Backend connection failed. Ensure server.js is running on port 3001.');
      setStage('INTAKE');
    }
  };

  const handleRequestModification = async () => {
    setStage('ANALYZING'); // Reuse the loader
    setLoadingStep(0);
    const interval = triggerAnalysisFeedback();

    try {
      const response = await fetch(`${API_BASE}/strategy/modify`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, comments: strategyComment })
      });
      const data = await response.json();
      
      clearInterval(interval);
      setStrategyData(data.strategy);
      setStrategyStatus(null);
      setStrategyComment('');
      setStage('STRATEGY');
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setStage('STRATEGY');
    }
  };

  const handleApproveStrategy = async () => {
    setStrategyStatus('accepted');
    setStage('GENERATING_ASSET');
    
    try {
      const response = await fetch(`${API_BASE}/generate-asset`, { method: 'POST' });
      const data = await response.json();
      
      setAssetData(data.asset);
      setStage('ASSET_REVIEW');
    } catch (err) {
      console.error(err);
      setStage('STRATEGY');
    }
  };
  
  const handleApproveAsset = async () => {
    setStage('ANALYZING'); // Reuse loader temporarily
    try {
      const response = await fetch(`${API_BASE}/schedule`, { method: 'POST' });
      const data = await response.json();
      
      setScheduleData(data.schedule);
      setStage('SCHEDULING');
    } catch (err) {
      console.error(err);
      setStage('ASSET_REVIEW');
    }
  };

  const renderIntake = () => (
    <div className="glass-panel text-center animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex justify-center mb-6">
        <div style={{ background: 'var(--accent-subtle)', padding: '20px', borderRadius: '50%' }}>
          <Stethoscope size={48} color="var(--text-accent)" />
        </div>
      </div>
      <h2>Healthcare Intelligence</h2>
      <p>Enter a practice or hospital social media profile to generate a tailored 30-day growth and content strategy.</p>
      
      <form onSubmit={handleStartAnalysis} className="mt-8">
        <input 
          type="url" 
          placeholder="e.g., https://instagram.com/your_clinic" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-full mt-4">
          Initiate Diagnostic Analysis <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="glass-panel text-center animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Activity size={48} color="var(--text-accent)" className="animate-spin mx-auto mb-6" />
      <h2>Diagnostic in Progress</h2>
      <div className="mt-8">
        {mockAnalysisSteps.map((step, index) => (
          <div 
            key={index} 
            className="flex items-center gap-4 mb-4"
            style={{ 
              opacity: index === loadingStep ? 1 : index < loadingStep ? 0.5 : 0.2,
              transform: index === loadingStep ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            {index < loadingStep ? <Check size={20} className="text-success" /> : <Activity size={20} />}
            <span style={{ fontWeight: index === loadingStep ? 500 : 300 }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStrategy = () => {
    if (!strategyData) return null;
    
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <div className="badge mb-4">Phase 1: Strategy Formulation</div>
          <h2>30-Day Clinical Growth Strategy</h2>
          <p>Based on our backend LLM analysis of {url || "this profile"}, here is the recommended approach.</p>
        </div>

        <div className="glass-panel mb-8">
          <div className="grid grid-cols-2" style={{ gap: '40px' }}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Focus className="text-accent" />
                <h3>{strategyData.positioning.title}</h3>
              </div>
              <p>{strategyData.positioning.body}</p>
              
              <div className="flex items-center gap-2 mt-6 mb-4">
                <HeartPulse className="text-accent" />
                <h3>{strategyData.competitorInsight.title}</h3>
              </div>
              <p>{strategyData.competitorInsight.body}</p>
            </div>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px' }}>
              <h3 className="mb-4">Content Pillars</h3>
              <ul className="custom-list">
                {strategyData.pillars.map((pillar, idx) => (
                  <li key={idx}><strong>{pillar.title}:</strong> {pillar.desc}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {strategyStatus === null && (
          <div className="flex justify-center gap-4 animate-fade-in">
            <button onClick={() => setStrategyStatus('rejected')} className="btn btn-danger">
              <X size={18} /> Reject
            </button>
            <button onClick={() => setStrategyStatus('modified')} className="btn btn-secondary">
              <Edit2 size={18} /> Modify
            </button>
            <button onClick={handleApproveStrategy} className="btn btn-primary">
              <Check size={18} /> Approve & Generate Assets
            </button>
          </div>
        )}

        {strategyStatus === 'modified' && (
          <div className="glass-panel mt-6 animate-fade-in" style={{ borderColor: 'var(--warning)' }}>
            <h3>Modification Request</h3>
            <textarea 
              rows="4" 
              placeholder="What specific changes would you like to see? (e.g., Focus more on pediatrics...)"
              value={strategyComment}
              onChange={(e) => setStrategyComment(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setStrategyStatus(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleRequestModification} className="btn btn-primary">Resubmit Analysis</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGeneratingAsset = () => (
    <div className="glass-panel text-center animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <ImageIcon size={48} color="var(--text-accent)" className="animate-pulse mx-auto mb-6" />
      <h2>Calling GenAI Image Models</h2>
      <p>Applying the approved strategy to generate a premium healthcare asset via API...</p>
      <div style={{ height: '4px', background: 'var(--accent-subtle)', borderRadius: '2px', overflow: 'hidden', marginTop: '24px' }}>
        <div style={{ height: '100%', background: 'var(--text-accent)', width: '50%', transition: 'width 3s linear' }} className="animate-pulse"></div>
      </div>
    </div>
  );

  const renderContentReview = () => {
    if (!assetData) return null;
    
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <div className="badge mb-4">Phase 2: Asset Review</div>
          <h2>Proposed Creative Post</h2>
        </div>

        <div className="grid grid-cols-2" style={{ gap: '40px', alignItems: 'start' }}>
          <div className="premium-image-container">
            <img src={assetData.imageUrl} alt="Generated by AI API" />
          </div>
          
          <div className="glass-panel">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-accent" />
              <h3 style={{ marginBottom: 0 }}>Social Copy</h3>
            </div>
            
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'system-ui', whiteSpace: 'pre-wrap' }}>
              <p style={{ color: '#334155', margin: 0, fontSize: '0.95rem' }}>
                {assetData.copy}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <button onClick={handleApproveAsset} className="btn btn-success w-full">
                <Check size={18} /> Accept Creative Concept
              </button>
              <div className="flex gap-4">
                <button className="btn btn-secondary flex-1">
                  <Edit2 size={18} /> Modify Copy
                </button>
                <button onClick={() => setStage('STRATEGY')} className="btn btn-danger flex-1">
                  <X size={18} /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScheduling = () => {
    if (!scheduleData) return null;
    
    return (
      <div className="animate-fade-in text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="flex justify-center mb-6">
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '24px', borderRadius: '50%' }}>
            <Calendar size={56} color="var(--success)" />
          </div>
        </div>
        <h2>Strategic Deployment Scheduled</h2>
        <p>The asset has been approved. Based on clinical engagement data, here is the optimal time.</p>
        
        <div className="glass-panel mt-8 text-left">
          <div className="flex items-center gap-6 p-4">
            <div style={{ background: 'var(--accent-subtle)', padding: '16px', borderRadius: '16px', textAlign: 'center', minWidth: '100px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-accent)' }}>{scheduleData.date.split(' ')[0]}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{scheduleData.date.split(' ')[1]}</div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-secondary" />
                <span style={{ fontWeight: 500 }}>Optimal Post Time: {scheduleData.time}</span>
              </div>
              <p style={{ margin: 0 }}>
                <em>Why this time?</em> {scheduleData.reason}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 text-center">
            <button className="btn btn-primary" onClick={() => {
              setStage('INTAKE');
              setUrl('');
              setStrategyStatus(null);
            }}>
              Queue Another Asset
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      {stage === 'INTAKE' && renderIntake()}
      {stage === 'ANALYZING' && renderAnalyzing()}
      {stage === 'STRATEGY' && renderStrategy()}
      {stage === 'GENERATING_ASSET' && renderGeneratingAsset()}
      {stage === 'ASSET_REVIEW' && renderContentReview()}
      {stage === 'SCHEDULING' && renderScheduling()}
    </div>
  );
};

export default Workflow;
