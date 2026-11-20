"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  PhoneIncoming, 
  PhoneOutgoing, 
  FileText, 
  PlayCircle, 
  Calendar, 
  Clock, 
  User,
  Search,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity
} from "lucide-react";
import styles from "./calls.module.css";
import { clsx } from 'clsx';
import { LiveMonitor } from '@/components/dashboard/LiveMonitor/LiveMonitor';
import { toast } from 'react-hot-toast';

import { getCalls, deleteCall, getCallDetail } from '@/app/actions/calls';
import { useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function CallLogsPage() {
  const [view, setView] = useState<'logs' | 'live'>('logs');
  const [calls, setCalls] = useState<any[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    setIsLoading(true);
    const result = await getCalls();
    if (result.success) {
      setCalls(result.calls || []);
      if (result.calls?.length > 0) {
        setSelectedCallId(result.calls[0].id);
      }
    }
    setIsLoading(false);
  };

  const activeCall = calls.find(c => c.id === selectedCallId);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const handleDelete = async () => {
    if (!selectedCallId || !confirm("Are you sure you want to delete this call log?")) return;
    setIsLoading(true);
    const result = await deleteCall(selectedCallId);
    if (result.success) {
      toast.success("Call log deleted");
      fetchCalls();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleExportPDF = async () => {
    if (!selectedCallId) return;
    setIsLoading(true);
    
    try {
      const result = await getCallDetail(selectedCallId);
      if (!result.success || !result.call) throw new Error(result.error || "Failed to fetch details");
      
      const call = result.call;
      const doc = new jsPDF();
      
      // Header Background
      doc.setFillColor(26, 27, 35);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("AI Intelligence Report", 20, 25);
      
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 140, 25);
      
      // Basic Info
      doc.setTextColor(33, 33, 33);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Call Record: ${call.leads?.name || 'Unknown'}`, 20, 55);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Call ID: ${call.id}`, 20, 62);
      doc.text(`Phone: ${call.leads?.phone || 'N/A'}`, 20, 68);
      doc.text(`Agent: ${call.agents?.name || 'AI Assistant'}`, 20, 74);
      doc.text(`Duration: ${formatDuration(call.duration_sec)}`, 20, 80);
      
      // Metrics
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 85, 190, 85);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Sentiment:", 20, 95);
      doc.setFont("helvetica", "normal");
      doc.text(call.sentiment || "N/A", 50, 95);
      doc.text("Interest Score:", 110, 95);
      doc.text(`${call.interest_score || 0}/10`, 145, 95);
      
      // Summary
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", 20, 110);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(call.summary || "AI analysis is pending.", 170);
      doc.text(summaryLines, 20, 120);
      
      // Transcript
      const summaryHeight = summaryLines.length * 5;
      let currentY = 130 + summaryHeight;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Full Transcript", 20, currentY);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      currentY += 10;
      const transcriptLines = doc.splitTextToSize(call.transcript || "No transcript available.", 170);
      transcriptLines.forEach((line: string) => {
        if (currentY > 280) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, 20, currentY);
        currentY += 5;
      });
      
      doc.save(`AI_Report_${call.leads?.name || 'Call'}.pdf`);
      toast.success("PDF Exported!");
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Call Logs & Intelligence</h1>
          <p className={styles.subtitle}>Review AI-generated transcripts, sentiment, and outcomes.</p>
        </div>
        <div className={styles.viewToggle}>
          <Button 
            variant={view === 'logs' ? 'primary' : 'ghost'} 
            onClick={() => setView('logs')}
            leftIcon={<FileText size={18} />}
          >
            History
          </Button>
          <Button 
            variant={view === 'live' ? 'primary' : 'ghost'} 
            onClick={() => setView('live')}
            leftIcon={<Activity size={18} />}
          >
            Live Monitor
          </Button>
        </div>
      </div>

      {view === 'live' ? (
        <div className={styles.liveWrapper}>
          <LiveMonitor roomName="active-campaign-room" userId="admin-monitor" />
        </div>
      ) : (
        <div className={styles.layout}>
          {/* List of Calls */}
          <div className={styles.listArea}>
            <div className={styles.searchBox}>
               <Search size={18} />
               <input type="text" placeholder="Search by lead or summary..." />
            </div>
            <div className={styles.callList}>
              {calls.length > 0 ? calls.map((call) => (
                <div 
                  key={call.id} 
                  className={clsx(styles.callItem, selectedCallId === call.id && styles.activeCall)}
                  onClick={() => setSelectedCallId(call.id)}
                >
                  <div className={styles.callMeta}>
                    <div className={styles.leadInfo}>
                      <User size={16} />
                      <span>{call.leads?.name || 'Unknown Lead'}</span>
                    </div>
                    <span className={styles.callDate}>{new Date(call.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.callOutcome}>
                    <span className={clsx(styles.status, styles[call.status.toLowerCase()] || styles.completed)}>
                      {call.status}
                    </span>
                    <span className={styles.duration}>{formatDuration(call.duration_sec)}</span>
                  </div>
                </div>
              )) : (
                <div className={styles.emptyList}>No call logs yet</div>
              )}
            </div>
          </div>

          {/* Detailed View */}
          <div className={styles.detailArea}>
            {activeCall ? (
              <div className={styles.detailContent}>
                <div className={styles.detailHeader}>
                  <div className={styles.leadPrimary}>
                    <h2>{activeCall.leads?.name || 'Unknown Lead'}</h2>
                    <span className={styles.callId}>Call ID: {activeCall.id.slice(0, 8)}...</span>
                  </div>
                  <div className={styles.detailActions}>
                    <Button variant="outline" leftIcon={<PlayCircle size={18} />} disabled>Play Recording</Button>
                    <Button variant="ghost" onClick={handleDelete} style={{ color: '#ef4444' }}>Delete Log</Button>
                    <Button leftIcon={<FileText size={18} />} onClick={handleExportPDF}>Export PDF</Button>
                  </div>
                </div>

                <div className={styles.insightsGrid}>
                  <div className={styles.insightCard}>
                    <span className={styles.insightLabel}>Sentiment</span>
                    <div className={styles.sentimentValue}>
                      {activeCall.sentiment === 'Positive' ? <TrendingUp color="var(--success)" /> : 
                       activeCall.sentiment === 'Negative' ? <TrendingDown color="var(--danger)" /> : <Minus />}
                      <span>{activeCall.sentiment || 'Analyzing...'}</span>
                    </div>
                  </div>
                  <div className={styles.insightCard}>
                    <span className={styles.insightLabel}>Interest Score</span>
                    <div className={styles.scoreValue}>
                      <span className={styles.bigScore}>{activeCall.interest_score || 0}</span>
                      <span className={styles.maxScore}>/10</span>
                    </div>
                  </div>
                  <div className={styles.insightCard}>
                    <span className={styles.insightLabel}>Duration</span>
                    <span className={styles.insightValue}>{formatDuration(activeCall.duration_sec)}</span>
                  </div>
                </div>

                <div className={styles.summarySection}>
                  <h3>AI Executive Summary</h3>
                  <div className={styles.summaryBox}>
                    {activeCall.summary || 'AI analysis is pending or no summary available.'}
                  </div>
                </div>

                <div className={styles.transcriptSection}>
                  <div className={styles.transcriptHeader}>
                    <h3>Full Transcript</h3>
                    <span className={styles.aiBadge}>AI Transcribed</span>
                  </div>
                  <div className={styles.transcriptContent}>
                    {activeCall.transcript ? (
                      <div className={styles.bubbleAgent}>
                        <span className={styles.speaker}>Full Call Intelligence</span>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{activeCall.transcript}</p>
                      </div>
                    ) : (
                      <div className={styles.emptyTranscript}>
                        Transcript will appear here once the AI finishes processing the call.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <PhoneOutgoing size={48} />
                <p>Select a call to view AI insights and transcripts</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
