const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || "google/gemini-2.0-flash-001";

function extractJSON(text) {
  let str = text.trim();
  // Remove <think>...</think> blocks (Qwen thinking mode)
  str = str.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Remove markdown code fences
  if (str.includes("```")) {
    const match = str.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) str = match[1].trim();
  }
  // Try to find the JSON object boundaries
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    str = str.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(str);
}

async function callLLM(systemPrompt, userPrompt, schema) {
  const schemaInstruction = `\n\nIMPORTANT: You must return ONLY a raw JSON object (no markdown, no explanation, no code fences) that strictly conforms to this schema:\n${JSON.stringify(schema, null, 2)}`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Growth Intelligence System"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt + schemaInstruction },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter API Error:", response.status, errorBody);
      throw new Error(`OpenRouter HTTP error! status: ${response.status} — ${errorBody}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`OpenRouter Error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenRouter response");
    }

    return extractJSON(content);
  } catch (error) {
    console.error("LLM Generation Error:", error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error("Failed to connect to OpenRouter. Check your internet connection.");
    }
    throw new Error("Failed to process LLM response: " + error.message);
  }
}


// ─── STEP 1: Data Collector Agent ───
export async function runDataCollector({ companyName, socialLinks, platformFocus }) {
  const schema = {
    company_name: "String",
    detected_industry: "String",
    platforms_found: [{ platform: "String", url: "String", status: "Active or Primary focus", analysis: "String" }],
    platform_focus: "String",
    brand_summary: "Detailed String",
    digital_presence_audit: { channels_detected: 0, primary_platform: "String", platform_audience: "String", audience_behavior: "String", avg_engagement_benchmark: "String", algorithm_notes: "String" },
    content_patterns: [{ type: "String", performance: "String", metric: "String", frequency: "String", why: "String" }],
    engagement_insights: [{ insight: "String", impact: "High/Critical", actionable: "String" }],
    target_audience: { primary: "String", demographics: "String", psychographics: "String", pain_points: ["String"], content_preferences: ["String"], buying_triggers: ["String"] }
  };

  const system = "You are an expert Data Collector Agent for a digital growth agency. Your job is to analyze companies and compile a comprehensive audit of their industry context, audience behaviors, and digital presence insights, specifically focusing on organic content algorithms.";
  const prompt = `Analyze the company "${companyName}". Platform Focus: "${platformFocus}". Social Links: "${socialLinks}".`;
  return await callLLM(system, prompt, schema);
}

// ─── STEP 2: Industry Analyst Agent ───
export async function runIndustryAnalyst({ companyName, platformFocus, socialLinks }) {
  const schema = {
    industry: "String",
    industry_size: "String (e.g., $1.48 Trillion)",
    growth_rate: "String (e.g., 11.8% CAGR)",
    sub_niche: "String",
    sub_niche_detail: "String detailing specific context",
    market_landscape: { total_addressable: "String", serviceable_addressable: "String", growth_driver: "String", key_shift: "String" },
    market_trends: [{ trend: "String", direction: "UP/DOWN", impact: "String" }],
    content_landscape: { saturation_level: "String", opportunity: "String", winning_format: "String", audience_expectation: "String" },
    ICP: { title: "String", role: "String", company_size: "String", age_range: "String", annual_budget: "String", goals: ["String"], frustrations: ["String"], decision_process: "String", where_they_hang_out: ["String"] }
  };

  const system = "You are an expert Industry Analyst AI. Your role is to provide deep market research, trends, sub-niche dynamics, and Ideal Customer Profile (ICP) data for any business.";
  const prompt = `Perform industry analysis for "${companyName}" operating primarily on "${platformFocus}". Links given: "${socialLinks}". Return realistic and data-driven estimates.`;
  return await callLLM(system, prompt, schema);
}

// ─── STEP 3: Competitor Intelligence Agent ───
export async function runCompetitorIntel({ companyName, socialLinks, platformFocus }) {
  const schema = {
    industry_context: "String",
    analysis_scope: "String",
    competitors: [{ name: "String", followers: "String", engagement_rate: "String", content_frequency: "String", top_platform: "String", monthly_reach: "String", content_quality: "String", strengths: ["String"], weaknesses: ["String"], threat_level: "Low/Medium/High", top_performing_content: "String" }],
    competitive_summary: { avg_engagement: "String", avg_followers: "String", content_gap: "String", engagement_leader: "String" },
    market_gap: { opportunity: "String", detail: "String", strategy: "String", estimated_impact: "String" },
    swot_for_entry: { strengths: ["String"], weaknesses: ["String"], opportunities: ["String"], threats: ["String"] }
  };

  const system = "You are an elite Competitive Intelligence Agent. Identify 5 top competitors (use plausible real or highly realistic simulated companies) and analyze their content strategy, strengths, weaknesses, and the exact market gaps where our client can win.";
  const prompt = `Analyze competitors for "${companyName}" targeting "${platformFocus}". Links: "${socialLinks}". Give detailed estimates.`;
  return await callLLM(system, prompt, schema);
}

