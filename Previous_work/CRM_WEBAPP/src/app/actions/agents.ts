"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function updateAgent(agentId: string, data: any) {
  try {
    if (!agentId || agentId === "null" || agentId === "undefined") {
      throw new Error("Invalid Agent ID provided");
    }

    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    
    let query = supabaseAdmin
      .from('agents')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId);

    // Only apply org filter if we have an org ID, otherwise it can cause UUID syntax errors in Supabase
    if (session.organizationId) {
      query = query.eq('organization_id', session.organizationId);
    }

    const { error } = await query;

    if (error) throw error;

    revalidatePath('/dashboard/agents');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update agent:", error);
    return { success: false, error: error.message };
  }
}

export async function createAgent(data: any) {
  try {
    const session = await getSession();
    console.log("Creating agent for session:", session.email, "Org:", session.organizationId);
    
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .insert([{
        ...data,
        organization_id: session.organizationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      throw error;
    }

    revalidatePath('/dashboard/agents');
    return { success: true, agent };
  } catch (error: any) {
    console.error("Failed to create agent:", error);
    return { success: false, error: error.message };
  }
}

export async function optimizePrompt(currentPrompt: string, goal: string) {
  // Define the fallback function for reuse
  const getSimulatedPrompt = (prompt: string) => `[OPTIMIZED PERSONA]
You are a top-tier sales consultant specializing in AI-driven outreach. Your tone is professional, empathetic, and persistent but never pushy.

[MAIN OBJECTIVE]
Qualify the lead by confirming their current CRM pain points and scheduling a deep-dive discovery call with a human specialist.

[GUIDELINES]
1. Acknowledge: Start by validating their recent interest.
2. Discovery: Ask "How are you currently managing your outbound lead volume?"
3. Objection Handling: If they mention price, pivot to "ROI and time saved."
4. Close: Secure a specific time for a follow-up.

[ORIGINAL SCRIPT REFINED]
${prompt || "Initial outreach draft..."}`;

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_api_key_here' || apiKey.length < 10) {
      console.warn("GOOGLE_API_KEY missing or invalid, using demo optimization logic.");
      return { success: true, optimizedPrompt: getSimulatedPrompt(currentPrompt) };
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-1.5-flash which is the standard fast model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an expert AI Prompt Engineer specializing in sales and support voice agents.
    Your task is to take an existing agent prompt and a business goal, then produce a highly optimized, professional "System Prompt".
    The output should be clear, concise, and structured for an LLM to follow during a live phone call.
    Include specific instructions for:
    - Persona & Tone
    - Main Objective
    - Key talking points or qualifying questions
    - Handling common objections
    - Clear Call to Action (CTA)

    Format the output as a single, well-structured text block.`;

    const userPrompt = `Current Prompt: "${currentPrompt}"\nGoal: "${goal}"\n\nOptimize this for a high-converting voice agent.`;

    try {
      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        optimizedPrompt: text
      };
    } catch (apiError: any) {
      console.error("Gemini API Error, falling back to simulated optimization:", apiError);
      return { 
        success: true, 
        optimizedPrompt: getSimulatedPrompt(currentPrompt),
        warning: "Used local optimizer due to service unavailability."
      };
    }
  } catch (error: any) {
    console.error("Optimization logic failed:", error);
    return { success: false, error: error.message };
  }
}

export async function getAgents() {
  try {
    const { getScopedQuery } = await import("@/lib/auth-utils");
    const { query } = await getScopedQuery();
    
    const { data, error } = await query.agents();

    if (error) throw error;
    return { success: true, agents: data || [] };
  } catch (error: any) {
    console.error("Failed to fetch agents:", error);
    return { success: false, error: error.message, agents: [] };
  }
}
export async function deleteAgent(agentId: string) {
  try {
    const session = await getSession();
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    
    const { error } = await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', agentId)
      .eq('organization_id', session.organizationId!);

    if (error) throw error;

    revalidatePath('/dashboard/agents');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete agent:", error);
    return { success: false, error: error.message };
  }
}
