"use client";

import { Button } from "@/components/ui/Button/Button";
import { ArrowRight, Bot, Zap, Shield, BarChart3, Check } from "lucide-react";
import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getPublicStats } from "@/app/actions/org";

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "Perfect for small teams getting started.",
    features: ["500 AI call minutes/mo", "1 AI Agent", "Lead management", "Email support"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$149",
    period: "/mo",
    description: "For growing sales teams that need power.",
    features: ["5,000 AI call minutes/mo", "5 AI Agents", "Campaign automation", "Analytics & reports", "Human handoff", "Priority support"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Full control for large-scale operations.",
    features: ["Unlimited call minutes", "Unlimited agents", "Custom voice models", "Dedicated infrastructure", "SSO & SOC2", "24/7 support"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const [publicStats, setPublicStats] = useState({ totalCalls: 0, conversionRate: 0, impact: 0 });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkSession();

    getPublicStats().then(res => {
      if (res.success) setPublicStats(res.stats);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const buildDest = user ? "/dashboard/agents" : "/auth/login";

  return (
    <div className={styles.container}>
      {/* Background Glows */}
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Bot size={32} className={styles.logoIcon} />
          <span className={styles.logoText}>AI<span className={styles.highlight}>CRM</span></span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          {!user ? (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="primary">Get Started</Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard">
              <Button variant="primary">Dashboard</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <main className={styles.hero}>
        <div className={styles.badge}>Next-Gen AI Calling Platform</div>
        <h1 className={styles.title}>
          Turn Conversations into <br />
          <span className={styles.gradientText}>Qualified Pipeline</span>
        </h1>
        <p className={styles.subtitle}>
          Automate your sales and support with ultra-low latency AI agents.
          Real-time transcripts, automated CRM updates, and human-like voice interactions.
        </p>

        <div className={styles.ctaGroup}>
          <Link href={buildDest}>
            <Button size="lg" rightIcon={<ArrowRight size={20} />}>
              Build Your Agent
            </Button>
          </Link>

        </div>

        <div className={styles.dashboardPreview}>
          <div className={styles.glassCard}>
            <div className={styles.previewHeader}>
              <div className={styles.previewDot} />
              <div className={styles.previewTitle}>Live Campaign Dashboard</div>
            </div>
            <div className={styles.previewContent}>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Calls</span>
                  <span className={styles.statValue}>{publicStats.totalCalls.toLocaleString()}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Conversion</span>
                  <span className={styles.statValue}>{publicStats.conversionRate}%</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Success Impact</span>
                  <span className={styles.statValue}>{publicStats.impact.toLocaleString()}+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FEATURES ── */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to scale</h2>
          <p className={styles.sectionSubtitle}>Built for revenue teams that demand results.</p>
        </div>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <Zap className={styles.featureIcon} />
            <h3>Sub-Second Latency</h3>
            <p>Our AI agents respond in under 800ms, making conversations feel natural and human.</p>
          </div>
          <div className={styles.featureCard}>
            <Shield className={styles.featureIcon} />
            <h3>SOC2 Compliant</h3>
            <p>Enterprise-grade security and data privacy for your sensitive lead information.</p>
          </div>
          <div className={styles.featureCard}>
            <BarChart3 className={styles.featureIcon} />
            <h3>Deep Insights</h3>
            <p>Extract budget, sentiment, and objections automatically from every call.</p>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p className={styles.sectionSubtitle}>Start for free. Scale as you grow.</p>
        </div>
        <div className={styles.pricingGrid}>
          {pricingPlans.map((plan) => (
            <div key={plan.name} className={plan.highlight ? `${styles.pricingCard} ${styles.pricingHighlight}` : styles.pricingCard}>
              {plan.highlight && <div className={styles.popularBadge}>Most Popular</div>}
              <div className={styles.planName}>{plan.name}</div>
              <div className={styles.planPrice}>
                <span className={styles.planAmount}>{plan.price}</span>
                <span className={styles.planPeriod}>{plan.period}</span>
              </div>
              <p className={styles.planDesc}>{plan.description}</p>
              <ul className={styles.featureList}>
                {plan.features.map((f) => (
                  <li key={f} className={styles.featureItem}>
                    <Check size={16} className={styles.checkIcon} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={buildDest}>
                <Button fullWidth variant={plan.highlight ? "primary" : "outline"}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.logo}>
          <Bot size={24} className={styles.logoIcon} />
          <span className={styles.logoText}>AI<span className={styles.highlight}>CRM</span></span>
        </div>
        <p className={styles.footerText}>© 2026 AI CRM. All rights reserved.</p>
      </footer>
    </div>
  );
}
