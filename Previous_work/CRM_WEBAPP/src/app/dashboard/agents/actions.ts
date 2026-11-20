"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function createAgent(data: {
  name: string;
  systemPrompt: string;
  voiceId: string;
  organizationId: string;
}) {
  try {
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .insert([{
        name: data.name,
        prompt: data.systemPrompt,
        voice_id: data.voiceId,
        organization_id: data.organizationId,
      }])
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/agents");
    return { success: true, agent };
  } catch (error: any) {
    console.error("Failed to create agent:", error);
    return { success: false, error: error.message || "Failed to create agent" };
  }
}

export async function updateAgent(id: string, data: Partial<{
  name: string;
  systemPrompt: string;
  voiceId: string;
}>) {
  try {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.systemPrompt) updateData.prompt = data.systemPrompt;
    if (data.voiceId) updateData.voice_id = data.voiceId;

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/agents");
    return { success: true, agent };
  } catch (error: any) {
    console.error("Failed to update agent:", error);
    return { success: false, error: error.message || "Failed to update agent" };
  }
}

export async function getAgents(organizationId: string) {
  try {
    const { data: agents, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, agents };
  } catch (error: any) {
    console.error("Failed to fetch agents:", error);
    return { success: false, error: error.message || "Failed to fetch agents" };
  }
}
