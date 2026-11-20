"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { Plus, Download, Filter, Search, MoreHorizontal, User, Phone, Mail } from "lucide-react";
import styles from "./leads.module.css";
import { Modal } from "@/components/ui/Modal/Modal";
import { Input } from "@/components/ui/Input/Input";
import { addLead, getLeads, importLeads, deleteLead, updateLead } from "@/app/actions/leads";
import { toast } from "react-hot-toast";
import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import Papa from "papaparse";

const statusColors: Record<string, string> = {
  NEW: styles.statusNew,
  INTERESTED: styles.statusInterested,
  CALLBACK: styles.statusCallback,
  QUALIFIED: styles.statusQualified,
  NOT_INTERESTED: styles.statusNotInterested,
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleCSV = () => {
    const csvContent = "name,phone,email\nJohn Doe,+1234567890,john@example.com\nJane Smith,+1987654321,jane@example.com";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_leads.csv';
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const leads = results.data as any[];
        const validLeads = leads.filter(l => l.name && l.phone);
        
        if (validLeads.length === 0) {
          toast.error("No valid leads found in CSV");
          return;
        }

        const res = await importLeads(validLeads);
        if (res.success) {
          toast.success(`Successfully imported ${res.count} leads!`);
          fetchLeads();
        } else {
          toast.error(`Import failed: ${res.error}`);
        }

        // Reset input so the same file can be selected again
        if (e.target) {
          e.target.value = '';
        }
      }
    });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const result = await getLeads();
    if (result.success) {
      setLeads(result.leads || []);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await addLead(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Lead added successfully!");
      setIsModalOpen(false);
      setFormData({ name: "", phone: "", email: "" });
      fetchLeads();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmitting(true);
    const result = await updateLead(selectedLead.id, formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Lead updated successfully!");
      setIsEditModalOpen(false);
      fetchLeads();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const result = await deleteLead(id);
    if (result.success) {
      toast.success("Lead deleted");
      fetchLeads();
    } else {
      toast.error(result.error);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         lead.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Leads Management</h1>
          <p className={styles.subtitle}>Manage, track and nurture your potential customers.</p>
        </div>
        <div className={styles.actions}>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".csv"
            onChange={handleFileUpload}
          />
          <Button variant="outline" leftIcon={<Download size={18} />} onClick={downloadSampleCSV}>Sample CSV</Button>
          <Button variant="outline" leftIcon={<Plus size={18} />} onClick={() => fileInputRef.current?.click()}>Bulk Import</Button>
          <Button 
            leftIcon={<Plus size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Lead
          </Button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Leads</span>
          <span className={styles.statValue}>{leads.length.toLocaleString()}</span>
          <span className={styles.statTrend}>Live from database</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Qualified</span>
          <span className={styles.statValue}>{leads.filter(l => l.status === 'QUALIFIED').length.toLocaleString()}</span>
          <span className={styles.statTrend}>
            {leads.length > 0 
              ? ((leads.filter(l => l.status === 'QUALIFIED').length / leads.length) * 100).toFixed(1) 
              : 0}% conversion
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Calls</span>
          <span className={styles.statValue}>{leads.filter(l => ['NEW', 'CALLBACK', 'INTERESTED'].includes(l.status)).length.toLocaleString()}</span>
          <span className={styles.statTrend}>Requires action</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableSearch}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Filter by name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.tableFilters}>
            <select 
              className={styles.statusSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ background: 'var(--card-bg)', color: 'white', border: '1px solid var(--card-border)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="INTERESTED">Interested</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CALLBACK">Callback</option>
              <option value="NOT_INTERESTED">Not Interested</option>
            </select>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Interest Score</th>
              <th>Last Interaction</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div className={styles.leadInfo}>
                    <div className={styles.avatar}>{lead.name[0]}</div>
                    <span>{lead.name}</span>
                  </div>
                </td>
                <td>{lead.phone}</td>
                <td>
                  <span className={clsx(styles.statusBadge, statusColors[lead.status] || styles.statusNew)}>
                    {lead.status}
                  </span>
                </td>
                <td>
                  <div className={styles.scoreBar}>
                    <div 
                      className={styles.scoreProgress} 
                      style={{ width: `${(lead.interest_score || lead.interest || 0) * 10}%` }} 
                    />
                  </div>
                </td>
                <td>{lead.last_interaction || lead.lastCall || "Never"}</td>
                <td style={{ position: 'relative' }}>
                  <button 
                    className={styles.moreButton}
                    onClick={() => setMenuOpenId(menuOpenId === lead.id ? null : lead.id)}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {menuOpenId === lead.id && (
                    <div className={styles.actionMenu}>
                      <button 
                        className={styles.actionItem}
                        onClick={() => {
                          setSelectedLead(lead);
                          setFormData({ name: lead.name, phone: lead.phone, email: lead.email || "" });
                          setIsEditModalOpen(true);
                          setMenuOpenId(null);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className={clsx(styles.actionItem, styles.deleteAction)}
                        onClick={() => handleDeleteLead(lead.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  No leads found. Click "Add Lead" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Lead Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Lead"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button isLoading={isSubmitting} onClick={handleAddLead}>Save Lead</Button>
          </>
        }
      >
        <form onSubmit={handleAddLead} className={styles.modalForm}>
          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            required
            leftIcon={<User size={18} />}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Phone Number" 
            placeholder="+1 (555) 000-0000" 
            required
            leftIcon={<Phone size={18} />}
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <Input 
            label="Email Address" 
            placeholder="john@example.com" 
            type="email"
            leftIcon={<Mail size={18} />}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </form>
      </Modal>
      
      {/* Edit Lead Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Lead"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button isLoading={isSubmitting} onClick={handleUpdateLead}>Update Lead</Button>
          </>
        }
      >
        <form onSubmit={handleUpdateLead} className={styles.modalForm}>
          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            required
            leftIcon={<User size={18} />}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Phone Number" 
            placeholder="+1 (555) 000-0000" 
            required
            leftIcon={<Phone size={18} />}
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <Input 
            label="Email Address" 
            placeholder="john@example.com" 
            type="email"
            leftIcon={<Mail size={18} />}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </form>
      </Modal>
    </div>
  );
}


