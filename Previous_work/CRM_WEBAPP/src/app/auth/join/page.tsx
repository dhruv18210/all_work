"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/Button/Button";
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Bot,
  Users
} from "lucide-react";
import styles from "./join.module.css";
import { clsx } from "clsx";
import { joinOrganization, logoutAction } from "@/app/actions/org";

export default function JoinOrganizationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinOrganizationContent />
    </Suspense>
  );
}

function JoinOrganizationContent() {
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const roleParam = searchParams.get('role');
    const emailParam = searchParams.get('email');
    if (code) {
      setInviteCode(code);
    }
    if (roleParam) {
      setRole(roleParam);
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('LOADING');
    setError('');
    
    // Pass the role detected from URL if it exists
    const result = await joinOrganization(inviteCode, email, undefined, role);
    
    if (result.success) {
      setStatus('SUCCESS');
      setOrgName(result.org?.name || 'Organization');
      setRole(result.role || '');
    } else {
      setStatus('ERROR');
      setError(result.error || 'Failed to join');
    }
  };

  if (status === 'SUCCESS') {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={48} />
          </div>
          <h1>Welcome to {orgName}!</h1>
          <p>You have successfully joined the organization as a <strong>{role}</strong>. Your dashboard is ready.</p>
          <Button 
            size="lg" 
            fullWidth 
            rightIcon={<ArrowRight size={20} />}
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to {role === 'MANAGER' ? 'Manager View' : 'Agent View'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Bot size={32} className={styles.logoIcon} />
            <span className={styles.logoText}>AI<span className={styles.highlight}>CRM</span></span>
          </div>
          <h1>Join Organization</h1>
          <p>Enter your email and the 8-character invite code.</p>
        </div>

        <form className={styles.form} onSubmit={handleJoin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Users size={20} className={styles.fieldIcon} />
              <input 
                id="email"
                type="email" 
                placeholder="you@company.com" 
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="inviteCode">Invite Code</label>
            <div className={styles.inputWrapper}>
              <ShieldCheck size={20} className={styles.fieldIcon} />
              <input 
                id="inviteCode"
                type="text" 
                placeholder="KOL-XXXX-XXXX" 
                className={clsx(styles.input, status === 'ERROR' && styles.inputError)}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={12}
                required
              />
            </div>
            {status === 'ERROR' && (
              <span className={styles.errorMessage}>
                <AlertCircle size={14} /> {error}
              </span>
            )}
          </div>

          <Button 
            type="submit" 
            size="lg" 
            fullWidth 
            isLoading={status === 'LOADING'}
            disabled={inviteCode.length < 8 || !email}
          >
            Join Organization
          </Button>
        </form>

        <div className={styles.footer}>
          <p>Don't have a code? Contact your manager or <a href="#">Create a new company</a>.</p>
          <button 
            className={styles.logoutBtn} 
            onClick={async () => {
              await logoutAction();
              window.location.href = '/auth/login';
            }}
          >
            Logout and switch account
          </button>
        </div>
      </div>
    </div>
  );
}
