"use client";

import { useEffect, useState } from 'react';
import { getAnalytics } from '@/app/actions/org';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  PhoneCall, 
  PieChart, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Brain,
  MessageCircle,
  Clock,
  Calendar,
  Download
} from "lucide-react";
import styles from "./analytics.module.css";
import { clsx } from 'clsx';
import { Button } from "@/components/ui/Button/Button";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then(res => {
      if (res.success) setData(res.data);
      setIsLoading(false);
    });
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  if (isLoading) return <div className={styles.loading}>Loading real-time insights...</div>;

  const funnel = data?.funnel || { totalDials: 0, connected: 0, interested: 0, qualified: 0 };
  const sentiments = data?.sentiments || { Positive: 0, Neutral: 0, Negative: 0 };
  const totalSentiments = sentiments.Positive + sentiments.Neutral + sentiments.Negative || 1;

  const getPercent = (val: number, total: number) => Math.round((val / total) * 100);


  const handleExport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.text('Advanced Analytics Report', 20, 20);
      
      doc.setFontSize(14);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
      
      doc.line(20, 35, 190, 35);
      
      doc.text('Conversion Funnel:', 20, 45);
      doc.text(`- Total Dials: ${funnel.totalDials}`, 30, 55);
      doc.text(`- Connected: ${funnel.connected}`, 30, 65);
      doc.text(`- Interested: ${funnel.interested}`, 30, 75);
      doc.text(`- Qualified: ${funnel.qualified}`, 30, 85);
      
      doc.text('Performance Metrics:', 20, 100);
      doc.text(`- Conversion Rate: ${funnel.totalDials ? Math.round((funnel.qualified / funnel.totalDials) * 100) : 0}%`, 30, 110);
      doc.text(`- Avg Handling Time: ${formatTime(data?.avgDuration || 0)}`, 30, 120);
      
      doc.save('CRM_Analytics_Report.pdf');
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Advanced Analytics</h1>
          <p className={styles.subtitle}>Deep insights into your AI agent performance and conversion funnels.</p>
        </div>
        <div className={styles.actions}>
          <Button 
            variant="outline" 
            leftIcon={<PhoneCall size={18} />}
            onClick={() => window.location.href = '/dashboard/calls'}
          >
            Real-time Feed
          </Button>
          <Button 
            leftIcon={<Download size={18} />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Conversion Rate</span>
            <span className={clsx(styles.trend, styles.up)}>Live <TrendingUp size={14} /></span>
          </div>
          <div className={styles.metricValue}>{funnel.totalDials ? Math.round((funnel.qualified / funnel.totalDials) * 100) : 0}%</div>
          <div className={styles.subtext}>From Dial to Qualified</div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Avg. AI Handling Time</span>
          </div>
          <div className={styles.metricValue}>{formatTime(data?.avgDuration || 0)}</div>
          <span className={styles.subtext}>Interaction Efficiency</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Leads Qualified</span>
            <span className={clsx(styles.trend, styles.up)}>+{funnel.qualified} <Users size={14} /></span>
          </div>
          <div className={styles.metricValue}>{funnel.qualified}</div>
          <span className={styles.subtext}>Active Pipeline Growth</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Conversion Funnel */}
        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <Target size={20} />
            <h3>Conversion Funnel</h3>
          </div>
          <div className={styles.funnelContainer}>
            <div className={styles.funnelStep}>
              <div className={styles.stepInfo}>
                <span className={styles.stepLabel}>Total Dials</span>
                <span className={styles.stepValue}>{funnel.totalDials.toLocaleString()}</span>
              </div>
              <div className={styles.funnelBar} style={{ width: '100%' }} />
            </div>
            <div className={styles.funnelStep}>
              <div className={styles.stepInfo}>
                <span className={styles.stepLabel}>Connected</span>
                <span className={styles.stepValue}>{funnel.connected.toLocaleString()}</span>
              </div>
              <div className={styles.funnelBar} style={{ width: `${getPercent(funnel.connected, funnel.totalDials || 1)}%` }} />
            </div>
            <div className={styles.funnelStep}>
              <div className={styles.stepInfo}>
                <span className={styles.stepLabel}>Interested</span>
                <span className={styles.stepValue}>{funnel.interested.toLocaleString()}</span>
              </div>
              <div className={styles.funnelBar} style={{ width: `${getPercent(funnel.interested, funnel.totalDials || 1)}%` }} />
            </div>
            <div className={styles.funnelStep}>
              <div className={styles.stepInfo}>
                <span className={styles.stepLabel}>Qualified</span>
                <span className={styles.stepValue}>{funnel.qualified.toLocaleString()}</span>
              </div>
              <div className={styles.funnelBar} style={{ width: `${getPercent(funnel.qualified, funnel.totalDials || 1)}%` }} />
            </div>
          </div>
        </div>

        {/* Sentiment Over Time */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <MessageCircle size={20} />
            <h3>Sentiment Distribution</h3>
          </div>
          <div className={styles.sentimentGrid}>
            <div className={styles.sentimentItem}>
              <div className={styles.sentimentCircle} style={{ background: 'var(--success)' }} />
              <span>Positive: {getPercent(sentiments.Positive, totalSentiments)}%</span>
            </div>
            <div className={styles.sentimentItem}>
              <div className={styles.sentimentCircle} style={{ background: 'var(--warning)' }} />
              <span>Neutral: {getPercent(sentiments.Neutral, totalSentiments)}%</span>
            </div>
            <div className={styles.sentimentItem}>
              <div className={styles.sentimentCircle} style={{ background: 'var(--error)' }} />
              <span>Negative: {getPercent(sentiments.Negative, totalSentiments)}%</span>
            </div>
          </div>
          <div className={styles.sentimentBar}>
            <div style={{ width: `${getPercent(sentiments.Positive, totalSentiments)}%`, background: 'var(--success)' }} />
            <div style={{ width: `${getPercent(sentiments.Neutral, totalSentiments)}%`, background: 'var(--warning)' }} />
            <div style={{ width: `${getPercent(sentiments.Negative, totalSentiments)}%`, background: 'var(--error)' }} />
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        {/* Peak Performance */}
        <div className={styles.card} style={{ gridColumn: 'span 2' }}>
          <div className={styles.sectionHeader}>
            <Clock size={20} />
            <h3>Peak Connection Times</h3>
          </div>
          <div className={styles.peakGrid}>
            {(data?.peakTimes || []).map((item: any) => (
              <div key={item.h} className={styles.peakItem}>
                <span className={styles.peakHour}>{item.h}:00</span>
                <div className={styles.peakBar} style={{ height: `${item.v || 5}%` }} />
              </div>
            ))}
          </div>
          <p className={styles.recommendation}>Optimal time to call: <strong>{data?.peakTimes?.sort((a: any, b: any) => b.v - a.v)[0]?.h || 10}:00 AM - {data?.peakTimes?.sort((a: any, b: any) => b.v - a.v)[0]?.h + 2 || 12}:00 PM</strong></p>
        </div>
      </div>
    </div>
  );
}

