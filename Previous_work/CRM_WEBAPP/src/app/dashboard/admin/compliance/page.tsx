"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  History, 
  Search,
  Download,
  AlertTriangle,
  UserCheck,
  Loader2
} from "lucide-react";
import styles from "../admin.module.css";
import { clsx } from 'clsx';
import { getComplianceData, updateComplianceSettings } from '@/app/actions/org';
import { toast } from 'react-hot-toast';

export default function ComplianceSecurity() {
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getComplianceData();
    if (result.success) {
      setLogs(result.logs);
      setSettings(result.settings);
    } else {
      toast.error(result.error || "Failed to load compliance data");
    }
    setIsLoading(false);
  };

  const handleToggle = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    setIsSaving(true);
    const result = await updateComplianceSettings({ [key]: value });
    if (result.success) {
      toast.success("Policy updated");
    } else {
      toast.error(result.error);
      fetchData(); // Revert on failure
    }
    setIsSaving(false);
  };

  const handleMaxCallsChange = async (value: number) => {
    const newSettings = { ...settings, max_calls_per_lead: value };
    setSettings(newSettings);
    
    setIsSaving(true);
    const result = await updateComplianceSettings({ max_calls_per_lead: value });
    if (result.success) {
      toast.success("Limit updated");
    } else {
      toast.error(result.error);
      fetchData();
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Loading security audit trails...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <ShieldCheck size={32} className={styles.adminIcon} />
          <div>
            <h1 className={styles.title}>Compliance & Security Flow</h1>
            <p className={styles.subtitle}>Audit trails, DND enforcement, consent logging, and data encryption policies.</p>
          </div>
        </div>
        <Button variant="outline" leftIcon={<Download size={16} />}>Export Audit Log</Button>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.managementSection} style={{ gridColumn: 'span 2' }}>
          <div className={styles.sectionHeader}>
            <History size={20} />
            <h3>Recent Audit Trails</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.user_email || log.user_id?.slice(0,8) || 'System'}</td>
                  <td>{log.action}</td>
                  <td>{log.resource}</td>
                  <td>
                    <span className={clsx(styles.badge, log.status === 'Flagged' ? styles.warning : log.status === 'Failed' ? styles.danger : styles.success)}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.healthSection}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={20} />
            <h3>DND Enforcement</h3>
          </div>
          <div className={styles.complianceList}>
            <div className={styles.complianceItem}>
              <label>Global DND Check</label>
              <input 
                type="checkbox" 
                checked={settings?.global_dnd_check} 
                onChange={(e) => handleToggle('global_dnd_check', e.target.checked)}
                disabled={isSaving}
              />
            </div>
            <div className={styles.complianceItem}>
              <label>Record Consent on Every Call</label>
              <input 
                type="checkbox" 
                checked={settings?.record_consent} 
                onChange={(e) => handleToggle('record_consent', e.target.checked)}
                disabled={isSaving}
              />
            </div>
            <div className={styles.complianceItem}>
              <label>Max Calls per Lead (24h)</label>
              <input 
                type="number" 
                value={settings?.max_calls_per_lead} 
                onChange={(e) => handleMaxCallsChange(parseInt(e.target.value))}
                disabled={isSaving}
              />
            </div>
          </div>
          <Button variant="outline" fullWidth style={{ marginTop: '1rem' }}>Manage Blocked Numbers</Button>
        </div>

        <div className={styles.healthSection}>
          <div className={styles.sectionHeader}>
            <UserCheck size={20} />
            <h3>Consent Logging</h3>
          </div>
          <div className={styles.statsMini}>
            <div className={styles.statMini}>
              <span>Consents Logged (24h)</span>
              <strong>{settings?.consents_count_24h?.toLocaleString()}</strong>
            </div>
            <div className={styles.statMini}>
              <span>Withdrawals (24h)</span>
              <strong>{settings?.withdrawals_count_24h?.toLocaleString()}</strong>
            </div>
          </div>
          <Button variant="ghost" fullWidth rightIcon={<FileText size={14} />}>View Consent Registry</Button>
        </div>
      </div>
    </div>
  );
}
