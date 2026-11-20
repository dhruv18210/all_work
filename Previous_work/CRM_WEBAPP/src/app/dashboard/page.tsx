"use client";

import { Button } from "@/components/ui/Button/Button";
import Link from "next/link";
import { 
  TrendingUp, 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Bot,
  Zap,
  Target,
  Trophy,
  Download
} from "lucide-react";
import styles from "./dashboard.module.css";
import { clsx } from "clsx";
import { getDashboardStats } from "@/app/actions/org";
import { useEffect, useState } from "react";
import { UserRole } from "@/lib/types";
import { OrganizationFlow } from "./OrganizationFlow";

export default function DashboardOverview() {
  const [userRole, setUserRole] = useState<UserRole>('MANAGER');
  const [stats, setStats] = useState<any>({
    totalCalls: 0,
    qualifiedLeads: 0,
    activeCampaigns: 0,
    conversionRate: "0%",
    totalOrganizations: 0,
    recentInteractions: [],
    topAgents: [],
    pipeline: {
      NEW: 0,
      INTERESTED: 0,
      CALLBACK: 0,
      QUALIFIED: 0,
      NOT_INTERESTED: 0
    }
  });

  useEffect(() => {
    getDashboardStats().then(res => {
      if (res.success) {
        // Merge with existing stats to ensure pipeline object exists
        setStats((prev: any) => ({ ...prev, ...res.stats }));
        
        // Dynamic role detection
        if (res.stats.role) {
          setUserRole(res.stats.role);
          // Simple logic: Only Platform Admin forced to Admin Screen from here
          // Managers go there from Login, but can stay here after Joining.
          if (res.stats.role === 'ADMIN') {
            window.location.href = '/dashboard/admin';
          }
        }
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            {userRole === 'ADMIN' ? 'Platform Command Center' : 
             userRole === 'MANAGER' ? 'Organization Overview' : 'My Work Center'}
          </h1>
          <p className={styles.subtitle}>
            {userRole === 'ADMIN' ? 'Global oversight of all tenant organizations and system health.' : 
             userRole === 'MANAGER' ? 'Monitor your team performance and AI calling pipeline.' : 
             'Track your assigned leads and personal follow-up goals.'}
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.dateDisplay}>
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          {userRole === 'MANAGER' && (
            <Link href="/dashboard/campaigns">
              <Button size="sm" leftIcon={<Zap size={16} />}>Launch Campaign</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className={styles.mainStats}>
        <StatCard 
          icon={<PhoneCall size={22} />} 
          label={userRole === 'ADMIN' ? 'System-wide Calls' : 'Total AI Calls'} 
          value={stats.totalCalls.toLocaleString()} 
          trend={stats.callTrend || "+0%"} 
          color="blue" 
        />
        <StatCard 
          icon={userRole === 'ADMIN' ? <ShieldCheck size={22} /> : <Users size={22} />} 
          label={userRole === 'ADMIN' ? 'Active Organizations' : 'Total Leads'} 
          value={userRole === 'ADMIN' ? stats.totalOrganizations : stats.qualifiedLeads.toLocaleString()} 
          trend={stats.leadTrend || "+0%"} 
          color="green" 
        />
        <StatCard 
          icon={<Target size={22} />} 
          label="Qualified Rate" 
          value={stats.conversionRate} 
          trend={stats.conversionTrend || "+0%"} 
          color="purple" 
        />
        {userRole !== 'ADMIN' && (
          <StatCard 
            icon={<Zap size={22} />} 
            label="Active Campaigns" 
            value={stats.activeCampaigns} 
            trend="Stable" 
            color="orange" 
          />
        )}
      </div>

      <div className={styles.dashboardGrid}>
        {/* Left Column: Visualizations */}
        <div className={styles.mainContent}>
          {userRole === 'MANAGER' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Lead Pipeline Funnel</h3>
                <span className={styles.cardBadge}>Live Data</span>
              </div>
              <div className={styles.pipelineFunnel}>
                <PipelineStep label="New" count={stats.pipeline.NEW} color="#3b82f6" />
                <PipelineStep label="Interested" count={stats.pipeline.INTERESTED} color="#6366f1" />
                <PipelineStep label="Callback" count={stats.pipeline.CALLBACK} color="#8b5cf6" />
                <PipelineStep label="Qualified" count={stats.pipeline.QUALIFIED} color="#ec4899" />
                <PipelineStep label="Lost" count={stats.pipeline.NOT_INTERESTED} color="#94a3b8" />
              </div>
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{userRole === 'ADMIN' ? 'Global Activity' : 'Recent Interactions'}</h3>
              <Link href="/dashboard/calls">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className={styles.activityList}>
              {stats.recentInteractions.length > 0 ? stats.recentInteractions.map((call: any) => (
                <ActivityItem 
                  key={call.id}
                  title={`${call.agents?.name || 'AI Agent'} called ${call.leads?.name || 'a lead'}`}
                  time={new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  type="CALL"
                  status={call.status}
                />
              )) : (
                <div className={styles.emptyList}>No recent activity</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Leaderboard/Sidebar */}
        <div className={styles.sideContent}>
          {userRole === 'MANAGER' ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Top Agents</h3>
                <Trophy size={18} className={styles.accentIcon} />
              </div>
              <div className={styles.leaderboard}>
                {stats.topAgents.length > 0 ? stats.topAgents.map((agent: any, idx: number) => (
                  <LeaderboardItem key={idx} name={agent.name} score={`${agent.count} calls`} rank={idx + 1} />
                )) : (
                  <div className={styles.emptyList}>No agents active yet</div>
                )}
              </div>
              <Link href="/dashboard/team" className={styles.cardLink}>Manage Team →</Link>
            </div>
          ) : userRole === 'ADMIN' ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Top Performing Orgs</h3>
              </div>
              <div className={styles.leaderboard}>
                <LeaderboardItem name="Acme Corp" score="1.2k calls" rank={1} />
                <LeaderboardItem name="Globex" score="850 calls" rank={2} />
                <LeaderboardItem name="Soylent Corp" score="620 calls" rank={3} />
              </div>
              <Link href="/dashboard/admin/organizations" className={styles.cardLink}>All Organizations →</Link>
            </div>
          ) : (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>My Daily Goals</h3>
              </div>
              <div className={styles.goals}>
                <GoalItem label="Calls Made" current={45} target={100} />
                <GoalItem label="Handoffs" current={8} target={12} />
                <GoalItem label="Success Rate" current={78} target={85} />
              </div>
            </div>
          )}

          <div className={clsx(styles.card, styles.promoCard)}>
            <h3>AI Tip of the Day</h3>
            <p>Using a "supportive" persona for document follow-ups increases conversion by 18%.</p>
            <Button variant="outline" size="sm">Learn More</Button>
          </div>
        </div>
      </div>

      {/* Organization Side Management Flow */}
      {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
        <OrganizationFlow />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: any) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <div className={clsx(styles.iconWrapper, styles[color])}>
          {icon}
        </div>
        <span className={styles.trend}>
          {trend} <ArrowUpRight size={14} />
        </span>
      </div>
      <div className={styles.statInfo}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}

function PipelineStep({ label, count, color }: any) {
  return (
    <div className={styles.pipelineStep}>
      <div className={styles.stepBar} style={{ backgroundColor: color, height: `${Math.max(10, count * 10)}%` }} />
      <span className={styles.stepCount}>{count}</span>
      <span className={styles.stepLabel}>{label}</span>
    </div>
  );
}

function ActivityItem({ title, time, type }: any) {
  return (
    <div className={styles.activityItem}>
      <div className={clsx(styles.activityIcon, styles[type.toLowerCase()])}>
        {type === 'CALL' ? <PhoneCall size={14} /> : <Users size={14} />}
      </div>
      <div className={styles.activityContent}>
        <p>{title}</p>
        <span>{time}</span>
      </div>
    </div>
  );
}

function LeaderboardItem({ name, score, rank }: any) {
  return (
    <div className={styles.leaderboardItem}>
      <div className={styles.rank}>{rank}</div>
      <div className={styles.agentName}>{name}</div>
      <div className={styles.agentScore}>{score}</div>
    </div>
  );
}

function GoalItem({ label, current, target }: any) {
  const percent = Math.min(100, (current / target) * 100);
  return (
    <div className={styles.goalItem}>
      <div className={styles.goalHeader}>
        <span>{label}</span>
        <span>{current}/{target}</span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
