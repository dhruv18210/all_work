"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function createCampaign(data: { name: string, agentId: string, leadIds: string[] }) {
  try {
    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    // 1. Create Campaign
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .insert([{
        name: data.name,
        agent_id: data.agentId,
        organization_id: session.organizationId,
        user_id: session.userId && session.userId !== "unknown" ? session.userId : null,
        status: 'DRAFT',
        leads_count: data.leadIds.length
      }])
      .select()
      .single();

    if (campaignError) throw campaignError;

    // 2. Link Leads via Junction Table
    if (data.leadIds.length > 0) {
      const junctionEntries = data.leadIds.map(leadId => ({
        campaign_id: campaign.id,
        lead_id: leadId
      }));
      
      const { error: junctionError } = await supabaseAdmin
        .from('campaign_leads')
        .insert(junctionEntries);
      
      if (junctionError) throw junctionError;
    }

    revalidatePath('/dashboard/campaigns');
    return { success: true, campaign };
  } catch (error: any) {
    console.error("Failed to create campaign:", error);
    return { success: false, error: error.message };
  }
}

export async function startCampaignExecution(campaignId: string) {
  try {
    const session = await getSession();
    const { initiateOutboundCall } = await import("./calls");

    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    // 1. Get Campaign Info
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('*, campaign_leads(lead_id)')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) throw new Error("Campaign not found");

    // 2. Update Status to ACTIVE
    await supabaseAdmin.from('campaigns').update({ status: 'ACTIVE' }).eq('id', campaignId);

    // 3. Loop through leads and trigger AI Dialer
    const leads = campaign.campaign_leads || [];
    
    // We trigger calls in parallel (or with a small delay for production)
    for (const entry of leads) {
      await initiateOutboundCall(entry.lead_id, campaign.agent_id, campaignId);
      // Wait 1 second between dials to avoid spamming the carrier
      await new Promise(r => setTimeout(r, 1000));
    }

    revalidatePath('/dashboard/campaigns');
    return { success: true, count: leads.length, error: undefined };
  } catch (error: any) {
    console.error("Failed to start campaign:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED' | 'COMPLETED') {
  try {
    const session = await getSession();
    
    // If starting, use our execution loop
    if (status === 'ACTIVE') {
      return await startCampaignExecution(campaignId);
    }

    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    let query = supabaseAdmin
      .from('campaigns')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', campaignId);

    if (session.organizationId) {
      query = query.eq('organization_id', session.organizationId);
    }

    const { error } = await query;

    if (error) throw error;

    revalidatePath('/dashboard/campaigns');
    return { success: true, error: undefined };
  } catch (error: any) {
    console.error("Failed to update campaign status:", error);
    return { success: false, error: error.message };
  }
}

export async function getCampaigns() {
  try {
    const { getScopedQuery } = await import("@/lib/auth-utils");
    const { query } = await getScopedQuery();
    
    const { data, error } = await query.campaigns();

    if (error) throw error;
    return { success: true, campaigns: data || [] };
  } catch (error: any) {
    console.error("Failed to fetch campaigns:", error);
    return { success: false, error: error.message, campaigns: [] };
  }
}

export async function syncLeadsToCampaign(campaignId: string) {
  try {
    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    // 1. Get all leads for the organization
    let leadQuery = supabaseAdmin.from('leads').select('id');
    if (session.organizationId) {
      leadQuery = leadQuery.eq('organization_id', session.organizationId);
    } else {
      leadQuery = leadQuery.is('organization_id', null);
    }

    const { data: leads, error: leadError } = await leadQuery;

    if (leadError || !leads) throw leadError;

    // 2. Link leads to the campaign (ignoring duplicates)
    const junctionEntries = leads.map(lead => ({
      campaign_id: campaignId,
      lead_id: lead.id
    }));

    const { error: junctionError } = await supabaseAdmin
      .from('campaign_leads')
      .upsert(junctionEntries, { onConflict: 'campaign_id,lead_id' });

    if (junctionError) throw junctionError;

    // 3. Update the leads_count column for cached views
    await supabaseAdmin
      .from('campaigns')
      .update({ leads_count: leads.length })
      .eq('id', campaignId);

    revalidatePath('/dashboard/campaigns');
    return { success: true, count: leads.length };
  } catch (error: any) {
    console.error("Failed to sync leads:", error);
    return { success: false, error: error.message };
  }
}
export async function deleteCampaign(campaignId: string) {
  try {
    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    let query = supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (session.organizationId) {
      query = query.eq('organization_id', session.organizationId);
    }

    const { error } = await query;

    if (error) throw error;

    revalidatePath('/dashboard/campaigns');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete campaign:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCampaign(campaignId: string, data: { name?: string, agent_id?: string }) {
  try {
    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    let query = supabaseAdmin
      .from('campaigns')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', campaignId);

    if (session.organizationId) {
      query = query.eq('organization_id', session.organizationId);
    }

    const { error } = await query;

    if (error) throw error;

    revalidatePath('/dashboard/campaigns');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update campaign:", error);
    return { success: false, error: error.message };
  }
}
