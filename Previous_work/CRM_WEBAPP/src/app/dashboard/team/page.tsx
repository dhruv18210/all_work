"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck
} from "lucide-react";
import styles from "./team.module.css";
import { clsx } from 'clsx';
import { Eye, Edit2, Trash2 } from "lucide-react";

const mockTeam = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@acme.com', role: 'MANAGER', status: 'ACTIVE', joined: '2 months ago' },
  { id: 'u2', name: 'Sarah Smith', email: 'sarah@acme.com', role: 'AGENT', status: 'ACTIVE', joined: '1 month ago' },
  { id: 'u3', name: 'Michael Brown', email: 'mike@acme.com', role: 'AGENT', status: 'PENDING', joined: '2 days ago' },
  { id: 'u4', name: 'Emily Davis', email: 'emily@acme.com', role: 'AGENT', status: 'ACTIVE', joined: '3 weeks ago' },
];

import { getScopedQuery } from "@/lib/auth-utils";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link as LinkIcon, Copy } from "lucide-react";

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [team, setTeam] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    // Get team members via server action
    const { getTeam, getInviteCode } = await import("@/app/actions/org");
    
    const teamResult = await getTeam();
    if (teamResult.success) {
      setTeam(teamResult.team);
    }

    // Get org invite code via server action
    const inviteResult = await getInviteCode();
    if (inviteResult.success && inviteResult.inviteCode) {
      setInviteCode(inviteResult.inviteCode);
    }
  };

  const copyInviteLink = (roleType: 'MANAGER' | 'AGENT' = 'AGENT') => {
    const link = `${window.location.origin}/auth/join?code=${inviteCode}&role=${roleType}`;
    navigator.clipboard.writeText(link);
    toast.success(`${roleType} invite link copied!`);
  };

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    const { removeMember } = await import("@/app/actions/org");
    const result = await removeMember(id);
    if (result.success) {
      toast.success("Member removed");
      fetchTeam();
    } else {
      toast.error(result.error);
    }
    setActiveMenu(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Team Management</h1>
          <p className={styles.subtitle}>Manage your organization's members, roles, and access permissions.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" leftIcon={<LinkIcon size={18} />} onClick={() => copyInviteLink('MANAGER')}>
            Invite Manager
          </Button>
          <Button variant="primary" leftIcon={<UserPlus size={18} />} onClick={() => copyInviteLink('AGENT')}>
            Invite Agent
          </Button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.miniStat}>
          <Users size={20} className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Members</span>
            <span className={styles.statValue}>{team.length}</span>
          </div>
        </div>
        <div className={styles.miniStat}>
          <Shield size={20} className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Managers</span>
            <span className={styles.statValue}>{team.filter(m => m.role === 'MANAGER').length}</span>
          </div>
        </div>
        <div className={styles.miniStat}>
          <Clock size={20} className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Agents</span>
            <span className={styles.statValue}>{team.filter(m => m.role === 'AGENT').length}</span>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {team.length > 0 ? team
              .filter(m => m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((member) => (
              <tr key={member.id}>
                <td>
                  <div className={styles.memberInfo}>
                    <div className={styles.avatar}>{member.name ? member.name[0] : member.email[0]}</div>
                    <div className={styles.nameMeta}>
                      <span className={styles.memberName}>{member.name || 'Anonymous'}</span>
                      <span className={styles.memberEmail}>{member.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={clsx(styles.roleBadge, member.role === 'MANAGER' ? styles.roleManager : styles.roleAgent)}>
                    <Shield size={12} />
                    {member.role}
                  </div>
                </td>
                <td>
                  <div className={clsx(styles.statusBadge, styles.statusActive)}>
                    <UserCheck size={12} />
                    ACTIVE
                  </div>
                </td>
                <td className={styles.joinedDate}>{new Date(member.created_at).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actionContainer}>
                    <button 
                      className={styles.moreBtn} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === member.id ? null : member.id);
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === member.id && (
                      <div className={styles.dropdown}>
                        <button className={styles.dropdownItem} onClick={() => toast("View feature coming soon!")}>
                          <Eye size={14} /> View
                        </button>
                        <button className={styles.dropdownItem} onClick={() => toast("Edit feature coming soon!")}>
                          <Edit2 size={14} /> Edit
                        </button>
                        <div className={styles.dropdownDivider} />
                        <button className={clsx(styles.dropdownItem, styles.deleteBtn)} onClick={() => handleDeleteMember(member.id)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
