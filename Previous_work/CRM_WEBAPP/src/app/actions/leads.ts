"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function addLead(data: { name: string, phone: string, email?: string }) {
  try {
    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    
    const userId = session.userId && session.userId !== "unknown" ? session.userId : null;

    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .insert([{
        ...data,
        organization_id: session.organizationId,
        user_id: userId,
        status: 'NEW',
        interest_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/leads');
    return { success: true, lead };
  } catch (error: any) {
    console.error("Failed to add lead:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteLead(leadId: string) {
  try {
    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    
    let query = supabaseAdmin
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (session.organizationId) {
      query = query.eq('organization_id', session.organizationId);
    }

    const { error } = await query;

    if (error) throw error;

    revalidatePath('/dashboard/leads');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete lead:", error);
    return { success: false, error: error.message };
  }
}

export async function updateLead(leadId: string, data: { name?: string, phone?: string, email?: string, status?: string }) {
  try {
    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    
    let query = supabaseAdmin
      .from('leads')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (session.organizationId) {
      query = query.eq('organization_id', session.organizationId);
    }

    const { error } = await query;

    if (error) throw error;

    revalidatePath('/dashboard/leads');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update lead:", error);
    return { success: false, error: error.message };
  }
}

export async function getLeads() {
  try {
    const { getScopedQuery } = await import("@/lib/auth-utils");
    const { query } = await getScopedQuery();
    
    const { data, error } = await query.leads();

    if (error) throw error;
    return { success: true, leads: data || [] };
  } catch (error: any) {
    console.error("Failed to fetch leads:", error);
    return { success: false, error: error.message, leads: [] };
  }
}

export async function importLeads(leads: { name: string, phone: string, email?: string }[]) {
  try {
    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    const userId = session.userId && session.userId !== "unknown" ? session.userId : null;

    const leadsToInsert = leads.map(lead => ({
      ...lead,
      organization_id: session.organizationId,
      user_id: userId,
      status: 'NEW',
      interest_score: 0
    }));

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert(leadsToInsert)
      .select();

    if (error) throw error;

    revalidatePath('/dashboard/leads');
    return { success: true, count: data?.length || 0 };
  } catch (error: any) {
    console.error("Bulk import failed:", error);
    return { success: false, error: error.message };
  }
}
