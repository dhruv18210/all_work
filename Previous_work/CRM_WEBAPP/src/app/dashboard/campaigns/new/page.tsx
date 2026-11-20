"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Bot, 
  Users, 
  Settings, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  PhoneCall,
  Calendar,
  Rocket,
  Plus
} from "lucide-react";
import styles from "./wizard.module.css";
import { clsx } from 'clsx';

const steps = [
  { id: 1, title: 'AI Agent', icon: Bot, desc: 'Select or create your caller' },
  { id: 2, title: 'Leads', icon: Users, desc: 'Upload your call list' },
  { id: 3, title: 'Settings', icon: Settings, desc: 'Configure call behavior' },
  { id: 4, title: 'Launch', icon: Rocket, desc: 'Review and go live' },
];

export default function CampaignWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className={styles.container}>
      <div className={styles.wizardHeader}>
        <div className={styles.headerInfo}>
          <h1>Create New Campaign</h1>
          <p>Follow the steps below to launch your AI calling outreach.</p>
        </div>
        <Button variant="ghost" leftIcon={<ArrowLeft size={18} />}>Back to Campaigns</Button>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressWrapper}>
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={clsx(
              styles.stepItem, 
              currentStep === step.id && styles.stepActive,
              currentStep > step.id && styles.stepCompleted
            )}
          >
            <div className={styles.stepIcon}>
              {currentStep > step.id ? <CheckCircle2 size={24} /> : <step.icon size={24} />}
            </div>
            <div className={styles.stepText}>
              <span className={styles.stepTitle}>Step {step.id}</span>
              <span className={styles.stepDesc}>{step.title}</span>
            </div>
            {step.id < 4 && <div className={styles.connector} />}
          </div>
        ))}
      </div>

      <div className={styles.wizardContent}>
        {/* Step 1: Agent Selection */}
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <h2>Select your AI Agent</h2>
            <p>Choose which AI personality will be making the calls.</p>
            <div className={styles.agentGrid}>
              {[
                { id: 'a1', name: 'Sarah (Sales)', voice: 'Soft English', goal: 'Outbound Sales' },
                { id: 'a2', name: 'James (Support)', voice: 'Deep English', goal: 'Technical Support' },
              ].map((agent) => (
                <div 
                  key={agent.id} 
                  className={clsx(styles.agentCard, selectedAgent === agent.id && styles.selected)}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <Bot size={32} className={styles.agentIcon} />
                  <h3>{agent.name}</h3>
                  <span className={styles.agentMeta}>{agent.voice} • {agent.goal}</span>
                  {selectedAgent === agent.id && <CheckCircle2 size={20} className={styles.check} />}
                </div>
              ))}
              <div className={styles.addAgentCard}>
                <Plus size={32} />
                <span>Create New Agent</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Leads Upload */}
        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <h2>Upload your Lead List</h2>
            <p>Upload a CSV file or manually add phone numbers to the campaign.</p>
            <div className={styles.uploadArea}>
              <div className={styles.uploadBox}>
                <Upload size={48} className={styles.uploadIcon} />
                <h3>Drop CSV file here</h3>
                <p>or click to browse your files (Max 50MB)</p>
                <input type="file" hidden />
              </div>
              <div className={styles.uploadManual}>
                <Button variant="outline" leftIcon={<Plus size={18} />}>Add Numbers Manually</Button>
                <p>Accepted formats: .csv, .xlsx, .txt</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <h2>Configure Call Behavior</h2>
            <div className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label><PhoneCall size={16} /> Call Concurrency</label>
                <input type="range" min="1" max="50" defaultValue="10" className={styles.range} />
                <span className={styles.hint}>Make up to 10 calls simultaneously</span>
              </div>
              <div className={styles.formGroup}>
                <label><Calendar size={16} /> Scheduling</label>
                <select className={styles.select}>
                  <option>Start immediately</option>
                  <option>Schedule for later</option>
                  <option>Recurring weekly</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label><CheckCircle2 size={16} /> Retries</label>
                <select className={styles.select}>
                  <option>No retries</option>
                  <option>3 attempts (30m gap)</option>
                  <option>5 attempts (1h gap)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {currentStep === 4 && (
          <div className={styles.stepContent}>
            <div className={styles.launchReview}>
              <Rocket size={64} className={styles.launchIcon} />
              <h2>Ready to Launch!</h2>
              <p>Everything looks great. Here is a summary of your campaign.</p>
              <div className={styles.summaryBox}>
                <div className={styles.summaryItem}><span>Agent</span> <strong>Sarah (Sales)</strong></div>
                <div className={styles.summaryItem}><span>Total Leads</span> <strong>1,240</strong></div>
                <div className={styles.summaryItem}><span>Concurrency</span> <strong>10 calls</strong></div>
                <div className={styles.summaryItem}><span>Est. Duration</span> <strong>~45 minutes</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.wizardFooter}>
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 1}
          leftIcon={<ArrowLeft size={18} />}
        >
          Previous
        </Button>
        {currentStep < 4 ? (
          <Button 
            onClick={nextStep} 
            rightIcon={<ArrowRight size={18} />}
          >
            Next Step
          </Button>
        ) : (
          <Button 
            variant="primary" 
            className={styles.launchBtn}
            rightIcon={<Rocket size={18} />}
          >
            LAUNCH CAMPAIGN
          </Button>
        )}
      </div>
    </div>
  );
}
