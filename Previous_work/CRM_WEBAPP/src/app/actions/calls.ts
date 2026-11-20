"use server";

import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function initiateOutboundCall(leadId: string, agentId: string, campaignId?: string) {
  try {
    const { getSession } = await import("@/lib/auth-utils");
    const session = await getSession();

    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    // 1. Fetch Lead info (and verify ownership)
    let leadQuery = supabaseAdmin.from('leads').select('*').eq('id', leadId);
    if (session.organizationId) {
      leadQuery = leadQuery.eq('organization_id', session.organizationId);
    } else {
      leadQuery = leadQuery.is('organization_id', null);
    }

    const { data: lead, error: leadError } = await leadQuery.single();

    if (leadError || !lead) throw new Error("Lead not found or unauthorized");

    const roomName = `call-${nanoid(10)}`;
    const userId = session.userId && session.userId !== "unknown" ? session.userId : null;

    // 2. Create Call record with organization scoping
    const { data: call, error: callError } = await supabaseAdmin
      .from('calls')
      .insert([{
        organization_id: session.organizationId,
        user_id: userId,
        lead_id: leadId,
        agent_id: agentId,
        campaign_id: campaignId,
        status: 'INITIATING',
        room_name: roomName
      }])
      .select()
      .single();

    if (callError) throw callError;

    // 4. Initiate Twilio Call
    const { getTwilioClient } = await import("@/lib/twilio");
    const client = getTwilioClient();

    const twilioCall = await client.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: lead.phone,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/twiml?room=${roomName}`,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status?room=${roomName}`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    // 5. Update Call with Twilio SID and move to RINGING
    await supabaseAdmin
      .from('calls')
      .update({ 
        twilio_sid: twilioCall.sid,
        status: 'RINGING',
        updated_at: new Date().toISOString()
      })
      .eq('id', call.id);

    return { success: true, callId: call.id, roomName };
  } catch (error: any) {
    console.error("Failed to initiate call:", error);
    return { success: false, error: error.message };
  }
}

export async function getCalls() {
  try {
    const { getScopedQuery } = await import("@/lib/auth-utils");
    const { query } = await getScopedQuery();
    
    const { data, error } = await query.calls();

    if (error) throw error;
    return { success: true, calls: data || [] };
  } catch (error: any) {
    console.error("Failed to fetch calls:", error);
    return { success: false, error: error.message, calls: [] };
  }
}

export async function getCallDetail(callId: string) {
  try {
    const { getSession } = await import("@/lib/auth-utils");
    const session = await getSession();
    
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    
    let query = supabaseAdmin
      .from('calls')
      .select('*, leads(name, phone), agents(name)')
      .eq('id', callId);

    if (session.organizationId) {
      query = query.eq('organization_id', session.organizationId);
    } else {
      query = query.is('organization_id', null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Call log not found or access denied.");
    return { success: true, call: data };
  } catch (error: any) {
    console.error("Failed to fetch call detail:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCall(callId: string) {
  try {
    const { getSession } = await import("@/lib/auth-utils");
    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    let query = supabaseAdmin
      .from('calls')
      .delete()
      .eq('id', callId);

    if (session.organizationId) {
      query = query.eq('organization_id', session.organizationId);
    }

    const { error } = await query;

    const { revalidatePath } = await import("next/cache");
    revalidatePath('/dashboard/calls');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete call:", error);
    return { success: false, error: error.message };
  }
}
