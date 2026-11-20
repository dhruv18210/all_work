"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Zap, 
  Plus, 
  Trash2, 
  Settings, 
  ArrowRight,
  PhoneCall,
  Link as LinkIcon,
  UserPlus,
  X
} from "lucide-react";
import styles from "./automation.module.css";
import { clsx } from 'clsx';
import { getWorkflows, toggleWorkflow, createWorkflow } from '@/app/actions/org';
import { toast } from 'react-hot-toast';

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWF, setNewWF] = useState({ name: '', trigger: 'New Lead Added', action: 'Trigger AI Call' });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    const res = await getWorkflows();
    if (res.success) setWorkflows(res.workflows);
    setIsLoading(false);
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    const newState = !currentState;
    setWorkflows(prev => prev.map(wf => wf.id === id ? { ...wf, enabled: newState } : wf));
    const res = await toggleWorkflow(id, newState);
    if (!res.success) {
      toast.error("Failed to update workflow");
      setWorkflows(prev => prev.map(wf => wf.id === id ? { ...wf, enabled: currentState } : wf));
    } else {
      toast.success(`Workflow ${newState ? 'enabled' : 'disabled'}`);
    }
  };

  const handleCreate = async () => {
    if (!newWF.name) return toast.error("Please enter a name");
    const res = await createWorkflow(newWF);
    if (res.success) {
      toast.success("Workflow created!");
      setWorkflows([res.workflow, ...workflows]);
      setIsModalOpen(false);
      setNewWF({ name: '', trigger: 'New Lead Added', action: 'Trigger AI Call' });
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Automation & Workflows</h1>
          <p className={styles.subtitle}>Set up "If This, Then That" rules to automate your sales pipeline.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>Create Workflow</Button>
      </div>

      <div className={styles.workflowGrid}>
        {isLoading ? (
          <div className={styles.loading}>Loading automations...</div>
        ) : workflows.length > 0 ? workflows.map((wf) => (
          <div key={wf.id} className={styles.workflowCard}>
            <div className={styles.cardTop}>
              <div className={styles.workflowHeader}>
                <div className={styles.iconBox}>
                  <Zap size={20} className={wf.enabled ? styles.zapActive : ''} />
                </div>
                <div>
                  <h3>{wf.name}</h3>
                  <span className={styles.lastRun}>
                    Last run: {wf.last_run ? new Date(wf.last_run).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
              <div className={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={wf.enabled} 
                  onChange={() => handleToggle(wf.id, wf.enabled)} 
                  id={`toggle-${wf.id}`}
                />
                <label htmlFor={`toggle-${wf.id}`} />
              </div>
            </div>

            <div className={styles.flowViz}>
              <div className={styles.flowStep}>
                <div className={styles.stepIcon}>
                  {wf.trigger.includes('Lead') ? <UserPlus size={16} /> : <PhoneCall size={16} />}
                </div>
                <div className={styles.stepInfo}>
                  <span className={styles.stepType}>TRIGGER</span>
                  <span className={styles.stepLabel}>{wf.trigger}</span>
                </div>
              </div>
              
              <div className={styles.flowConnector}>
                <ArrowRight size={20} className={styles.connectorArrow} />
              </div>

              <div className={styles.flowStep}>
                <div className={styles.stepIcon}>
                  {wf.action.includes('Call') ? <PhoneCall size={16} /> : <LinkIcon size={16} />}
                </div>
                <div className={styles.stepInfo}>
                  <span className={styles.stepType}>ACTION</span>
                  <span className={styles.stepLabel}>{wf.action}</span>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <Button variant="ghost" size="sm" leftIcon={<Settings size={16} />} onClick={() => toast("Configuration module coming soon!")}>Configure</Button>
              <Button variant="ghost" size="sm" className={styles.deleteBtn} onClick={() => toast("Delete feature locked in demo.")}><Trash2 size={16} /></Button>
            </div>
          </div>
        )) : (
          <div className={styles.noData}>No active workflows found.</div>
        )}

        <button className={styles.addCard} onClick={() => setIsModalOpen(true)}>
          <div className={styles.plusCircle}>
            <Plus size={24} />
          </div>
          <span>Add New Workflow</span>
        </button>
      </div>

      {/* CREATE WORKFLOW MODAL */}
      {isModalOpen && (
        <div className={styles.overlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Workflow</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Workflow Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Follow-up Priority Leads" 
                  value={newWF.name}
                  onChange={e => setNewWF({...newWF, name: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Select Trigger</label>
                <select value={newWF.trigger} onChange={e => setNewWF({...newWF, trigger: e.target.value})}>
                  <option>New Lead Added</option>
                  <option>Lead Status: Qualified</option>
                  <option>Call Status: Busy/No Answer</option>
                  <option>Call Status: Completed</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Select Action</label>
                <select value={newWF.action} onChange={e => setNewWF({...newWF, action: e.target.value})}>
                  <option>Trigger AI Call</option>
                  <option>Schedule Retry (2 hours)</option>
                  <option>Send Webhook / Slack</option>
                  <option>Send SMS Notification</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Build Workflow</Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.integrationsSection}>
        <div className={styles.sectionHeader}>
          <h2>External Integrations</h2>
          <p>Connect your favorite tools to sync data in real-time.</p>
        </div>
        <div className={styles.integrationGrid}>
          {[
            { name: 'Slack', status: 'Connected', icon: 'S' },
            { name: 'Salesforce', status: 'Not Connected', icon: 'Sf' },
            { name: 'HubSpot', status: 'Connected', icon: 'H' },
            { name: 'Zapier', status: 'Connected', icon: 'Z' },
          ].map((int) => (
            <div key={int.name} className={styles.integrationCard}>
              <div className={styles.intIcon}>{int.icon}</div>
              <div className={styles.intInfo}>
                <span className={styles.intName}>{int.name}</span>
                <span className={clsx(styles.intStatus, int.status === 'Connected' ? styles.success : styles.muted)}>
                  {int.status}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast(`Managing ${int.name}...`)}>Manage</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
