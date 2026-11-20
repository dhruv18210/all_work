"use client";

import React from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Bot, 
  Mic2, 
  Zap, 
  Brain, 
  Plus, 
  Settings2,
  Library,
  Terminal
} from "lucide-react";
import styles from "../admin.module.css";
import { clsx } from 'clsx';

const voices = [
  { name: 'Aria (Neural)', provider: 'ElevenLabs', type: 'Feminine', accent: 'US' },
  { name: 'Marcus (Neural)', provider: 'ElevenLabs', type: 'Masculine', accent: 'UK' },
  { name: 'Sarah (Standard)', provider: 'Google Gemini', type: 'Feminine', accent: 'US' },
  { name: 'Sam (Neural)', provider: 'ElevenLabs', type: 'Masculine', accent: 'US' },
];

export default function AIModelControl() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Bot size={32} className={styles.adminIcon} />
          <div>
            <h1 className={styles.title}>AI Model Control Flow</h1>
            <p className={styles.subtitle}>Manage the voice library, fine-tune AI behavior, and configure prompt templates.</p>
          </div>
        </div>
        <Button leftIcon={<Plus size={16} />}>New Voice Model</Button>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.managementSection}>
          <div className={styles.sectionHeader}>
            <Library size={20} />
            <h3>Voice Model Library</h3>
          </div>
          <div className={styles.voiceList}>
            {voices.map((voice) => (
              <div key={voice.name} className={styles.voiceItem}>
                <div className={styles.voiceInfo}>
                  <Mic2 size={16} />
                  <div className={styles.voiceDetails}>
                    <span className={styles.voiceName}>{voice.name}</span>
                    <span className={styles.voiceMeta}>{voice.provider} • {voice.type} • {voice.accent}</span>
                  </div>
                </div>
                <div className={styles.voiceActions}>
                  <Button variant="ghost" size="sm">Test</Button>
                  <Button variant="ghost" size="sm"><Settings2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.managementSection}>
          <div className={styles.sectionHeader}>
            <Terminal size={20} />
            <h3>Prompt Template Control</h3>
          </div>
          <div className={styles.templateList}>
            {[
              { name: 'Outbound Sales', lastModified: '2 days ago' },
              { name: 'Appointment Setting', lastModified: '1 week ago' },
              { name: 'Customer Feedback', lastModified: '3 hours ago' },
            ].map((t) => (
              <div key={t.name} className={styles.templateItem}>
                <div className={styles.templateInfo}>
                  <span className={styles.templateName}>{t.name}</span>
                  <span className={styles.templateMeta}>Modified: {t.lastModified}</span>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.healthSection} style={{ gridColumn: 'span 2' }}>
          <div className={styles.sectionHeader}>
            <Brain size={20} />
            <h3>AI Behavior Tuning (Global)</h3>
          </div>
          <div className={styles.tuningGrid}>
            <div className={styles.tuningItem}>
              <label>Latency (Temperature)</label>
              <input type="range" min="0" max="100" defaultValue="70" />
            </div>
            <div className={styles.tuningItem}>
              <label>Interruptibility Threshold</label>
              <input type="range" min="0" max="100" defaultValue="45" />
            </div>
            <div className={styles.tuningItem}>
              <label>Speech Rate</label>
              <input type="range" min="0" max="100" defaultValue="60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
