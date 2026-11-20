"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  UserCircle2, 
  PhoneForwarded, 
  MessageSquare, 
  AlertCircle, 
  Play, 
  Radio,
  Clock,
  Mic,
  MicOff,
  User,
  History
} from "lucide-react";
import styles from "./handoff.module.css";
import { clsx } from 'clsx';
import { getCalls } from '@/app/actions/calls';
import { useEffect } from 'react';

export default function HumanHandoffPage() {
  const [liveCalls, setLiveCalls] = useState<any[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveCalls = async () => {
    const result = await getCalls();
    if (result.success) {
      const active = (result.calls || []).filter((c: any) => 
        ['IN_PROGRESS', 'RINGING', 'INITIATING'].includes(c.status)
      );
      setLiveCalls(active);
      if (active.length > 0 && !selectedCallId) {
        setSelectedCallId(active[0].id);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLiveCalls();
    const interval = setInterval(fetchLiveCalls, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeCall = liveCalls.find(c => c.id === selectedCallId);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Live Call Takeover</h1>
          <p className={styles.subtitle}>Monitor active AI conversations and intervene when a human touch is needed.</p>
        </div>
        <div className={styles.liveBadge}>
          <Radio size={16} className={styles.pulseIcon} />
          <span>{liveCalls.length} Active Calls</span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Active Calls List */}
        <div className={styles.listArea}>
          <div className={styles.listHeader}>
            <h3>Active Conversations</h3>
          </div>
          <div className={styles.callList}>
            {liveCalls.length > 0 ? liveCalls.map((call) => (
              <div 
                key={call.id} 
                className={clsx(styles.callItem, selectedCallId === call.id && styles.activeItem)}
                onClick={() => setSelectedCallId(call.id)}
              >
                <div className={styles.itemTop}>
                  <div className={styles.leadInfo}>
                    <UserCircle2 size={20} />
                    <span>{call.leads?.name || 'Unknown Lead'}</span>
                  </div>
                  <span className={styles.duration}>{formatDuration(call.duration_sec)}</span>
                </div>
                <p className={styles.lastMsg}>"{call.transcript?.split('\n').pop()?.slice(0, 80) || 'Call in progress...'}"</p>
                <div className={styles.itemBottom}>
                  <span className={clsx(styles.status, styles[call.status.toLowerCase()] || styles.ai_handling)}>
                    {call.sentiment === 'Negative' ? <AlertCircle size={12} /> : null}
                    {call.status.replace('_', ' ')}
                  </span>
                  <span className={clsx(styles.sentiment, styles[(call.sentiment || 'Neutral').toLowerCase()])}>
                    {call.sentiment || 'Neutral'}
                  </span>
                </div>
              </div>
            )) : (
              <div className={styles.emptyList} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                No active calls right now.
              </div>
            )}
          </div>
        </div>

        {/* Takeover Control Center */}
        <div className={styles.detailArea}>
          {activeCall ? (
            <div className={styles.controlContent}>
              <div className={styles.controlHeader}>
                <div className={styles.leadHeader}>
                  <h2>Monitoring: {activeCall.leads?.name || 'Unknown Lead'}</h2>
                  <div className={styles.metaRow}>
                    <span className={styles.metaItem}><Clock size={14} /> {formatDuration(activeCall.duration_sec)} elapsed</span>
                    <span className={styles.metaItem}><User size={14} /> {activeCall.agents?.name || 'AI Assistant'}</span>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button variant="outline" leftIcon={<MicOff size={18} />}>Listen Only</Button>
                  <Button variant="primary" className={styles.takeoverBtn} leftIcon={<PhoneForwarded size={18} />}>
                    TAKE OVER CALL
                  </Button>
                </div>
              </div>

              <div className={styles.liveTranscriptArea}>
                <div className={styles.transcriptHeader}>
                  <h3>Real-time Transcript</h3>
                  <div className={styles.aiBadge}>AI Handling</div>
                </div>
                <div className={styles.transcriptContent}>
                  <div className={styles.bubbleAgent}>
                    <span className={styles.speaker}>Full Call Intelligence</span>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{activeCall.transcript || 'Waiting for first words...'}</p>
                  </div>
                  {activeCall.sentiment === 'Negative' && (
                    <div className={styles.statusUpdate}>
                      <AlertCircle size={14} /> 
                      <span>AI detected negative sentiment. Human intervention recommended.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.leadContextArea}>
                <h3>Lead Context</h3>
                <div className={styles.contextGrid}>
                  <div className={styles.contextItem}>
                    <span className={styles.contextLabel}>Company</span>
                    <span className={styles.contextValue}>Rivera Design Ltd.</span>
                  </div>
                  <div className={styles.contextItem}>
                    <span className={styles.contextLabel}>Budget Range</span>
                    <span className={styles.contextValue}>$500 - $1,000 / mo</span>
                  </div>
                  <div className={styles.contextItem}>
                    <span className={styles.contextLabel}>Lead Score</span>
                    <span className={styles.contextValue}>84 / 100</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <User size={48} />
              <p>Select an active call to begin monitoring or takeover.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