// ─── STEP 4: Trend Analyst Agent ───
export async function runTrendAnalyst({ platformFocus, companyName, socialLinks }) {
  const schema = {
    industry_context: "String",
    trending_formats: [{ format: "String", growth: "String (e.g. +340% YoY)", relevance: "High/Critical/Medium", tip: "String" }],
    viral_hooks: [{ hook: "String", type: "String", effectiveness: "String (e.g. 9.2/10)" }],
    hashtag_trends: [{ tag: "String", volume: "String", trend: "Rising/Stable/Rising Fast" }]
  };

  const system = "You are a Trend Analysis Agent. Identify the most viral content formats, high-performing hooks, and hashtag trends specifically tailored for the target industry and platform.";
  const prompt = `Provide the latest organic growth trends for "${companyName}" heavily focused on "${platformFocus}".`;
  return await callLLM(system, prompt, schema);
}

// ─── STEP 5: Memory Retrieval (Local — no LLM needed) ───
export async function runMemoryRetrieval(memory) {
  if (memory) {
    return { has_history: true, top_strategies: memory.strategies || ['No past strategies found'], top_content_types: memory.content_types || ['No past content data'], best_posting_times: memory.posting_times || ['No timing data available'], failures_to_avoid: memory.failures || ['No failure data recorded'], sessions_count: 1, last_session: memory.savedAt || 'Unknown' };
  }
  return { has_history: false, top_strategies: ['First run — building strategy from scratch using industry best practices', 'Baseline: Industry average engagement rate is 2.1% — targeting 4%+ within 30 days'], top_content_types: ['Benchmark: Carousel (32%), Video (28%), Infographics (18%)'], best_posting_times: ['Industry optimal: 8-9 AM, 12-1 PM, 6-8 PM'], failures_to_avoid: ['Posting without strategy', 'Over-promotion', 'Ignoring comments'], sessions_count: 0, last_session: null };
}

// ─── STEP 6: Strategy Generator Agent ───
export async function runStrategyGenerator({ companyName, platformFocus, competitorData, trendData }) {
  const schema = {
    strategies: [
      {
        strategy_id: "STR-001", goal: "String", timeline: "30 Days", expected_growth: "String", expected_engagement: "String",
        content_plan: [{ week: "Week 1", focus: "String", actions: ["String", "String", "String"] }, { week: "Week 2", focus: "String", actions: ["String"] }, { week: "Week 3", focus: "String", actions: ["String"] }, { week: "Week 4", focus: "String", actions: ["String"] }],
        posting_frequency: "String", growth_tactics: ["String"], differentiation: "String", risk_level: "Low/Medium/High", resource_requirement: "String"
      }
    ]
  };

  const system = "You are a Master Strategy Generator. Using the provided trend and competitor data, formulate 3 distinct, highly actionable 30-day growth strategies. Do not just offer generic advice; provide clear week-by-week maneuvers.";
  const prompt = `Create 3 strategies for "${companyName}" on "${platformFocus}".\nCompetitor Summary: ${JSON.stringify(competitorData?.competitive_summary)}\nTrends: ${JSON.stringify(trendData?.trending_formats)}. NOTE: output EXACTLY 3 strategies in your list.`;
  return await callLLM(system, prompt, schema);
}

// ─── STEP 7: Scoring Agent ───
export async function runScoringAgent(strategies) {
  const schema = {
    strategy_scores: [{ strategy_id: "String", goal: "String", expected_growth: "String", timeline: "String", risk_level: "String", engagement: 0.0, virality: 0.0, conversion: 0.0, final_score: 0.0, recommendation: "String" }],
    top_strategies: ["String ID"],
    best_pick: { strategy_id: "String", goal: "String", expected_growth: "String", timeline: "String", risk_level: "String", engagement: 0.0, virality: 0.0, conversion: 0.0, final_score: 0.0, recommendation: "String" },
    analysis_note: "String"
  };

  const system = "You are a Strategy Scoring Agent. Grade each of the provided marketing strategies mathematically on a 1-10 scale across engagement, virality, and conversion potential, returning a final rounded score.";
  const prompt = `Score these strategies:\n${JSON.stringify(strategies)}`;
  return await callLLM(system, prompt, schema);
}

// ─── STEP 9: Creative Content Agent ───
export async function runCreativeAgent(approvedStrategies, companyName) {
  const schema = {
    content: [{
      strategy_id: "String", goal: "String", image_prompt: "String (Detailed prompt for an AI image generator like Midjourney)", image_style: { palette: ["String"], mood: "String", style: "String" }, image_url: null, caption: "String (Ready-to-post caption with emojis and spacing)", cta: "String", content_type: "String", estimated_reach: "String"
    }]
  };

  const system = "You are a Creative Director for social media. For each approved strategy submitted, write an incredibly high-converting caption, a strong Call to Action (CTA), and describe the precise aesthetic/imagery prompt needed.";
  const prompt = `Create content for ${companyName} based on these approved strategies:\n${JSON.stringify(approvedStrategies)}`;
  return await callLLM(system, prompt, schema);
}

