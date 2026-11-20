import { useState, useEffect, useRef } from 'react';

const SUGGESTED_QUESTIONS = [
  "What documents are required?",
  "How long does the approval take?",
  "Check my application status",
  "Interest rates for Personal Loans",
  "Mortgage loan eligibility"
];

const BOT_RESPONSES = {
  "What documents are required?": "Commonly required documents include PAN Card, Aadhaar Card, last 6 months Bank Statement, and ITR for the last 2-3 years. Check the 'Upload Documents' tab for your specific requirements!",
  "How long does the approval take?": "Initial review usually takes 24-48 business hours. Once documents are verified, final sanction can happen within 3-5 working days.",
  "Check my application status?": "You can view your real-time status in the 'Application Status' tab of this portal. We update it as soon as our team makes progress!",
  "Interest rates for Personal Loans": "Our personal loan rates currently range from 10.5% to 18% p.a., depending on your credit score and income profile.",
  "Mortgage loan eligibility": "Eligibility depends on property value, your monthly income, and existing liabilities. Typically, you can get up to 70-80% of the property value."
};

const DEFAULT_RESPONSE = "I'm here to help! Feel free to ask about documents, interest rates, or the application process. For urgent matters, please contact our support team.";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your Loan Assistant. How can I help you today?", isBot: true, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    
    const userMsg = { id: Date.now(), text, isBot: false, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate bot thinking
    setTimeout(() => {
      const responseText = BOT_RESPONSES[text] || DEFAULT_RESPONSE;
      const botMsg = { id: Date.now() + 1, text: responseText, isBot: true, time: new Date() };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 60, height: 60,
          borderRadius: '50%', background: 'var(--accent-gradient)',
          color: '#fff', border: 'none', cursor: 'pointer', zIndex: 1000,
          boxShadow: 'var(--accent-glow)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 28, transition: 'all 0.3s ease',
          animation: 'pulse-glow 2s infinite'
        }}
        className={isOpen ? 'btn-active' : ''}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="glass"
          style={{
            position: 'fixed', bottom: 100, right: 24, width: 380, height: 500,
            borderRadius: 'var(--r-lg)', zIndex: 1000, display: 'flex', 
            flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s ease',
            border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Header */}
          <div style={{ 
            padding: 'var(--sp-4)', background: 'var(--accent-gradient)', 
            color: '#fff', display: 'flex', alignItems: 'center', gap: 12 
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', border: '2px solid #fff' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Loan Assistant</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Always active</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: 'var(--sp-4)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {messages.map(m => (
              <div key={m.id} style={{ 
                alignSelf: m.isBot ? 'flex-start' : 'flex-end',
                maxWidth: '85%', padding: '10px 14px', borderRadius: 'var(--r-md)',
                background: m.isBot ? 'var(--bg-elevated)' : 'var(--accent)',
                color: m.isBot ? 'var(--text-primary)' : '#fff',
                fontSize: '0.85rem', position: 'relative',
                boxShadow: m.isBot ? 'none' : '0 4px 12px rgba(99,102,241,0.2)'
              }}>
                {m.text}
                <div style={{ 
                  fontSize: '0.65rem', opacity: 0.6, marginTop: 4, 
                  textAlign: m.isBot ? 'left' : 'right' 
                }}>
                  {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div style={{ padding: '8px 16px', display: 'flex', gap: 8, overflowX: 'auto', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
            {SUGGESTED_QUESTIONS.map(q => (
              <button 
                key={q} 
                onClick={() => handleSend(q)}
                style={{ 
                  whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 'var(--r-full)',
                  border: '1px solid var(--border)', background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: 'var(--sp-3)', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input 
              className="form-input"
              style={{ borderRadius: 'var(--r-full)', fontSize: '0.85rem' }}
              placeholder="Type your query..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend(input)}
            />
            <button 
              className="btn btn-primary" 
              style={{ borderRadius: '50%', width: 42, height: 42, padding: 0, justifyContent: 'center' }}
              onClick={() => handleSend(input)}
            >
              🚀
            </button>
          </div>
        </div>
      )}
    </>
  );
}
