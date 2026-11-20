"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  CreditCard, 
  TrendingUp, 
  Plus, 
  DollarSign, 
  Clock, 
  ArrowUpRight,
  Package,
  Activity,
  Loader2
} from "lucide-react";
import styles from "../admin.module.css";
import { clsx } from 'clsx';
import { getBillingData } from '@/app/actions/org';
import { toast } from 'react-hot-toast';

export default function PlatformBilling() {
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const result = await getBillingData();
    if (result.success) {
      setPlans(result.plans);
      setStats(result.stats);
      setUsage(result.detailedUsage);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Calculating platform revenue and usage...</p>
      </div>
    );
  }

  // Fallback plans if none in DB yet
  const displayPlans = plans.length > 0 ? plans : [
    { name: 'Starter', price: '$49', calls_limit: '500', organizations: 124 },
    { name: 'Professional', price: '$199', calls_limit: '2,500', organizations: 412 },
    { name: 'Enterprise', price: 'Custom', calls_limit: 'Unlimited', organizations: 42 },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <CreditCard size={32} className={styles.adminIcon} />
          <div>
            <h1 className={styles.title}>Billing & Subscription Flow</h1>
            <p className={styles.subtitle}>Manage plans, monitor usage, and analyze revenue trends across the platform.</p>
          </div>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => toast("Feature coming soon: Plan Builder")}>Create New Plan</Button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <TrendingUp size={24} className={styles.successText} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>MRR (Monthly Recurring)</span>
            <span className={styles.statValue}>{stats?.mrr || '$0'}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Activity size={24} className={styles.primaryText} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Minutes (MTD)</span>
            <span className={styles.statValue}>{stats?.totalMinutes?.toLocaleString() || '0'}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <DollarSign size={24} className={styles.warningText} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pending Invoices</span>
            <span className={styles.statValue}>{stats?.pendingInvoices || '$0'}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Package size={24} className={styles.infoText} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Subscriptions</span>
            <span className={styles.statValue}>{stats?.activeSubscriptions || '0'}</span>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.managementSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerLeft}>
              <Package size={20} />
              <h3>Subscription Plans</h3>
            </div>
          </div>
          <div className={styles.plansGrid}>
            {displayPlans.map((plan: any, i) => (
              <div key={plan.id || i} className={styles.planCard}>
                <div className={styles.planHeader}>
                  <span className={styles.planName}>{plan.name}</span>
                  <span className={styles.planPrice}>{plan.price}<small>/mo</small></span>
                </div>
                <div className={styles.planStats}>
                  <div className={styles.planStat}>
                    <span>Limit: {plan.calls_limit} calls</span>
                  </div>
                  <div className={styles.planStat}>
                    <span>Active Orgs: {plan.organizations || 0}</span>
                  </div>
                </div>
                <Button variant="outline" fullWidth onClick={() => toast(`Editing ${plan.name}`)}>Edit Plan</Button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.healthSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerLeft}>
              <Activity size={20} />
              <h3>Minute Tracking</h3>
            </div>
          </div>
          <div className={styles.usageList}>
            {usage.length > 0 ? usage.map((item, i) => (
              <div key={i} className={styles.usageItem}>
                <div className={styles.usageInfo}>
                  <span className={styles.orgName}>{item.org}</span>
                  <span className={styles.minutes}>{item.minutes.toLocaleString()} mins</span>
                </div>
                <span className={styles.cost}>{item.cost}</span>
              </div>
            )) : (
              <p className={styles.noData}>No usage data found for this month.</p>
            )}
          </div>
          <Button variant="ghost" fullWidth rightIcon={<ArrowUpRight size={14} />}>View Detailed Usage</Button>
        </div>
      </div>
    </div>
  );
}
