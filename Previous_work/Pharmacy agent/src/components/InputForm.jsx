import React, { useState } from 'react'

export default function InputForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    companyName: '',
    socialLinks: '',
    platformFocus: 'LinkedIn',
    pastMemory: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.companyName.trim()) return
    onSubmit(formData)
  }

  return (
    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="step-header" style={{ textAlign: 'center' }}>
        <div className="step-tag">🚀 Growth Intelligence System</div>
        <h1>Launch Your Growth Pipeline</h1>
        <p>Enter your company details to activate the 14-agent intelligence system. We'll analyze your brand, competitors, trends, and generate a complete 30-day growth strategy.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-1)' }}>🏢</div>
          <div>
            <h2>Company Information</h2>
            <p>All fields help our agents deliver better insights</p>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="companyName">Company Name *</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                className="form-input"
                placeholder="e.g., Acme Technologies"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="socialLinks">Social Media Links</label>
              <textarea
                id="socialLinks"
                name="socialLinks"
                className="form-textarea"
                placeholder="Paste links separated by commas or new lines&#10;e.g., https://linkedin.com/company/acme, https://instagram.com/acme"
                value={formData.socialLinks}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="platformFocus">Primary Platform Focus</label>
              <select
                id="platformFocus"
                name="platformFocus"
                className="form-select"
                value={formData.platformFocus}
                onChange={handleChange}
              >
                <option value="LinkedIn">LinkedIn — Professional & B2B</option>
                <option value="Instagram">Instagram — Visual & Lifestyle</option>
                <option value="Twitter">Twitter (X) — Real-time & Threads</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pastMemory">Past Memory (Optional)</label>
              <textarea
                id="pastMemory"
                name="pastMemory"
                className="form-textarea"
                placeholder="Paste any previous strategy data, content performance notes, or learnings from past campaigns..."
                value={formData.pastMemory}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: 8 }}>
              ⚡ Initialize Pipeline &amp; Run All Agents
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
