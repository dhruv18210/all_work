'use client';

import React from 'react';
import { MoreHorizontal, Phone, User, CheckCircle2, Clock } from 'lucide-react';
import './LeadTable.css';

const mockLeads = [
  { id: 1, name: 'John Doe', phone: '+1 234 567 8901', status: 'new', score: 85, language: 'English' },
  { id: 2, name: 'Jane Smith', phone: '+1 987 654 3210', status: 'contacted', score: 42, language: 'English' },
  { id: 3, name: 'Amit Kumar', phone: '+91 999 888 7776', status: 'qualified', score: 95, language: 'Hindi' },
  { id: 4, name: 'Robert Fox', phone: '+1 555 444 3332', status: 'rejected', score: 12, language: 'English' },
];

const LeadTable = () => {
  return (
    <div className="table-container animate-fade">
      <div className="table-header">
        <h2>Recent Leads</h2>
        <button className="view-all">View All</button>
      </div>
      <table className="premium-table">
        <thead>
          <tr>
            <th>Lead</th>
            <th>Phone</th>
            <th>Language</th>
            <th>Status</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockLeads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <div className="lead-cell">
                  <div className="avatar-small">
                    <User size={14} />
                  </div>
                  <span>{lead.name}</span>
                </div>
              </td>
              <td>{lead.phone}</td>
              <td>
                <span className="lang-tag">{lead.language}</span>
              </td>
              <td>
                <span className={`status-badge ${lead.status}`}>
                  {lead.status === 'qualified' && <CheckCircle2 size={12} />}
                  {lead.status === 'contacted' && <Clock size={12} />}
                  {lead.status}
                </span>
              </td>
              <td>
                <div className="score-meter">
                  <div className="score-bar" style={{ width: `${lead.score}%`, backgroundColor: lead.score > 70 ? 'var(--status-success)' : lead.score > 40 ? 'var(--status-warning)' : 'var(--status-error)' }}></div>
                  <span>{lead.score}</span>
                </div>
              </td>
              <td>
                <div className="action-btns">
                  <button className="call-btn"><Phone size={14} /></button>
                  <button className="more-btn"><MoreHorizontal size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
