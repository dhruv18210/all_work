"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Megaphone, 
  Plus, 
  Play, 
  Pause, 
  StopCircle, 
  Users, 
  Bot,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import styles from "./campaigns.module.css";
import { clsx } from 'clsx';
import { initiateOutboundCall } from '@/app/actions/calls';
import { updateCampaignStatus, createCampaign, getCampaigns, syncLeadsToCampaign, updateCampaign, deleteCampaign } from '@/app/actions/campaigns';
import { getAgents } from '@/app/actions/agents';
import { getLeads } from '@/app/actions/leads';
import { toast } from 'react-hot-toast';
import { Modal } from "@/components/ui/Modal/Modal";
import { Input } from "@/components/ui/Input/Input";
import { useEffect } from 'react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeAllLeads, setIncludeAllLeads] = useState(true);
  const [newCampaign, setNewCampaign] = useState({ name: "", agentId: "" });
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
    fetchAgents();
    fetchLeads();

    // Poll for updates every 5 seconds to show live call progress
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCampaigns = async () => {
    const result = await getCampaigns();
    if (result.success) {
      setCampaigns(result.campaigns || []);
    }
  };

  const fetchAgents = async () => {
    const result = await getAgents();
    if (result.success) {
      setAgents(result.agents || []);
    }
  };

  const fetchLeads = async () => {
    const result = await getLeads();
    if (result.success) {
      setLeads(result.leads || []);
    }
  };

  const handleCreate = async () => {
    if (!newCampaign.name || !newCampaign.agentId) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    const leadIds = includeAllLeads ? leads.map(l => l.id) : [];
    const result = await createCampaign({ ...newCampaign, leadIds });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Campaign created!");
      setIsModalOpen(false);
      setNewCampaign({ name: "", agentId: "" });
      fetchCampaigns();
    } else {
      toast.error(result.error);
    }
  };
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isCalling, setIsCalling] = useState(false);

  const handleTestCall = async () => {
    if (agents.length === 0) {
      toast.error("Please create an AI Agent first.");
      return;
    }
    
    setIsCalling(true);
    const toastId = toast.loading('Initiating test call with ' + agents[0].name + '...');
    
    // We'll use the first agent and a generic test lead if none exist
    // In a real app, this would open a modal to select a lead
    const result = await initiateOutboundCall('test-lead-id', agents[0].id);
    
    setIsCalling(false);
    if (result.success) {
      toast.success(`Call initiated! Room: ${result.roomName}`, { id: toastId });
    } else {
      toast.error(`Call failed: ${result.error}`, { id: toastId });
    }
  };

  const handleToggleStatus = async (campaignId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const toastId = toast.loading(`Updating status to ${nextStatus}...`);
    
    const result = await updateCampaignStatus(campaignId, nextStatus as any);
    
    if (result.success) {
      toast.success(`Campaign ${nextStatus.toLowerCase()}!`, { id: toastId });
      fetchCampaigns();
    } else {
      toast.error(`Failed to update status: ${result.error}`, { id: toastId });
    }
  };

  const handleSyncLeads = async (campaignId: string) => {
    const toastId = toast.loading('Syncing all leads to campaign...');
    const result = await syncLeadsToCampaign(campaignId);
    
    if (result.success) {
      toast.success(`Synced ${result.count} leads!`, { id: toastId });
      fetchCampaigns();
    } else {
      toast.error(`Failed to sync: ${result.error}`, { id: toastId });
    }
  };

  const handleEditCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setNewCampaign({ name: campaign.name, agentId: campaign.agent_id });
    setIsEditModalOpen(true);
    setMenuOpenId(null);
  };

  const handleUpdate = async () => {
    if (!selectedCampaign) return;
    setIsSubmitting(true);
    const result = await updateCampaign(selectedCampaign.id, { 
      name: newCampaign.name, 
      agent_id: newCampaign.agentId 
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Campaign updated!");
      setIsEditModalOpen(false);
      fetchCampaigns();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign? This will NOT delete call logs.")) return;
    const result = await deleteCampaign(id);
    if (result.success) {
      toast.success("Campaign deleted");
      fetchCampaigns();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Campaigns</h1>
          <p className={styles.subtitle}>Automate your outreach with bulk AI calling campaigns.</p>
        </div>
        <div className={styles.headerActions}>
          <Button 
            variant="outline" 
            onClick={handleTestCall} 
            isLoading={isCalling}
            leftIcon={<Bot size={18} />}
          >
            Test AI Call
          </Button>
          <Button 
            leftIcon={<Plus size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            New Campaign
          </Button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.tabs}>
          {['ALL', 'ACTIVE', 'PAUSED', 'DRAFT', 'COMPLETED'].map((status) => (
            <button 
              key={status}
              className={clsx(styles.tab, selectedStatus === status && styles.activeTab)}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.campaignGrid}>
        {campaigns.filter(c => selectedStatus === 'ALL' || c.status === selectedStatus).length > 0 ? (
          campaigns
            .filter(c => selectedStatus === 'ALL' || c.status === selectedStatus)
            .map((camp) => (
          <div key={camp.id} className={styles.campaignCard}>
            <div className={styles.cardHeader}>
              <div className={styles.campaignTitle}>
                <div className={clsx(styles.statusIndicator, styles[camp.status.toLowerCase()])} />
                <h3>{camp.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSyncLeads(camp.id)}
                  title="Add all leads to this campaign"
                >
                  Sync Leads
                </Button>
                <div style={{ position: 'relative' }}>
                  <button 
                    className={styles.moreButton}
                    onClick={() => setMenuOpenId(menuOpenId === camp.id ? null : camp.id)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {menuOpenId === camp.id && (
                    <div className={styles.actionMenu} style={{ position: 'absolute', right: 0, top: '100%', zIndex: 10, background: '#1a1b23', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem', minWidth: '120px', boxShadow: 'var(--shadow-lg)' }}>
                      <button 
                        onClick={() => handleEditCampaign(camp)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(camp.id)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.cardBody}>
              {(() => {
                const totalLeads = camp.campaign_leads?.length || camp.leads_count || 0;
                const attemptedCount = camp.calls?.length || 0;
                const contactedCount = camp.calls?.filter((c: any) => (c.duration_sec || 0) > 0 || ['COMPLETED', 'IN_PROGRESS'].includes(c.status)).length || 0;
                const successCount = camp.calls?.filter((c: any) => (c.interest_score || 0) >= 7 || c.outcome === 'Interested').length || 0;
                const activeCalls = camp.calls?.filter((c: any) => ['RINGING', 'IN_PROGRESS'].includes(c.status)).length || 0;
                
                return (
                  <>
                    <div className={styles.metaInfo}>
                      <div className={styles.metaItem}>
                        <Bot size={16} />
                        <span>{camp.agents?.name || 'No Agent'}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Users size={16} />
                        <span>{totalLeads} leads</span>
                      </div>
                    </div>

                    <div className={styles.progressSection}>
                      <div className={styles.progressHeader}>
                        <span>Progress</span>
                        <span>{totalLeads ? Math.round((contactedCount / totalLeads) * 100) : 0}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${totalLeads ? (contactedCount / totalLeads) * 100 : 0}%` }} 
                        />
                      </div>
                    </div>

                    <div className={styles.statsRow}>
                      <div className={styles.miniStat}>
                        <span className={styles.statLabel}>Attempts</span>
                        <span className={styles.statValue}>{attemptedCount}</span>
                      </div>
                      <div className={styles.miniStat}>
                        <span className={styles.statLabel}>Contacted</span>
                        <span className={styles.statValue}>{contactedCount}</span>
                      </div>
                      <div className={styles.miniStat}>
                        <span className={styles.statLabel}>Success</span>
                        <span className={styles.statValue}>{successCount}</span>
                      </div>
                    </div>
                    {activeCalls > 0 && (
                      <div className={styles.liveIndicator} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                        <span className={styles.pulseDot} style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
                        {activeCalls} call(s) currently active...
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.lastActive}>Updated {new Date(camp.updated_at).toLocaleDateString()}</span>
              <div className={styles.cardActions}>
                {camp.status === 'ACTIVE' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    leftIcon={<Pause size={14} />}
                    onClick={() => handleToggleStatus(camp.id, camp.status)}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    leftIcon={<Play size={14} />}
                    onClick={() => handleToggleStatus(camp.id, camp.status)}
                  >
                    Start
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--card-border)' }}>
            <Megaphone size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No campaigns found</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Create your first campaign to start reaching out to leads.</p>
            <Button leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>New Campaign</Button>
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Campaign"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button isLoading={isSubmitting} onClick={handleCreate}>Create Campaign</Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className={styles.modalForm}>
          <Input 
            label="Campaign Name" 
            placeholder="e.g., Q2 Customer Outreach" 
            required
            value={newCampaign.name}
            onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
          />
          <div className={styles.selectGroup}>
            <label className={styles.label}>Select AI Agent</label>
            <select 
              className={styles.select}
              value={newCampaign.agentId}
              onChange={(e) => setNewCampaign({...newCampaign, agentId: e.target.value})}
            >
              <option value="">Select an agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.type || 'Assistant'})
                </option>
              ))}
            </select>
          </div>
          <div className={styles.checkboxRow} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="includeLeads" 
              checked={includeAllLeads}
              onChange={(e) => setIncludeAllLeads(e.target.checked)}
            />
            <label htmlFor="includeLeads" style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              Include all current leads ({leads.length})
            </label>
          </div>
          <p className={styles.hint} style={{ marginTop: '1rem' }}>You can also assign leads to this campaign from the Leads page after creation.</p>
        </form>
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Campaign"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button isLoading={isSubmitting} onClick={handleUpdate}>Update Campaign</Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className={styles.modalForm}>
          <Input 
            label="Campaign Name" 
            placeholder="e.g., Q2 Customer Outreach" 
            required
            value={newCampaign.name}
            onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
          />
          <div className={styles.selectGroup}>
            <label className={styles.label}>Select AI Agent</label>
            <select 
              className={styles.select}
              value={newCampaign.agentId}
              onChange={(e) => setNewCampaign({...newCampaign, agentId: e.target.value})}
            >
              <option value="">Select an agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.type || 'Assistant'})
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

