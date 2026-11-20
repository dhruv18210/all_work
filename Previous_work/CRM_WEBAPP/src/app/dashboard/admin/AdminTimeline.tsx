"use client";

import React from 'react';
import Link from 'next/link';
import styles from './timeline.module.css';
import { clsx } from 'clsx';
import { 
  ShieldCheck, 
  Users, 
  CreditCard, 
  Zap, 
  BarChart3, 
  Settings, 
  Bot, 
  Lock, 
  Bell 
} from 'lucide-react';

const steps = [
  { id: 1, title: 'AUTHENTICATION FLOW (ADMIN)', desc: 'Secure login and dashboard access', icon: ShieldCheck, class: 'step1', status: 'Active', href: '/auth/login' },
  { id: 3, title: 'GLOBAL USER MANAGEMENT FLOW', desc: 'Manage user permissions and access', icon: Users, class: 'step3', status: 'Operational', href: '/dashboard/admin/users' },
  { id: 4, title: 'BILLING & SUBSCRIPTION FLOW', desc: 'Create and monitor subscription plans', icon: CreditCard, class: 'step4', status: 'Operational', href: '/dashboard/admin/billing' },
  { id: 5, title: 'GLOBAL CALL MONITORING FLOW', desc: 'Monitor live calls and analyze trends', icon: Zap, class: 'step5', status: 'Live', href: '/dashboard/admin/monitoring' },
  { id: 6, title: 'PLATFORM ANALYTICS FLOW', desc: 'Display executive dashboard with key metrics', icon: BarChart3, class: 'step6', status: 'Reporting', href: '/dashboard/admin/analytics' },
  { id: 7, title: 'SYSTEM SETTINGS FLOW', desc: 'Configure system settings and providers', icon: Settings, class: 'step7', status: 'Configured', href: '/dashboard/admin/config' },
  { id: 8, title: 'AI MODEL CONTROL FLOW', desc: 'Tune AI behavior and language settings', icon: Bot, class: 'step8', status: 'Optimized', href: '/dashboard/admin/ai' },
  { id: 9, title: 'COMPLIANCE & SECURITY FLOW', desc: 'Enforce compliance and ensure data security', icon: Lock, class: 'step9', status: 'Verified', href: '/dashboard/admin/compliance' },
  { id: 10, title: 'SUPPORT & INCIDENT FLOW', desc: 'Manage support tickets and system alerts', icon: Bell, class: 'step10', status: 'Active', href: '/dashboard/admin/support' },
];

export function AdminTimeline() {
  return (
    <div className={styles.timelineContainer}>
      <h2 className={styles.timelineTitle}>Platform Admin Management Timeline</h2>
      <div className={styles.timeline}>
        {steps.map((step) => (
          <div key={step.id} className={clsx(styles.timelineItem, styles[step.class])}>
            <div className={styles.timelineDot} />
            <Link href={step.href} className={styles.timelineContent}>
              <div className={styles.textGroup}>
                <span className={styles.stepTitle}>{step.id}. {step.title}</span>
                <span className={styles.stepDesc}>{step.desc}</span>
              </div>
              <div className={styles.statusBadge}>
                {step.status}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