// ─── STEP 10: Platform Adapter Agent ───
export async function runPlatformAdapter(creativeContent) {
  const schema = {
    linkedin: [{ strategy_id: "String", goal: "String", format: "String", tone: "String", caption: "String", cta: "String", optimal_length: "String", hashtags: ["String"], best_time: "String", pro_tips: ["String"] }],
    instagram: [{ strategy_id: "String", goal: "String", format: "String", tone: "String", caption: "String", cta: "String", image_prompt: "String", optimal_length: "String", hashtags: ["String"], best_time: "String", pro_tips: ["String"] }],
    twitter: [{ strategy_id: "String", goal: "String", format: "String", tone: "String", thread: ["String", "String"], optimal_length: "String", hashtags: ["String"], best_time: "String", pro_tips: ["String"] }]
  };

  const system = "You are a Platform Optimization Agent. Take the general creative assets and adapt them PERFECTLY for LinkedIn (professional framing), Instagram (visual-first), and Twitter (thread format).";
  const prompt = `Adapt these contents across Linkedin, Instagram, and Twitter:\n${JSON.stringify(creativeContent)}`;
  return await callLLM(system, prompt, schema);
}

// ─── STEP 12: Scheduler ───
export async function runScheduler({ platformFocus }) {
  const schema = {
    schedule: { best_times: ["String"], best_days: ["String"], worst_times: ["String"], posting_plan: "String", weekly_schedule: [{ day: "String", time: "String", content: "String", format: "String" }] }
  };
  const system = "You are an AI Scheduling Assistant. Provide the exact best posting times, worst times, and a 7-day weekly schedule for the requested platform.";
  const prompt = `Generate a robust scheduling plan for ${platformFocus}.`;
  return await callLLM(system, prompt, schema);
}

// ─── STEP 13-14: Tracker & Feedback (Local/deterministic — no LLM needed) ───
export async function runPerformanceTracker(metrics) {
  const { likes = 0, comments = 0, shares = 0, impressions = 1 } = metrics;
  const total = likes + comments + shares; const er = +((total / impressions) * 100).toFixed(2);
  const sr = +((shares / impressions) * 100).toFixed(3); const cr = +((comments / impressions) * 100).toFixed(3);
  let benchmark, tier, color;
  if (er > 6) { benchmark = 'Outstanding (Top 1%)'; tier = 'S'; color = '#10b981'; }
  else if (er > 4) { benchmark = 'Excellent (Top 5%)'; tier = 'A'; color = '#10b981'; }
  else if (er > 3) { benchmark = 'Great (Top 15%)'; tier = 'B+'; color = '#3b82f6'; }
  else if (er > 2) { benchmark = 'Good (Above Average)'; tier = 'B'; color = '#f59e0b'; }
  else if (er > 1) { benchmark = 'Average'; tier = 'C'; color = '#f59e0b'; }
  else { benchmark = 'Below Average'; tier = 'D'; color = '#ef4444'; }
  return { performance: { post_id: `POST-${Date.now().toString(36).toUpperCase()}`, likes, comments, shares, impressions, total_engagements: total, engagement_rate: er, share_rate: sr, comment_rate: cr, benchmark, tier, color, insights: [likes > comments * 3 ? '⚠️ High likes but low comments — add questions and prompts.' : '✅ Healthy like-to-comment ratio.', shares > total * 0.15 ? '🚀 Strong share rate — viral characteristics. Double down.' : '📌 Share rate could improve — add actionable takeaways.', er > 3 ? '🎯 Above-average engagement — algorithm will boost this.' : '📈 Test stronger hooks and CTAs.', impressions > 5000 ? '📊 Good reach and distribution.' : '📉 Low impressions — boost with $10-20 paid.'] } };
}

export async function runFeedbackLearning(scoringData, performanceData) {
  const pred = scoringData?.strategy_scores?.[0]?.final_score || 7;
  const actual = performanceData?.performance?.engagement_rate || 0;
  const tier = performanceData?.performance?.tier || 'C';
  return {
    prediction_vs_actual: { predicted_score: pred, actual_engagement: actual + '%', performance_tier: tier, accuracy: actual > pred ? 'Outperformed ✅' : 'Underperformed ⚠️', delta: actual > pred ? `+${(actual - pred).toFixed(1)}` : `${(actual - pred).toFixed(1)}` },
    insights: [{ insight: `Predicted: ${pred}/10 → Actual: ${actual}%`, type: 'metric', impact: actual > pred ? 'Positive' : 'Needs attention' }, { insight: actual > 3 ? 'Content resonated — hook strategy working' : 'Hook needs strengthening', type: 'content', impact: actual > 3 ? 'Positive' : 'Critical' }, { insight: 'Visual-first content outperforms text-only by 3.2x', type: 'format', impact: 'Positive' }],
    do_more_of: [{ action: 'Data-backed storytelling', priority: 'Critical' }, { action: 'Carousel posts', priority: 'High' }],
    avoid: [{ action: 'Generic quotes', risk: 'High' }, { action: 'Ignoring comments', risk: 'Critical' }],
    next_steps: ['Apply top "do more of" items', 'Increase video ratio']
  };
}
