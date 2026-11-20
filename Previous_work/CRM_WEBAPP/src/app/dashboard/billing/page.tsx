"use client";

import React from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  CreditCard, 
  Check, 
  Zap, 
  Clock, 
  Phone, 
  Download, 
  ArrowUpRight,
  ShieldCheck,
  History
} from "lucide-react";
import styles from "./billing.module.css";
import { clsx } from 'clsx';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    description: 'Perfect for small teams and startups.',
    features: ['500 Minutes included', '3 AI Agents', 'Basic Analytics', 'Community Support'],
    isPopular: false,
  },
  {
    name: 'Professional',
    price: '$199',
    description: 'The standard for growing sales teams.',
    features: ['2,500 Minutes included', 'Unlimited AI Agents', 'Advanced Analytics', 'CRM Integrations', 'Priority Support'],
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Scale without limits and dedicated help.',
    features: ['Unlimited Minutes', 'Custom Voice Models', 'SLA Guarantees', 'Dedicated Manager', 'API Access'],
    isPopular: false,
  },
];

const invoices = [
  { id: 'INV-001', date: 'May 1, 2026', amount: '$199.00', status: 'PAID' },
  { id: 'INV-002', date: 'April 1, 2026', amount: '$199.00', status: 'PAID' },
  { id: 'INV-003', date: 'March 1, 2026', amount: '$49.00', status: 'PAID' },
];

export default function BillingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Billing & Usage</h1>
          <p className={styles.subtitle}>Manage your subscription, minutes usage, and payment methods.</p>
        </div>
      </div>

      {/* Usage Overview */}
      <div className={styles.usageSection}>
        <div className={styles.usageCard}>
          <div className={styles.usageHeader}>
            <div className={styles.usageInfo}>
              <Clock size={20} className={styles.icon} />
              <span>Minutes Used (This Month)</span>
            </div>
            <span className={styles.usageValue}>1,842 / 2,500</span>
          </div>
          <div className={styles.usageBar}>
            <div className={styles.usageFill} style={{ width: '73.6%' }} />
          </div>
          <p className={styles.usageHint}>You have <strong>658 minutes</strong> remaining. Resets in 12 days.</p>
        </div>

        <div className={styles.usageCard}>
          <div className={styles.usageHeader}>
            <div className={styles.usageInfo}>
              <Phone size={20} className={styles.icon} />
              <span>Total Calls</span>
            </div>
            <span className={styles.usageValue}>4,284</span>
          </div>
          <div className={styles.usageStats}>
            <div className={styles.miniStat}>
              <span>Average Cost/Call</span>
              <strong>$0.12</strong>
            </div>
            <div className={styles.miniStat}>
              <span>Est. Bill</span>
              <strong>$199.00</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className={styles.plansSection}>
        <h2 className={styles.sectionTitle}>Subscription Plans</h2>
        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <div key={plan.name} className={clsx(styles.planCard, plan.isPopular && styles.popularCard)}>
              {plan.isPopular && <div className={styles.popularBadge}>Most Popular</div>}
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.priceContainer}>
                  <span className={styles.price}>{plan.price}</span>
                  {plan.price !== 'Custom' && <span className={styles.period}>/month</span>}
                </div>
                <p className={styles.planDesc}>{plan.description}</p>
              </div>
              <ul className={styles.featuresList}>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant={plan.isPopular ? 'primary' : 'outline'} 
                fullWidth
              >
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade Plan'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottomGrid}>
        {/* Payment Method */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <CreditCard size={20} />
              <h3>Payment Method</h3>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
          <div className={styles.paymentBox}>
            <div className={styles.visaIcon}>VISA</div>
            <div className={styles.cardInfo}>
              <span className={styles.cardNumber}>•••• •••• •••• 4242</span>
              <span className={styles.cardExpiry}>Expires 12/28</span>
            </div>
            <ShieldCheck size={20} className={styles.secureIcon} />
          </div>
        </div>

        {/* Invoice History */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <History size={20} />
              <h3>Invoice History</h3>
            </div>
          </div>
          <div className={styles.invoiceList}>
            {invoices.map((inv) => (
              <div key={inv.id} className={styles.invoiceItem}>
                <div className={styles.invMain}>
                  <span className={styles.invId}>{inv.id}</span>
                  <span className={styles.invDate}>{inv.date}</span>
                </div>
                <div className={styles.invMeta}>
                  <span className={styles.invAmount}>{inv.amount}</span>
                  <button className={styles.downloadBtn}><Download size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
