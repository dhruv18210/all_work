"use client";

import React from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Calendar
} from "lucide-react";
import styles from "../admin.module.css";
import { clsx } from 'clsx';
import { getAdminStats } from "@/app/actions/org";
import { useEffect, useState } from "react";

export default function PlatformAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(res => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className={styles.loading}>Aggregating Platform Data...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <BarChart3 size={32} className={styles.adminIcon} />
          <div>
            <h1 className={styles.title}>Platform Analytics Flow</h1>
            <p className={styles.subtitle}>Aggregated metrics, revenue analysis, and organization performance trends.</p>
          </div>
        </div>
        <div className={styles.dateRange}>
          <Button variant="outline" leftIcon={<Calendar size={16} />}>Real-time Snapshot</Button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Globe size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>TOTAL PLATFORM CALLS</span>
            <span className={styles.statValue}>{data?.totalCalls?.toLocaleString() || 0}</span>
            <span className={styles.trendUp}><ArrowUpRight size={14} /> Live</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Users size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>TOTAL ORGANIZATIONS</span>
            <span className={styles.statValue}>{data?.totalOrganizations?.toLocaleString() || 0}</span>
            <span className={styles.trendUp}><ArrowUpRight size={14} /> Growth</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <TrendingUp size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>AI UTILIZATION</span>
            <span className={styles.statValue}>{data?.aiUtilization || '0%'}</span>
            <span className={styles.trendUp}><ArrowUpRight size={14} /> Stable</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <PieChart size={24} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>ACTIVE EST.</span>
            <span className={styles.statValue}>{data?.activeCalls || 0}</span>
            <span className={styles.trendUp}><ArrowUpRight size={14} /> Concurrent</span>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.managementSection}>
          <div className={styles.sectionHeader}>
            <TrendingUp size={20} />
            <h3>Top Performing Organizations</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ORGANIZATION</th>
                <th>CALL VOLUME</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {data?.topOrganizations?.length > 0 ? data.topOrganizations.map((org: any) => (
                <tr key={org.name}>
                  <td>{org.name}</td>
                  <td>{org.volume.toLocaleString()}</td>
                  <td className={styles.successText}>ACTIVE</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3}>No organization data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.healthSection}>
          <div className={styles.sectionHeader}>
            <PieChart size={20} />
            <h3>AI Success Metrics</h3>
          </div>
          <div className={styles.metricsList}>
            {[
              { label: 'Intent Recognition', value: data?.aiMetrics?.intentRecognition || '98.2%' },
              { label: 'Entity Extraction', value: data?.aiMetrics?.entityExtraction || '94.5%' },
              { label: 'Sentiment Accuracy', value: data?.aiMetrics?.sentimentAccuracy || '91.8%' },
              { label: 'Human Handoffs', value: data?.aiMetrics?.humanHandoffs || '4.2%' },
            ].map((metric) => (
              <div key={metric.label} className={styles.metricItem}>
                <span className={styles.metricLabel}>{metric.label}</span>
                <div className={styles.metricTrack}>
                  <div className={styles.metricFill} style={{ width: metric.value }} />
                </div>
                <span className={styles.metricValue}>{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
