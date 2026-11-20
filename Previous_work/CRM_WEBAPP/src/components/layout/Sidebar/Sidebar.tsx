"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Megaphone, 
  Settings, 
  BarChart3,
  Bot,
  Zap,
  PhoneForwarded,
  Bell,
  ShieldCheck,
  CreditCard,
  Puzzle,
  LogOut,
  UserRound,
  Layers,
  BrainCircuit,
  Shield,
  Building2
} from 'lucide-react';
import { UserRole } from "@/lib/types";
import styles from './Sidebar.module.css';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', roles: ['ADMIN', 'MANAGER', 'AGENT'] },
  { icon: Users, label: 'Team Hub', href: '/dashboard/team', roles: ['MANAGER'] },
  { icon: Bot, label: 'AI Agents', href: '/dashboard/agents', roles: ['MANAGER'] },
  { icon: Users, label: 'Leads & CRM', href: '/dashboard/leads', roles: ['MANAGER', 'AGENT'] },
  { icon: Megaphone, label: 'Campaigns', href: '/dashboard/campaigns', roles: ['MANAGER', 'AGENT'] },
  { icon: PhoneCall, label: 'Live Calls', href: '/dashboard/calls', roles: ['MANAGER', 'AGENT'] },
  { icon: UserRound, label: 'Human Handoff', href: '/dashboard/handoff', roles: ['MANAGER', 'AGENT'] },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics', roles: ['MANAGER'] },
  { icon: Layers, label: 'Automation', href: '/dashboard/automation', roles: ['MANAGER'] },
  { icon: Puzzle, label: 'Integrations', href: '/dashboard/integrations', roles: ['MANAGER'] },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications', roles: ['MANAGER', 'AGENT'] },
];

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Platform Hub', href: '/dashboard/admin', roles: ['ADMIN'] },
  { icon: ShieldCheck, label: 'Organizations', href: '/dashboard/admin/organizations', roles: ['ADMIN'] },
  { icon: Users, label: 'Global Users', href: '/dashboard/admin/users', roles: ['ADMIN'] },
  { icon: CreditCard, label: 'Billing & Plans', href: '/dashboard/admin/billing', roles: ['ADMIN'] },
  { icon: Zap, label: 'Live Monitoring', href: '/dashboard/admin/monitoring', roles: ['ADMIN'] },
  { icon: BarChart3, label: 'Platform Analytics', href: '/dashboard/admin/analytics', roles: ['ADMIN'] },
  { icon: Settings, label: 'System Config', href: '/dashboard/admin/config', roles: ['ADMIN'] },
  { icon: Bot, label: 'AI Model Lab', href: '/dashboard/admin/ai', roles: ['ADMIN'] },
  { icon: ShieldCheck, label: 'Compliance', href: '/dashboard/admin/compliance', roles: ['ADMIN'] },
  { icon: Bell, label: 'Support Hub', href: '/dashboard/admin/support', roles: ['ADMIN'] },
];


export const Sidebar = ({ initialRole, initialEmail }: { initialRole: UserRole, initialEmail?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [role] = React.useState<UserRole>(initialRole);
  const [email] = React.useState(initialEmail || '');
  const [mode, setMode] = React.useState<'PLATFORM' | 'ORGANIZATION'>(
    pathname.startsWith('/dashboard/admin') ? 'PLATFORM' : 'ORGANIZATION'
  );

  // Sync mode with URL changes
  React.useEffect(() => {
    if (pathname.startsWith('/dashboard/admin') && mode !== 'PLATFORM') {
      setMode('PLATFORM');
    } else if (!pathname.startsWith('/dashboard/admin') && mode !== 'ORGANIZATION') {
      setMode('ORGANIZATION');
    }
  }, [pathname, mode]);

  const handleLogout = async () => {
    toast.success("Logging out...");
    const { logoutAction } = await import("@/app/actions/org");
    await logoutAction();
    window.location.href = '/auth/login';
  };

  const handleModeSwitch = (newMode: 'PLATFORM' | 'ORGANIZATION') => {
    setMode(newMode);
    if (newMode === 'PLATFORM') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const filteredItems = menuItems.filter(item => item.roles.includes(role));
  const filteredAdminItems = adminMenuItems.filter(item => item.roles.includes(role));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Bot size={28} className={styles.logoIcon} />
          <span className={styles.logoText}>AI<span className={styles.highlight}>CRM</span></span>
        </div>

        {(role === 'ADMIN') && (
          <div className={styles.modeSwitcher}>
            <button 
              className={clsx(styles.modeButton, mode === 'ORGANIZATION' && styles.activeMode)}
              onClick={() => handleModeSwitch('ORGANIZATION')}
            >
              <Building2 size={14} />
              Organization
            </button>
            <button 
              className={clsx(styles.modeButton, mode === 'PLATFORM' && styles.activeMode)}
              onClick={() => handleModeSwitch('PLATFORM')}
            >
              <Shield size={14} />
              Platform
            </button>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {mode === 'ORGANIZATION' ? (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Main Menu</p>
            {filteredItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className={clsx(styles.menuItem, isActive && styles.active)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  {isActive && <div className={styles.activeIndicator} />}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Admin Panel</p>
            {filteredAdminItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className={clsx(styles.menuItem, isActive && styles.active)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  {isActive && <div className={styles.activeIndicator} />}
                </Link>
              );
            })}
          </div>
        )}

        <div className={styles.section}>
          <p className={styles.sectionTitle}>System</p>
          {mode === 'ORGANIZATION' && (
            <Link href="/dashboard/billing" className={clsx(styles.menuItem, pathname === '/dashboard/billing' && styles.active)}>
              <CreditCard size={20} />
              <span>Billing</span>
            </Link>
          )}
          <Link href="/dashboard/settings" className={clsx(styles.menuItem, pathname === '/dashboard/settings' && styles.active)}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>


      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>{email[0]?.toUpperCase() || 'U'}</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{email.split('@')[0]}</p>
            <p className={styles.userRole}>{role} View</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
