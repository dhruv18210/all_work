"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  UserMinus, 
  Key,
  Mail,
  Building
} from "lucide-react";
import styles from "../admin.module.css";
import { clsx } from 'clsx';
import { getAllUsers } from "@/app/actions/org";
import { toast } from "react-hot-toast";

export default function GlobalUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const result = await getAllUsers();
    if (result.success) {
      setUsers(result.users || []);
    } else {
      toast.error(result.error || "Failed to fetch users");
    }
    setIsLoading(false);
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.organizations?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Users size={32} className={styles.adminIcon} />
          <div>
            <h1 className={styles.title}>Global User Management</h1>
            <p className={styles.subtitle}>Manage permissions, monitor activity, and control access across all organizations.</p>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.managementSection} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.searchBox}>
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search by name, email, or org..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="ghost" leftIcon={<Filter size={16} />}>Filters</Button>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Organization</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading global users...</td></tr>
              ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userInfoCell}>
                      <div className={styles.avatarSmall}>{user.email[0].toUpperCase()}</div>
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>{user.email.split('@')[0]}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.orgCell}>
                      <Building size={14} />
                      <span>{user.organizations?.name || 'No Organization'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={clsx(styles.roleBadge, styles[user.role.toLowerCase()])}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={clsx(styles.badge, styles.active)}>
                      ACTIVE
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <Button variant="ghost" size="sm" title="Reset Password"><Key size={14} /></Button>
                      <Button variant="ghost" size="sm" title="Manage Permissions"><Shield size={14} /></Button>
                      <Button variant="ghost" size="sm" title="Suspend Access"><UserMinus size={14} /></Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No users found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
