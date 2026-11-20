"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { Plus, ShieldCheck, Search, MoreHorizontal, ExternalLink, Copy, Building2 } from "lucide-react";
import styles from "../admin.module.css";
import { Modal } from "@/components/ui/Modal/Modal";
import { Input } from "@/components/ui/Input/Input";
import { createOrganization, getAllOrganizations } from "@/app/actions/org";
import { toast } from "react-hot-toast";

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingOrg, setEditingOrg] = useState<any>(null);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    const result = await getAllOrganizations();
    if (result.success) {
      setOrganizations(result.organizations || []);
    } else {
      toast.error(result.error || "Failed to fetch organizations");
    }
  };

  const handleAddOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let result;
    if (editingOrg) {
      const { updateOrganization } = await import("@/app/actions/org");
      result = await updateOrganization(editingOrg.id, formData.name);
    } else {
      result = await createOrganization(formData.name, formData.email);
    }
    
    setIsSubmitting(false);
    if (result.success) {
      toast.success(editingOrg ? "Organization updated!" : "Organization created!");
      setIsModalOpen(false);
      setEditingOrg(null);
      setFormData({ name: "", email: "" });
      fetchOrgs();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this organization? This will remove all associated data.")) return;
    const { deleteOrganization } = await import("@/app/actions/org");
    const result = await deleteOrganization(id);
    if (result.success) {
      toast.success("Organization deleted");
      fetchOrgs();
    } else {
      toast.error(result.error);
    }
  };

  const openEdit = (org: any) => {
    setEditingOrg(org);
    setFormData({ name: org.name, email: "" });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
  };

  const generateInviteLink = (code: string) => {
    const link = `${window.location.origin}/auth/join?code=${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => setActiveMenu(null)}>
        <div className={styles.titleGroup}>
          <Building2 size={32} className={styles.adminIcon} />
          <div>
            <h1 className={styles.title}>Organization Management</h1>
            <p className={styles.subtitle}>Super Admin: Create and manage all organizations in the system.</p>
          </div>
        </div>
        <Button 
          leftIcon={<Plus size={18} />}
          onClick={() => {
            setEditingOrg(null);
            setFormData({ name: "", email: "" });
            setIsModalOpen(true);
          }}
        >
          Add Organization
        </Button>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.managementSection} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.searchBox}>
                <Search size={18} />
                <input type="text" placeholder="Search organizations..." />
              </div>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Invite Code</th>
                <th>Users</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.length > 0 ? organizations.map((org) => (
                <tr key={org.id}>
                  <td>
                    <div className={styles.userInfoCell}>
                      <div className={styles.avatarSmall}>{org.name[0]}</div>
                      <span className={styles.userName}>{org.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.orgCell}>
                      <code className={styles.codeBadge}>{org.invite_code}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyInviteCode(org.invite_code)}>
                        <Copy size={14} />
                      </Button>
                    </div>
                  </td>
                  <td>0</td>
                  <td>{new Date(org.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionsCell} style={{ justifyContent: 'flex-end', position: 'relative' }}>
                      <Button variant="ghost" size="sm" onClick={() => generateInviteLink(org.invite_code)}>
                        <ExternalLink size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === org.id ? null : org.id);
                        }}
                      >
                        <MoreHorizontal size={14} />
                      </Button>

                      {activeMenu === org.id && (
                        <div className={styles.dropdownMenu}>
                          <button onClick={() => openEdit(org)}>Edit Name</button>
                          <button onClick={() => handleDelete(org.id)} className={styles.deleteBtn}>Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No organizations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingOrg ? "Edit Organization" : "Add New Organization"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button isLoading={isSubmitting} onClick={handleAddOrg}>
              {editingOrg ? "Update Name" : "Create Organization"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddOrg} className={styles.modalForm}>
          <Input 
            label="Organization Name" 
            placeholder="e.g. Acme Corp" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          {!editingOrg && (
            <Input 
              label="Owner Email Address" 
              placeholder="manager@company.com" 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          )}
          <p className={styles.hint}>
            {editingOrg ? "Updating the name will reflect across all user dashboards." : "A unique invite code will be generated automatically."}
          </p>
        </form>
      </Modal>
    </div>
  );
}
