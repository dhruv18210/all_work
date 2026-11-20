"use client";

import React from 'react';
import Link from 'next/link';
import styles from './flow.module.css';
import { clsx } from 'clsx';
import { 
  ShieldCheck, 
  Users, 
  Bot, 
  UserPlus, 
  Zap, 
  PhoneCall, 
  UserRound, 
  BarChart3, 
  Layers, 
  Plug, 
  Bell, 
  BrainCircuit 
} from 'lucide-react';

const flowSteps = [
  {
    id: 1,
    title: 'Organization Auth',
    desc: 'Signup, verify, and create your organization workspace.',
    features: ['Owner Role', 'Manager Role', 'Agent Role'],
    icon: ShieldCheck,
    href: '/auth/login',
    class: 'step1'
  },
  {
    id: 2,
    title: 'Team Management',
    desc: 'Invite users, assign hierarchy, and define permissions.',
    features: ['Team Hierarchy', 'Activity Tracking', 'Departments'],
    icon: Users,
    href: '/dashboard/team',
    class: 'step2'
  },
  {
    id: 3,
    title: 'AI Agent Creation',
    desc: 'Configure conversation logic, voices, and prompts.',
    features: ['Script Builder', 'AI Settings', 'Escalation Logic'],
    icon: Bot,
    href: '/dashboard/agents',
    class: 'step3'
  },
  {
    id: 4,
    title: 'Lead & CRM',
    desc: 'Import leads, assign them to agents, and track activity.',
    features: ['Lead Import', 'CRM Intel', 'Activity Logs'],
    icon: UserPlus,
    href: '/dashboard/leads',
    class: 'step4'
  },
  {
    id: 5,
    title: 'Campaign Management',
    desc: 'Set up automated calling campaigns for target segments.',
    features: ['Batch Setup', 'Execution', 'Segmentation'],
    icon: Zap,
    href: '/dashboard/campaigns',
    class: 'step5'
  },
  {
    id: 6,
    title: 'Live Call',
    desc: 'Monitor real-time conversations and transcriptions.',
    features: ['Real-time Transcripts', 'Sentiment', 'Recording'],
    icon: PhoneCall,
    href: '/dashboard/calls',
    class: 'step6'
  },
  {
    id: 7,
    title: 'Human Handoff',
    desc: 'Detect frustration and transfer calls to live agents.',
    features: ['Warm Transfer', 'Internal Notes', 'Takeover'],
    icon: UserRound,
    href: '/dashboard/handoff',
    class: 'step7'
  },
  {
    id: 8,
    title: 'Organization Analytics',
    desc: 'Executive dashboards and granular agent metrics.',
    features: ['Exec Dashboard', 'Campaign Stats', 'Agent KPIs'],
    icon: BarChart3,
    href: '/dashboard/analytics',
    class: 'step8'
  },
  {
    id: 9,
    title: 'Automation',
    desc: 'Trigger actions based on call outcomes and events.',
    features: ['Custom Triggers', 'Execution', 'Notifications'],
    icon: Layers,
    href: '/dashboard/automation',
    class: 'step9'
  },
  {
    id: 10,
    title: 'API & Integration',
    desc: 'Connect your existing CRM and ERP via webhooks.',
    features: ['Webhooks', 'Lead Push API', 'ERP Sync'],
    icon: Plug,
    href: '/dashboard/integrations',
    class: 'step10'
  },
  {
    id: 11,
    title: 'Notification Hub',
    desc: 'Stay updated on campaign progress and priority leads.',
    features: ['High-Priority Alerts', 'Failure Logs', 'Success Reports'],
    icon: Bell,
    href: '/dashboard/notifications',
    class: 'step11'
  }
];

export function OrganizationFlow() {
  return (
    <div className={styles.flowContainer}>
      <h2 className={styles.flowTitle}>Organization Side Management Flow</h2>
      <div className={styles.flowGrid}>
        {flowSteps.map((step) => (
          <Link key={step.id} href={step.href} className={clsx(styles.flowItem, styles[step.class])}>
            <div className={styles.iconWrapper}>
              <step.icon size={24} />
            </div>
            <div className={styles.content}>
              <span className={styles.stepTitle}>Flow 0{step.id}</span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.desc}>{step.desc}</p>
              <div className={styles.features}>
                {step.features.map((feature, i) => (
                  <span key={i} className={styles.featureTag}>{feature}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
