import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import LeadTable from '@/components/LeadTable';
import { PhoneCall, Users, CheckCircle, Clock } from 'lucide-react';
import './page.css';

export default function Home() {
  const stats = [
    { label: 'Total Leads', value: '1,284', icon: <Users size={24} />, color: 'blue' },
    { label: 'Active Calls', value: '12', icon: <PhoneCall size={24} />, color: 'cyan' },
    { label: 'Qualified', value: '458', icon: <CheckCircle size={24} />, color: 'green' },
    { label: 'Pending Callbacks', value: '24', icon: <Clock size={24} />, color: 'orange' },
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader title="System Overview" />
      
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card animate-fade">
            <div className={`stat-icon ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <div className="grid-left">
          <LeadTable />
        </div>
        
        <div className="grid-right">
          <div className="info-card animate-fade">
            <h3>System Status</h3>
            <div className="status-item">
              <span>Twilio API</span>
              <span className="status-online">Online</span>
            </div>
            <div className="status-item">
              <span>OpenAI Agent</span>
              <span className="status-online">Online</span>
            </div>
            <div className="status-item">
              <span>Deepgram STT</span>
              <span className="status-online">Online</span>
            </div>
            <div className="status-item">
              <span>ElevenLabs TTS</span>
              <span className="status-online">Online</span>
            </div>
          </div>

          <div className="info-card animate-fade" style={{ marginTop: '1.5rem' }}>
            <h3>Recent Activity</h3>
            <div className="activity-feed">
              <div className="activity-item">
                <div className="activity-dot blue"></div>
                <div className="activity-content">
                  <p>Outgoing call to <strong>John Doe</strong></p>
                  <span>2 mins ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot green"></div>
                <div className="activity-content">
                  <p><strong>Amit Kumar</strong> marked as qualified</p>
                  <span>15 mins ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot orange"></div>
                <div className="activity-content">
                  <p>Callback scheduled for <strong>Jane Smith</strong></p>
                  <span>1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
