"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function createOrganization(name: string) {
  try {
    // Generate a unique 8-character invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data: organization, error } = await supabaseAdmin
      .from('organizations')
      .insert([{
        name,
        invite_code: inviteCode,
      }])
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/admin");
    return { success: true, organization };
  } catch (error: any) {
    console.error("Failed to create organization:", error);
    return { success: false, error: error.message || "Failed to create organization" };
  }
}

export async function getOrganizations() {
  try {
    // Note: Supabase doesn't have a direct 'include' like Prisma for counts,
    // so we either do separate queries or a more complex RPC/join.
    // For now, let's fetch the organizations and the counts will be handled by the UI or separate calls.
    const { data: organizations, error } = await supabaseAdmin
      .from('organizations')
      .select(`
        *,
        users(count),
        agents(count),
        leads(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the response to match what the UI expects (Prisma style counts)
    const formattedOrgs = organizations?.map(org => ({
      ...org,
      _count: {
        users: org.users?.[0]?.count || 0,
        agents: org.agents?.[0]?.count || 0,
        leads: org.leads?.[0]?.count || 0,
      }
    }));

    return { success: true, organizations: formattedOrgs };
  } catch (error: any) {
    console.error("Failed to fetch organizations:", error);
    return { success: false, error: error.message || "Failed to fetch organizations" };
  }
}
