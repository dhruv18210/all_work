"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { Bot, Mail, Lock, ArrowRight, User } from "lucide-react";
import { Input } from "@/components/ui/Input/Input";
import styles from "./login.module.css";

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { loginAction, signupAction } = await import("@/app/actions/org");
      
      let result;
      if (mode === 'login') {
        result = await loginAction(form.email, form.password);
      } else {
        result = await signupAction(form.email, form.password, form.name);
      }
      
      if (result.success) {
        // Force redirect to admin portal for everyone as requested
        window.location.href = '/dashboard/admin';
      } else {
        // Fallback for Demo
        if (form.email === 'admin@crm.com' || form.email === 'hr@kology.com') {
          window.location.href = '/dashboard/admin';
        } else {
          alert(`${mode === 'login' ? 'Login' : 'Signup'} failed: ${result.error}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <Bot size={28} className={styles.logoIcon} />
          <span className={styles.logoText}>AI<span className={styles.highlight}>CRM</span></span>
        </div>

        {/* Toggle */}
        <div className={styles.toggle}>
          <button
            className={mode === 'login' ? styles.toggleActive : styles.toggleBtn}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
          <button
            className={mode === 'register' ? styles.toggleActive : styles.toggleBtn}
            onClick={() => setMode('register')}
          >
            Sign Up
          </button>
        </div>

        <h1 className={styles.title}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'login'
            ? 'Sign in to access your AI-CRM dashboard.'
            : 'Start automating your sales calls in minutes.'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <Input
              label="Full Name"
              placeholder="John Doe"
              required
              leftIcon={<User size={18} />}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          )}
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            required
            leftIcon={<Mail size={18} />}
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            leftIcon={<Lock size={18} />}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          {mode === 'login' && (
            <a href="#" className={styles.forgotLink}>Forgot password?</a>
          )}

          <Button type="submit" fullWidth size="lg" isLoading={isLoading} rightIcon={<ArrowRight size={18} />}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <p className={styles.footer}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className={styles.switchLink} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>

        <div className={styles.divider}><span>or</span></div>

        <p className={styles.joinLink}>
          Have an invite code?{' '}
          <a href="/auth/join">Join an organization →</a>
        </p>
      </div>
    </div>
  );
}
