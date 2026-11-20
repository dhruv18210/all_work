"use client";

import React from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Settings, 
  Server, 
  Database, 
  ShieldCheck, 
  Save,
  Globe,
  Lock,
  Cpu
} from "lucide-react";
import styles from "../admin.module.css";
import { clsx } from 'clsx';

export default function SystemConfig() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Settings size={32} className={styles.adminIcon} />
          <div>
            <h1 className={styles.title}>System Settings Flow</h1>
            <p className={styles.subtitle}>Global provider configuration, API keys, and platform-wide rules.</p>
          </div>
        </div>
        <Button leftIcon={<Save size={16} />}>Save All Changes</Button>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.managementSection}>
          <div className={styles.sectionHeader}>
            <Globe size={20} />
            <h3>Voice Provider Configuration (Twilio/Plivo)</h3>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <label>Default Provider</label>
              <select className={styles.select}>
                <option>Twilio</option>
                <option>Plivo</option>
                <option>Vapi (Direct)</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Master API Key</label>
              <div className={styles.passwordInput}>
                <input type="password" value="••••••••••••••••" readOnly />
                <Button variant="ghost" size="sm">Update</Button>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Global Retry Policy</label>
              <div className={styles.retryControl}>
                <input type="number" defaultValue={3} />
                <span>Attempts</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.managementSection}>
          <div className={styles.sectionHeader}>
            <Cpu size={20} />
            <h3>AI Engine Settings</h3>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <label>Default LLM Model</label>
              <select className={styles.select}>
                <option>GPT-4o (Default)</option>
                <option>Claude 3.5 Sonnet</option>
                <option>Llama 3 (Self-hosted)</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Global Prompt Suffix</label>
              <textarea placeholder="Appended to every agent prompt..." className={styles.textarea} />
            </div>
          </div>
        </div>

        <div className={styles.healthSection} style={{ gridColumn: 'span 2' }}>
          <div className={styles.sectionHeader}>
            <ShieldCheck size={20} />
            <h3>Security & Access Control</h3>
          </div>
          <div className={styles.securityGrid}>
            <div className={styles.securityItem}>
              <span>Enforce 2FA for all admins</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.securityItem}>
              <span>Audit log retention (days)</span>
              <input type="number" defaultValue={90} />
            </div>
            <div className={styles.securityItem}>
              <span>IP Whitelisting for Admin Access</span>
              <input type="text" placeholder="Enter comma-separated IPs..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
