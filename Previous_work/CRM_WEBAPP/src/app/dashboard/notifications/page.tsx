"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Trash2, 
  Settings2, 
  Search,
  Megaphone,
  UserCheck,
  PhoneOff
} from "lucide-react";
import styles from "./notifications.module.css";
import { clsx } from 'clsx';

const mockNotifications = [
  {
    id: 'not-1',
    type: 'SUCCESS',
    title: 'Campaign Completed',
    message: 'The "Real Estate Outreach" campaign has finished calling all 450 leads.',
    time: '5 mins ago',
    read: false,
    icon: Megaphone
  },
  {
    id: 'not-2',
    type: 'HIGH_VALUE',
    title: 'High-Value Lead Detected',
    message: 'John Doe from Acme Corp showed 9/10 interest in the Enterprise plan.',
    time: '1 hour ago',
    read: false,
    icon: UserCheck
  },
  {
    id: 'not-3',
    type: 'ERROR',
    title: 'Call Failed (DND)',
    message: 'Could not connect to lead Sarah Smith (+1...42) due to DND status.',
    time: '2 hours ago',
    read: true,
    icon: PhoneOff
  },
  {
    id: 'not-4',
    type: 'INFO',
    title: 'Monthly Usage Alert',
    message: 'You have reached 70% of your monthly calling minutes.',
    time: '1 day ago',
    read: true,
    icon: Info
  },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState('ALL');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>System Notifications</h1>
          <p className={styles.subtitle}>Stay updated on campaign progress and high-value interactions.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" leftIcon={<Settings2 size={18} />}>Preferences</Button>
          <Button variant="ghost" className={styles.clearBtn}><Trash2 size={18} /> Clear All</Button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <div className={styles.filterBar}>
            <div className={styles.tabs}>
              {['ALL', 'UNREAD', 'CAMPAIGNS', 'ALERTS'].map((t) => (
                <button 
                  key={t}
                  className={clsx(styles.tab, filter === t && styles.activeTab)}
                  onClick={() => setFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className={styles.searchBox}>
              <Search size={16} />
              <input type="text" placeholder="Search notifications..." />
            </div>
          </div>

          <div className={styles.notificationList}>
            {mockNotifications.map((not) => (
              <div key={not.id} className={clsx(styles.notificationCard, !not.read && styles.unread)}>
                <div className={clsx(styles.iconBox, styles[not.type.toLowerCase()])}>
                  <not.icon size={20} />
                </div>
                <div className={styles.notInfo}>
                  <div className={styles.notHeader}>
                    <h3>{not.title}</h3>
                    <span className={styles.notTime}>{not.time}</span>
                  </div>
                  <p className={styles.notMessage}>{not.message}</p>
                </div>
                <div className={styles.notActions}>
                  {!not.read && <div className={styles.unreadDot} />}
                  <button className={styles.moreBtn}>...</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.settingsCard}>
            <h3>Notification Settings</h3>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Email Alerts</span>
                <span className={styles.settingDesc}>Receive summaries in your inbox</span>
              </div>
              <div className={styles.toggle}><input type="checkbox" defaultChecked id="email-t" /><label htmlFor="email-t" /></div>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Slack Integration</span>
                <span className={styles.settingDesc}>Push high-value leads to #sales</span>
              </div>
              <div className={styles.toggle}><input type="checkbox" defaultChecked id="slack-t" /><label htmlFor="slack-t" /></div>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Browser Push</span>
                <span className={styles.settingDesc}>Real-time desktop notifications</span>
              </div>
              <div className={styles.toggle}><input type="checkbox" id="push-t" /><label htmlFor="push-t" /></div>
            </div>
          </div>

          <div className={styles.tipCard}>
            <CheckCircle2 size={24} className={styles.tipIcon} />
            <p><strong>Pro Tip:</strong> Enable Slack alerts for 9/10 interest leads to increase your closing rate by 30%.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
