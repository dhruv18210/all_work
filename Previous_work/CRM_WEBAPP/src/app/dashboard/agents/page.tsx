"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Bot, 
  Settings2, 
  MessageSquare, 
  Volume2, 
  Wand2, 
  Play,
  Save,
  Trash2,
  Plus,
  PhoneCall as PhoneIcon
} from "lucide-react";
import styles from "./agents.module.css";
import { clsx } from 'clsx';
import { updateAgent, optimizePrompt, getAgents, createAgent, deleteAgent } from '@/app/actions/agents';
import { initiateOutboundCall } from '@/app/actions/calls';
import { getLeads } from '@/app/actions/leads';
import { toast } from 'react-hot-toast';

const voices = [
  { id: 'v1', name: 'James', gender: 'Male', provider: 'ElevenLabs' },
  { id: 'v2', name: 'Sarah', gender: 'Female', provider: 'Play.ht' },
  { id: 'v3', name: 'Marcus', gender: 'Male', provider: 'Deepgram' },
  { id: 'v4', name: 'Elena', gender: 'Female', provider: 'ElevenLabs' },
];

export default function AgentBuilder() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('script');
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // Form State
  const [prompt, setPrompt] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [behavior, setBehavior] = useState({
    maxDuration: 300,
    temperature: 0.7,
    handoff: false
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    const result = await getAgents();
    if (result.success && result.agents && result.agents.length > 0) {
      setAgents(result.agents);
      // Auto-select the first agent if nothing is selected or if the current selection is gone
      if (!selectedAgentId || !result.agents.find(a => a.id === selectedAgentId)) {
        setSelectedAgentId(result.agents[0].id);
      }
    } else if (result.success) {
      setAgents([]);
      setSelectedAgentId(null);
    }
  };

  // Load agent data when selection changes
  useEffect(() => {
    const agent = agents.find(a => a.id === selectedAgentId);
    if (agent) {
      setPrompt(agent.prompt || "");
      setSelectedVoice(agent.voice_id || "");
      setBehavior({
        maxDuration: agent.max_duration || 300,
        temperature: agent.temperature || 0.7,
        handoff: agent.handoff_enabled || false
      });
    }
  }, [selectedAgentId, agents]);

  const handleSave = async () => {
    setIsSaving(true);
    if (!selectedAgentId) return;
    const result = await updateAgent(selectedAgentId, {
      prompt,
      voice_id: selectedVoice,
      max_duration: behavior.maxDuration,
      temperature: behavior.temperature,
      handoff_enabled: behavior.handoff
    });
    
    setIsSaving(false);
    if (result.success) {
      toast.success("Agent configuration saved!");
    } else {
      toast.error(`Save failed: ${result.error}`);
    }
  };

  const handleOptimize = async () => {
    if (!prompt) {
      toast.error("Please enter a script to optimize");
      return;
    }
    
    setIsOptimizing(true);
    try {
      const result = await optimizePrompt(prompt, "Increase conversion and handle objections better");
      setIsOptimizing(false);
      
      if (result.success && result.optimizedPrompt) {
        setPrompt(result.optimizedPrompt);
        toast.success("Prompt optimized with AI!");
      } else {
        toast.error(`Optimization failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setIsOptimizing(false);
      console.error("Optimize Error:", err);
      toast.error("An unexpected error occurred during optimization.");
    }
  };

  const handleTestCall = async () => {
    setIsTesting(true);
    const toastId = toast.loading("Fetching a test lead...");
    
    if (!selectedAgentId) {
      toast.error("Please select an agent first", { id: toastId });
      setIsTesting(false);
      return;
    }

    // 1. Get a real lead to call
    const leadsResult = await getLeads();
    const firstLead = leadsResult.success && leadsResult.leads?.[0];

    if (!firstLead) {
      toast.error("No leads found. Please add a lead in the Leads & CRM section first.", { id: toastId });
      setIsTesting(false);
      return;
    }

    toast.loading(`Connecting to ${firstLead.name}...`, { id: toastId });
    
    // 2. Initiate Call
    const result = await initiateOutboundCall(firstLead.id, selectedAgentId);
    
    setIsTesting(false);
    if (result.success) {
      toast.success(`Call started! Room: ${result.roomName}`, { id: toastId });
    } else {
      toast.error(`Call failed: ${result.error}`, { id: toastId });
    }
  };

  const handleAddAgent = async () => {
    const toastId = toast.loading("Creating agent...");
    const result = await createAgent({
      name: "New AI Agent",
      prompt: "You are a helpful assistant for Kology CRM. Your goal is to qualify leads and help them succeed.",
      voice_id: "v1",
      max_duration: 300,
      temperature: 0.7,
      handoff_enabled: false
    });

    if (result.success && result.agent) {
      toast.success("Agent created!", { id: toastId });
      // Update local state immediately
      setAgents(prev => [result.agent, ...prev]);
      setSelectedAgentId(result.agent.id);
    } else {
      toast.error(`Failed to create agent: ${result.error}`, { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!selectedAgentId) return;
    if (!confirm("Are you sure you want to delete this agent? This cannot be undone.")) return;

    const toastId = toast.loading("Deleting agent...");
    const result = await deleteAgent(selectedAgentId);

    if (result.success) {
      toast.success("Agent deleted!", { id: toastId });
      const remainingAgents = agents.filter(a => a.id !== selectedAgentId);
      setAgents(remainingAgents);
      setSelectedAgentId(remainingAgents.length > 0 ? remainingAgents[0].id : null);
    } else {
      toast.error(`Delete failed: ${result.error}`, { id: toastId });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>AI Agent Builder</h1>
          <p className={styles.subtitle}>Configure your agent's personality, voice, and conversation flow.</p>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" leftIcon={<Trash2 size={18} />} onClick={handleDelete}>Delete</Button>
          <Button 
            leftIcon={<Save size={18} />} 
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Sidebar: Agent List */}
        <div className={styles.agentList}>
          <div className={styles.listHeader}>
            <h3>Your Agents</h3>
            <button className={styles.addButton} onClick={handleAddAgent}><Plus size={16} /></button>
          </div>
          <div className={styles.listContent}>
            {agents.length > 0 ? agents.map((agent) => (
              <div 
                key={agent.id} 
                className={clsx(styles.agentItem, selectedAgentId === agent.id && styles.activeAgent)}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <Bot size={20} />
                <div className={styles.agentMeta}>
                  <span className={styles.agentName}>{agent.name}</span>
                  <span className={styles.agentType}>{agent.type || 'Assistant'}</span>
                </div>
              </div>
            )) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                No agents created yet.
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Configuration */}
        <div className={styles.configArea}>
          <div className={styles.tabs}>
            <button 
              className={clsx(styles.tab, activeTab === 'script' && styles.activeTab)}
              onClick={() => setActiveTab('script')}
            >
              <MessageSquare size={18} /> Script & Persona
            </button>
            <button 
              className={clsx(styles.tab, activeTab === 'voice' && styles.activeTab)}
              onClick={() => setActiveTab('voice')}
            >
              <Volume2 size={18} /> Voice Settings
            </button>
            <button 
              className={clsx(styles.tab, activeTab === 'behavior' && styles.activeTab)}
              onClick={() => setActiveTab('behavior')}
            >
              <Settings2 size={18} /> Advanced Behavior
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'script' && (
              <div className={styles.formGroup}>
                <label>System Prompt (Personality & Logic)</label>
                <div className={styles.textareaWrapper}>
                  <textarea 
                    placeholder="You are a helpful sales assistant for Kology CRM. Your goal is to qualify the lead and schedule a callback..."
                    className={styles.textarea}
                    rows={12}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <button 
                    className={styles.aiHelpButton}
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                  >
                    {isOptimizing ? "Thinking..." : <><Wand2 size={16} /> Optimize with AI</>}
                  </button>
                </div>
                <p className={styles.hint}>Describe how the agent should behave, handle objections, and the final goal of the call.</p>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className={styles.voiceGrid}>
                {voices.map((voice) => (
                  <div 
                    key={voice.id} 
                    className={clsx(styles.voiceCard, selectedVoice === voice.id && styles.activeVoice)}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className={styles.voiceInfo}>
                      <span className={styles.voiceName}>{voice.name}</span>
                      <span className={styles.voiceProvider}>{voice.provider}</span>
                    </div>
                    <button className={styles.playButton}><Play size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'behavior' && (
              <div className={styles.behaviorForm}>
                <div className={styles.inputRow}>
                  <label>Max Call Duration (sec)</label>
                  <input 
                    type="number" 
                    value={behavior.maxDuration} 
                    onChange={(e) => setBehavior({...behavior, maxDuration: parseInt(e.target.value)})}
                  />
                </div>
                <div className={styles.inputRow}>
                  <label>Temperature (Creativity): {behavior.temperature}</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={behavior.temperature}
                    onChange={(e) => setBehavior({...behavior, temperature: parseFloat(e.target.value)})}
                  />
                </div>
                <div className={styles.checkboxRow}>
                  <input 
                    type="checkbox" 
                    id="handoff" 
                    checked={behavior.handoff}
                    onChange={(e) => setBehavior({...behavior, handoff: e.target.checked})}
                  />
                  <label htmlFor="handoff">Enable Human Handoff on Frustration</label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview / Tester */}
        <div className={styles.previewArea}>
          <div className={styles.previewHeader}>
            <h3>Interactive Preview</h3>
            <span className={styles.liveStatus}>Online</span>
          </div>
          <div className={styles.chatPreview}>
            <div className={styles.messageAgent}>"Hello! This is Sarah from Kology. Am I speaking with John?"</div>
            <div className={styles.messageUser}>"Yes, this is John. Who is this?"</div>
            <div className={styles.messageAgent}>"Great! I'm calling to follow up on your interest in our AI calling platform. Do you have 2 minutes?"</div>
          </div>
          <Button 
            fullWidth 
            variant="primary" 
            leftIcon={<PhoneIcon size={18} />}
            onClick={handleTestCall}
            isLoading={isTesting}
          >
            Test Call (To Your Phone)
          </Button>
        </div>
      </div>
    </div>
  );
}

