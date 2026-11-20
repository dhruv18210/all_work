'use client';

import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Calendar, 
  ShieldCheck, 
  Settings,
  Headset
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', href: '/' },
    { icon: <Users size={20} />, label: 'Leads', href: '/leads' },
    { icon: <PhoneCall size={20} />, label: 'Call Logs', href: '/calls' },
    { icon: <Calendar size={20} />, label: 'Callbacks', href: '/callbacks' },
    { icon: <Headset size={20} />, label: 'Agents', href: '/agents' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">K</div>
        <span className="logo-text">Kology<span>Call</span></span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href} className="nav-item">
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link href="/settings" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <div className="agent-badge">
          <ShieldCheck size={16} />
          <span>System Active</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
