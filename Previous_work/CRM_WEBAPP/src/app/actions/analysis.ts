"use server";

import { supabase } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analyzeCall(transcript: string, roomName?: string) {
  try {
    if (!transcript) return { success: false, error: "No transcript provided" };

    const { supabaseAdmin } = await import("@/lib/supabase-admin");

    const prompt = `Analyze the following sales call transcript. Extract:
          1. Sentiment (Positive, Neutral, Negative)
          2. Interest Score (1-10)
          3. Summary (2-3 sentences)
          4. Outcome (Interested, Not Interested, Callback, Busy)
          5. Next Step (Actionable item)
          
          Return as JSON with keys: sentiment, interest_score, summary, outcome, next_step.
          
          Transcript: ${transcript}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from text (handling potential markdown formatting)
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(jsonStr || "{}");

    // Update Call record (either by ID or Room Name)
    let query = supabaseAdmin.from('calls').update({
        transcript,
        sentiment: analysis.sentiment,
        interest_score: analysis.interest_score,
        summary: analysis.summary,
        outcome: analysis.outcome,
        status: 'COMPLETED'
      });

    if (roomName) {
      query = query.eq('room_name', roomName);
    } else {
      return { success: false, error: "No room name or ID provided" };
    }

    const { data: calls, error: callError } = await query.select();

    if (callError || !calls || calls.length === 0) throw callError || new Error("Call not found");
    const call = calls[0];

    // Update Lead status based on outcome
    if (analysis.interest_score >= 7 || analysis.outcome === 'Interested') {
      await supabaseAdmin
        .from('leads')
        .update({ status: 'QUALIFIED' })
        .eq('id', call.lead_id);
    } else if (analysis.outcome === 'Callback') {
      await supabaseAdmin
        .from('leads')
        .update({ status: 'CALLBACK' })
        .eq('id', call.lead_id);
    }

    return { success: true, analysis };
  } catch (error: any) {
    console.error("Call analysis failed:", error);
    return { success: false, error: error.message };
  }
}
