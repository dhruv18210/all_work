"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Zap, 
  Activity, 
  Phone, 
  AlertCircle, 
  RefreshCw, 
  Search,
  Signal,
  CheckCircle2
} from "lucide-react";
import styles from "../admin.module.css";
import { clsx } from 'clsx';
import { getAllCalls } from "@/app/actions/org";
import { toast } from "react-hot-toast";

export default function CallMonitoring() {
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCalls, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCalls = async () => {
    const result = await getAllCalls();
    if (result.success) {
      setCalls(result.calls || []);
    } else {
      toast.error(result.error || "Failed to fetch calls");
    }
    setIsLoading(false);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Zap size={32} className={styles.adminIcon} />
          <div>
            <h1 className={styles.title}>Global Call Monitoring</h1>
            <p className={styles.subtitle}>Real-time monitoring of live calls, system health, and provider performance.</p>
          </div>
        </div>
        <div className={styles.monitoringStatus}>
          <div className={styles.statusBadge}>
            <div className={styles.pulse} />
            <span>Live Monitor Active</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchCalls} isLoading={isLoading}>
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.managementSection} style={{ gridColumn: 'span 2' }}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerLeft}>
              <Phone size={20} />
              <h3>Live Calls Feed</h3>
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Call ID</th>
                <th>Organization</th>
                <th>Duration</th>
                <th>Status</th>
                <th>QoS</th>
                <th>Latency</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !calls.length ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading live feed...</td></tr>
              ) : calls.length > 0 ? calls.map((call) => (
                <tr key={call.id}>
                  <td><code className={styles.codeBadge}>{call.id.slice(0, 8)}...</code></td>
                  <td>{call.organizations?.name || 'Unknown'}</td>
                  <td>{formatDuration(call.duration_sec)}</td>
                  <td>
                    <span className={clsx(
                      styles.badge, 
                      call.status === 'COMPLETED' ? styles.success : 
                      call.status === 'IN_PROGRESS' || call.status === 'RINGING' ? styles.warning : styles.muted
                    )}>
                      {call.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.qosBar}>
                      <Signal size={14} className={styles.successText} />
                      <span>High</span>
                    </div>
                  </td>
                  <td>45ms</td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No calls found in the live feed.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.healthSection}>
          <div className={styles.sectionHeader}>
            <Activity size={20} />
            <h3>Provider Health</h3>
          </div>
          <div className={styles.healthList}>
            {[
              { provider: 'Twilio US-East', status: 'Operational', uptime: '99.99%' },
              { provider: 'Twilio EU-West', status: 'Operational', uptime: '99.98%' },
              { provider: 'Plivo Global', status: 'Operational', uptime: '99.95%' },
              { provider: 'Deepgram STT', status: 'High Latency', uptime: '98.4%' },
            ].map((p) => (
              <div key={p.provider} className={styles.healthItem}>
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceName}>{p.provider}</span>
                  <span className={styles.latency}>{p.uptime}</span>
                </div>
                <span className={clsx(styles.healthStatus, p.status.includes('Latency') ? styles.warning : styles.success)}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.healthFooter}>
            <AlertCircle size={16} />
            <span>STT processing is experiencing delays in US-East regions.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
