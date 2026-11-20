import React from 'react'

export default function CreativeAgent({ data }) {
  if (!data) return null

  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 9 · Creative Content Agent</div>
        <h1>Creative Generation</h1>
        <p>Generated visually striking concepts, captions, and CTAs tailored to the industry aesthetic.</p>
      </div>

      <div className="data-grid mb-6">
        <div className="data-cell">
          <div className="data-label">Content Assets</div>
          <div className="data-value">{data.content?.length || 0} pieces generated</div>
        </div>
      </div>

      {data.content?.map((item, i) => (
        <div key={i} className="card mb-6" style={{ borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: 24 }}>✨</span>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 18, marginBottom: 4, letterSpacing: '-0.3px' }}>{item.goal}</h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4, color: 'var(--text-primary)' }}>{item.content_type}</span>
                  • Est. Reach: <span style={{ color: 'var(--success)' }}>{item.estimated_reach}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body" style={{ padding: 24 }}>
            {/* Visual Concept Block */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
                Visual Aesthetic
              </div>
              
              <div style={{ 
                width: '100%', 
                height: item.image_url ? 'auto' : 240, 
                borderRadius: 16, 
                background: `linear-gradient(135deg, ${item.image_style?.palette?.[0] || '#4f46e5'}, ${item.image_style?.palette?.[1] || '#9333ea'})`,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.3)',
                marginBottom: 16
              }}>
                {item.image_url ? (
                  <img src={item.image_url} alt="Generated visual concept" style={{ width: '100%', height: 'auto', display: 'block' }} />
                ) : (
                  <>
                    {/* Decorative Elements */}
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '50%', height: '150%', background: `linear-gradient(90deg, transparent, ${item.image_style?.palette?.[2] || '#ec4899'})`, opacity: 0.4, transform: 'rotate(15deg)', filter: 'blur(30px)' }}></div>
                    <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                    
                    <h3 style={{ fontSize: 28, fontWeight: 800, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.3)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', zIndex: 1, textAlign: 'center', padding: '0 20px' }}>
                      {item.image_style?.mood || 'Concept'}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 8, zIndex: 1, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                      {item.image_style?.style || 'AI-Generated Visual Concept'}
                    </p>
                  </>
                )}
              </div>

              {/* Palette & Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4, alignSelf: 'center' }}>PALETTE:</span>
                  {item.image_style?.palette?.map((color, idx) => (
                    <div key={idx} style={{ 
                      width: 16, height: 16, borderRadius: '50%', background: color, 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)' 
                    }} title={color}></div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
                  🎭 {item.image_style?.mood}
                </div>
              </div>

              {/* Prompt Text */}
              <div style={{ 
                marginTop: 16, padding: '16px 20px', background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)',
                fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6
              }}>
                <span style={{ color: 'var(--accent-primary)' }}>&gt; image_prompt: </span>
                {item.image_prompt}
              </div>
            </div>

            {/* Copy Block */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--info)' }}></span>
                  Optimized Caption
                </div>
                <div style={{ 
                  padding: 20, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {item.caption}
                </div>
                <div style={{ marginTop: 8, textAlign: 'right', fontSize: 11, color: 'var(--text-muted)' }}>
                  {item.caption?.length || 0} chars
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></span>
                  Call to Action (CTA)
                </div>
                <div style={{ 
                  padding: 16, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontWeight: 500
                }}>
                  {item.cta}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      ))}
    </div>
  )
}
