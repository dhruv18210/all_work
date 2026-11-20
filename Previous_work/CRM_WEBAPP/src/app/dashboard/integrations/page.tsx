"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { 
  Code2, 
  Key, 
  Webhook, 
  Puzzle, 
  Copy, 
  Plus, 
  Check, 
  ExternalLink,
  Cpu,
  RefreshCw,
  Terminal,
  Database
} from "lucide-react";
import styles from "./integrations.module.css";
import { clsx } from 'clsx';

const codeSnippet = `curl -X POST https://api.kology.ai/v1/calls \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "+1234567890",
    "assistantId": "asst_123456",
    "metadata": {
      "leadSource": "Website Form"
    }
  }'`;

export default function IntegrationsPage() {
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState('sk_live_51M...8pW2');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>API & Integrations</h1>
          <p className={styles.subtitle}>Connect Kology to your existing stack and build custom automated workflows.</p>
        </div>
        <Button leftIcon={<Puzzle size={18} />}>Explore Marketplace</Button>
      </div>

      <div className={styles.layout}>
        {/* API Keys Management */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <Key size={20} />
              <h3>API Keys</h3>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Plus size={16} />}>Generate New Key</Button>
          </div>
          <div className={styles.apiKeyBox}>
            <div className={styles.keyInfo}>
              <span className={styles.keyLabel}>Production Key</span>
              <div className={styles.keyValueContainer}>
                <code className={styles.keyValue}>{apiKey}</code>
                <button onClick={() => handleCopy(apiKey)} className={styles.copyBtn}>
                  {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className={styles.keyMeta}>
              <span>Created on May 1, 2026</span>
              <button className={styles.revokeBtn}>Revoke</button>
            </div>
          </div>
        </div>

        {/* Webhooks Configuration */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <Webhook size={20} />
              <h3>Webhook Endpoints</h3>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Plus size={16} />}>Add Endpoint</Button>
          </div>
          <div className={styles.webhookList}>
            <div className={styles.webhookItem}>
              <div className={styles.webhookMeta}>
                <span className={styles.method}>POST</span>
                <span className={styles.url}>https://crm.acme.com/webhooks/kology</span>
              </div>
              <div className={styles.webhookTags}>
                <span className={styles.tag}>call.ended</span>
                <span className={styles.tag}>lead.qualified</span>
              </div>
              <div className={styles.webhookActions}>
                <span className={styles.status}>Active</span>
                <button className={styles.editBtn}>Edit</button>
              </div>
            </div>
          </div>
        </div>

        {/* Quickstart Documentation */}
        <div className={clsx(styles.card, styles.codeCard)}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <Terminal size={20} />
              <h3>Trigger Call via API</h3>
            </div>
            <a href="#" className={styles.docsLink}>Full API Docs <ExternalLink size={14} /></a>
          </div>
          <div className={styles.codeWrapper}>
            <pre className={styles.codeBlock}>
              {codeSnippet}
            </pre>
            <button onClick={() => handleCopy(codeSnippet)} className={styles.codeCopy}>
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* CRM Marketplace */}
        <div className={styles.marketplaceSection}>
          <div className={styles.sectionHeader}>
            <Database size={20} />
            <h3>Direct CRM Sync</h3>
          </div>
          <div className={styles.syncGrid}>
            {[
              { name: 'Salesforce', desc: 'Sync qualified leads and call recordings.', status: 'Beta' },
              { name: 'HubSpot', desc: 'Automatic timeline logging and status updates.', status: 'Native' },
              { name: 'Pipedrive', desc: 'Trigger calls from deal movements.', status: 'Native' },
            ].map((crm) => (
              <div key={crm.name} className={styles.crmCard}>
                <div className={styles.crmLogo}>{crm.name[0]}</div>
                <div className={styles.crmInfo}>
                  <div className={styles.crmHeader}>
                    <h4>{crm.name}</h4>
                    <span className={styles.crmStatus}>{crm.status}</span>
                  </div>
                  <p>{crm.desc}</p>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
