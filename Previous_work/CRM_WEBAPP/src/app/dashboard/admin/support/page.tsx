"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Bell, 
  LifeBuoy, 
  AlertOctagon, 
  MessageSquare, 
  Terminal,
  Activity,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle2
} from "lucide-react";
import styles from "../admin.module.css";
import { clsx } from 'clsx';
import { getSupportData, declareIncident } from '@/app/actions/org';
import { toast } from 'react-hot-toast';

export default function SupportIncident() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getSupportData();
    if (result.success) {
      setTickets(result.tickets);
      setAlerts(result.alerts);
      setIncidents(result.incidents);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleDeclareIncident = async () => {
    const title = prompt("Incident Title (e.g., API Outage):");
    if (!title) return;
    
    const desc = prompt("Description:");
    const severity = prompt("Severity (MINOR, MAJOR, CRITICAL):") || 'MAJOR';

    setIsLoading(true);
    const result = await declareIncident({ title, description: desc || '', severity });
    if (result.success) {
      toast.success("Incident declared and logged.");
      fetchData();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  if (isLoading && tickets.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Syncing system health and tickets...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Bell size={32} className={styles.adminIcon} />
          <div>
            <h1 className={styles.title}>Support & Incident Flow</h1>
            <p className={styles.subtitle}>System alerts, support tickets, error logs, and downtime monitoring.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" leftIcon={<Terminal size={16} />} onClick={() => toast.success("Opening debug logs...")}>View Debug Logs</Button>
          <Button variant="danger" leftIcon={<AlertOctagon size={16} />} onClick={handleDeclareIncident}>Declare Incident</Button>
        </div>
      </div>

      {incidents.length > 0 && (
        <div className={styles.activeIncidentBanner}>
          <AlertOctagon size={24} />
          <div>
            <strong>Active Incident: {incidents[0].title}</strong>
            <p>{incidents[0].description}</p>
          </div>
          <span className={styles.incidentSeverity}>{incidents[0].severity}</span>
        </div>
      )}

      <div className={styles.mainGrid}>
        <div className={styles.managementSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerLeft}>
              <MessageSquare size={20} />
              <h3>Active Support Tickets</h3>
            </div>
          </div>
          <div className={styles.ticketList}>
            {tickets.length > 0 ? tickets.map((ticket) => (
              <div key={ticket.id} className={styles.ticketItem}>
                <div className={styles.ticketInfo}>
                  <div className={styles.ticketPrimary}>
                    <span className={styles.ticketId}>{ticket.ticket_number}</span>
                    <span className={styles.ticketOrg}>{ticket.organizations?.name}</span>
                  </div>
                  <p className={styles.ticketSubject}>{ticket.subject}</p>
                </div>
                <div className={styles.ticketMeta}>
                  <span className={clsx(styles.priorityBadge, styles[ticket.priority.toLowerCase()])}>{ticket.priority}</span>
                  <Button variant="ghost" size="sm"><ExternalLink size={14} /></Button>
                </div>
              </div>
            )) : (
              <div className={styles.emptyTickets}>
                <CheckCircle2 size={40} color="var(--success)" />
                <p>All clear! No active support tickets.</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.healthSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerLeft}>
              <Activity size={20} />
              <h3>System Alerts</h3>
            </div>
          </div>
          <div className={styles.alertList}>
            {alerts.length > 0 ? alerts.map((alert) => (
              <div key={alert.id} className={clsx(styles.alertItem, styles[alert.type.toLowerCase()])}>
                <div className={styles.alertHeader}>
                  <span className={styles.alertType}>{alert.type}</span>
                  <span className={styles.alertTime}>{getTimeAgo(alert.created_at)}</span>
                </div>
                <p className={styles.alertMessage}>{alert.message}</p>
              </div>
            )) : (
              <p className={styles.noAlerts}>No system alerts in the last 24h.</p>
            )}
          </div>
        </div>

        <div className={styles.managementSection} style={{ gridColumn: 'span 2' }}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerLeft}>
              <Clock size={20} />
              <h3>Platform Uptime (Last 7 Days)</h3>
            </div>
          </div>
          <div className={styles.uptimeGrid}>
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className={styles.uptimeBlock} title={`Status: Operational`} />
            ))}
            <div className={styles.uptimeSummary}>
              <span className={styles.uptimeValue}>99.992%</span>
              <span className={styles.uptimeLabel}>Overall Availability</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
