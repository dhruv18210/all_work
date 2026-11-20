'use client';

import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';
import './DashboardHeader.css';

interface DashboardHeaderProps {
  title: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>{title}</h1>
      </div>
      
      <div className="header-right">
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search leads, calls..." />
        </div>
        
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile">
          <UserCircle size={32} className="user-avatar" />
          <div className="user-info">
            <span className="user-name">System Admin</span>
            <span className="user-role">Superuser</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
