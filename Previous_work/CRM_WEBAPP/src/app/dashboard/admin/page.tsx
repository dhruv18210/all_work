"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/Button/Button";
import { 
  ShieldCheck, 
  Activity, 
  Globe, 
  Server, 
  Users, 
  Building2, 
  CreditCard,
  Zap,
  BarChart3,
  Settings,
  Bot,
  Bell,
  ArrowUpRight
} from "lucide-react";
import styles from "./admin.module.css";
import { clsx } from 'clsx';
import { AdminTimeline } from "./AdminTimeline";
import { getAdminStats } from "@/app/actions/org";
import { useEffect, useState } from "react";

const adminModules = [
  { icon: ShieldCheck, title: 'Org Management', desc: 'Create and manage organizations', href: '/dashboard/admin/organizations', color: 'primary' },
  { icon: Users, title: 'Global Users', desc: 'Manage users and permissions', href: '/dashboard/admin/users', color: 'accent' },
  { icon: CreditCard, title: 'Billing & Plans', desc: 'Manage subscriptions and billing', href: '/dashboard/admin/billing', color: 'success' },
  { icon: Zap, title: 'Live Monitoring', desc: 'Real-time call tracking', href: '/dashboard/admin/monitoring', color: 'warning' },
  { icon: BarChart3, title: 'Platform Analytics', desc: 'Aggregate metrics and data', href: '/dashboard/admin/analytics', color: 'info' },
  { icon: Settings, title: 'System Config', desc: 'Global provider settings', href: '/dashboard/admin/config', color: 'primary' },
  { icon: Bot, title: 'AI Model Lab', href: '/dashboard/admin/ai', desc: 'Voice and model control', color: 'accent' },
  { icon: ShieldCheck, title: 'Compliance', href: '/dashboard/admin/compliance', desc: 'Audit and DND rules', color: 'success' },
  { icon: Bell, title: 'Support Hub', href: '/dashboard/admin/support', desc: 'Tickets and system alerts', color: 'error' },
];

export default function AdminControlPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(res => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className={styles.loading}>Initializing Secure Command Center...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <ShieldCheck size={32} className={styles.adminIcon} />
          <div>
            <h1 className={styles.title}>
              {data?.role === 'ADMIN' ? 'Super Admin Panel' : 'Organization Admin'}
            </h1>
            <p className={styles.subtitle}>
              {data?.role === 'ADMIN' ? 'Layer 1 — Platform Management Hub' : 'Manager Control Center'}
            </p>
          </div>
        </div>
        <div className={styles.systemStatus}>
          <div className={styles.statusItem}>
            <Activity size={16} />
            <span>Load: {data?.systemHealth?.load || '0%'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.pulse} style={{ width: 6, height: 6 }} />
            <span>Platform {data?.systemHealth?.status || 'Online'}</span>
          </div>
        </div>
      </div>

      {/* Global Metrics Snapshot */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Building2 size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>
              {data?.role === 'ADMIN' ? 'TOTAL ORGANIZATIONS' : 'TOTAL TEAM MEMBERS'}
            </span>
            <span className={styles.statValue}>{data?.totalOrganizations?.toLocaleString() || 0}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Globe size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>TOTAL PLATFORM CALLS</span>
            <span className={styles.statValue}>{data?.totalCalls?.toLocaleString() || 0}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Zap size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>SYSTEM HEALTH</span>
            <span className={styles.statValue}>99.9%</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Server size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>ACTIVE EST.</span>
            <span className={styles.statValue}>{data?.activeCalls || 0}</span>
          </div>
        </div>
      </div>

      <div className={styles.moduleGrid}>
        <h2 className={styles.sectionTitleSmall}>Platform Control Layers</h2>
        <div className={styles.moduleCards}>
          {adminModules.map((module) => (
            <Link key={module.title} href={module.href} className={styles.moduleCard}>
              <div className={clsx(styles.moduleIcon, styles[module.color])}>
                <module.icon size={24} />
              </div>
              <div className={styles.moduleContent}>
                <h3>{module.title}</h3>
                <p>{module.desc}</p>
              </div>
              <ArrowUpRight size={18} className={styles.moduleArrow} />
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Platform Management Timeline */}
        <div style={{ gridColumn: '1 / -1' }}>
          <AdminTimeline />
        </div>

        {/* Quick Monitoring Feed */}
        <div className={styles.managementSection}>
          <div className={styles.sectionHeader}>
            <Activity size={20} />
            <h3>Global System Feed</h3>
          </div>
          <div className={styles.healthList}>
            {data?.recentItems?.length > 0 ? data.recentItems.map((item: any, i: number) => (
              <div key={i} className={styles.healthItem}>
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceName}>
                    {data?.role === 'ADMIN' ? 'New Organization' : 'Team Member'}
                  </span>
                  <span className={styles.latency}>
                    {data?.role === 'ADMIN' ? item.name : item.email} {data?.role === 'ADMIN' ? 'joined' : 'active'}
                  </span>
                </div>
                <span className={styles.latency}>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            )) : (
              <div className={styles.emptyList}>No recent events</div>
            )}
          </div>
        </div>

        {/* Resource Health */}
        <div className={styles.healthSection}>
          <div className={styles.sectionHeader}>
            <Server size={20} />
            <h3>Resource Health</h3>
          </div>
          <div className={styles.healthList}>
            {(data?.resourceHealth || [
              { name: 'Core API', status: 'Operational' },
              { name: 'DB Cluster', status: 'Operational' },
              { name: 'AI Worker', status: 'Operational' },
              { name: 'Twilio Gateway', status: 'Operational' },
            ]).map((service: any) => (
              <div key={service.name} className={styles.healthItem}>
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceName}>{service.name}</span>
                  {service.latency && <span className={styles.latency}>{service.latency}</span>}
                </div>
                <span className={clsx(styles.healthStatus, service.status === 'Degraded' ? styles.warningText : styles.successText)}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
