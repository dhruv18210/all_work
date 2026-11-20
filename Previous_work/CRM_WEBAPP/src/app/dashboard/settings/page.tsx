"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Settings, 
  Globe, 
  Clock, 
  ShieldAlert, 
  PhoneCall, 
  Lock, 
  Save,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import styles from "./settings.module.css";
import { clsx } from 'clsx';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>System Settings</h1>
          <p className={styles.subtitle}>Manage your organization preferences, business hours, and compliance rules.</p>
        </div>
        <Button leftIcon={<Save size={18} />}>Save All Changes</Button>
      </div>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <button 
            className={clsx(styles.navItem, activeSection === 'general' && styles.activeNav)}
            onClick={() => setActiveSection('general')}
          >
            <Settings size={18} /> General
          </button>
          <button 
            className={clsx(styles.navItem, activeSection === 'business' && styles.activeNav)}
            onClick={() => setActiveSection('business')}
          >
            <Clock size={18} /> Business Hours
          </button>
          <button 
            className={clsx(styles.navItem, activeSection === 'compliance' && styles.activeNav)}
            onClick={() => setActiveSection('compliance')}
          >
            <ShieldAlert size={18} /> Compliance & Legal
          </button>
          <button 
            className={clsx(styles.navItem, activeSection === 'calling' && styles.activeNav)}
            onClick={() => setActiveSection('calling')}
          >
            <PhoneCall size={18} /> Calling Rules
          </button>
          <button 
            className={clsx(styles.navItem, activeSection === 'security' && styles.activeNav)}
            onClick={() => setActiveSection('security')}
          >
            <Lock size={18} /> Security
          </button>
        </div>

        <div className={styles.mainContent}>
          {activeSection === 'general' && (
            <div className={styles.section}>
              <h3>General Configuration</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Organization Name</label>
                  <input type="text" defaultValue="Acme Corp" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>Primary Contact Email</label>
                  <input type="email" defaultValue="admin@acme.com" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>Timezone</label>
                  <select className={styles.select}>
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>PST (Pacific Standard Time)</option>
                    <option>EST (Eastern Standard Time)</option>
                    <option>IST (India Standard Time)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'business' && (
            <div className={styles.section}>
              <h3>Business Hours</h3>
              <p className={styles.sectionDesc}>Set the hours during which your AI agents are allowed to initiate calls.</p>
              <div className={styles.hoursGrid}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className={styles.dayRow}>
                    <span className={styles.dayName}>{day}</span>
                    <div className={styles.timeInputs}>
                      <input type="time" defaultValue="09:00" className={styles.timeInput} />
                      <span>to</span>
                      <input type="time" defaultValue="18:00" className={styles.timeInput} />
                    </div>
                    <div className={styles.toggle}>
                      <input type="checkbox" defaultChecked={day !== 'Sunday'} id={`toggle-${day}`} />
                      <label htmlFor={`toggle-${day}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'compliance' && (
            <div className={styles.section}>
              <h3>Compliance & Legal</h3>
              <div className={styles.complianceList}>
                <div className={styles.complianceItem}>
                  <div className={styles.compInfo}>
                    <span className={styles.compTitle}>Recording Disclaimer</span>
                    <p className={styles.compDesc}>Play a legal disclaimer at the start of every call.</p>
                    <textarea 
                      className={styles.textarea} 
                      defaultValue="This call is being recorded for quality and training purposes."
                    />
                  </div>
                  <div className={styles.toggle}><input type="checkbox" defaultChecked id="rec-t" /><label htmlFor="rec-t" /></div>
                </div>
                <div className={styles.complianceItem}>
                  <div className={styles.compInfo}>
                    <span className={styles.compTitle}>DND Scrubbing</span>
                    <p className={styles.compDesc}>Automatically filter out numbers on the national Do Not Call list.</p>
                  </div>
                  <div className={styles.toggle}><input type="checkbox" defaultChecked id="dnd-t" /><label htmlFor="dnd-t" /></div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'calling' && (
            <div className={styles.section}>
              <h3>Calling Rules</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Max Concurrent Calls</label>
                  <input type="number" defaultValue={50} className={styles.input} />
                  <span className={styles.hint}>Global limit for your organization</span>
                </div>
                <div className={styles.formGroup}>
                  <label>Retry Strategy</label>
                  <select className={styles.select}>
                    <option>Conservative (3 attempts, 2h gap)</option>
                    <option>Aggressive (5 attempts, 30m gap)</option>
                    <option>None</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
