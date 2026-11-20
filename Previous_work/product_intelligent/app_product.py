import os
from textwrap import dedent
import streamlit as st
from agno.agent import Agent
from agno.models.google import Gemini
from agno.team import Team
from agno.tools.firecrawl import FirecrawlTools

# ---------------- Page Config ----------------
st.set_page_config(
    page_title="AI Product Intelligence Agent",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------------- Load API Keys ----------------
try:
    default_gemini = st.secrets.get("GEMINI_API_KEY", "")
    default_firecrawl = st.secrets.get("FIRECRAWL_API_KEY", "")
except Exception:
    default_gemini = ""
    default_firecrawl = ""

if "gemini_key" not in st.session_state:
    st.session_state.gemini_key = default_gemini
if "firecrawl_key" not in st.session_state:
    st.session_state.firecrawl_key = default_firecrawl
if "selected_model" not in st.session_state:
    st.session_state.selected_model = "gemini-2.5-flash"

# ---------------- Sidebar ----------------
st.sidebar.header("🔑 API Configuration")

gemini_key = st.sidebar.text_input(
    "Gemini API Key",
    type="password",
    value=st.session_state.gemini_key
)

firecrawl_key = st.sidebar.text_input(
    "Firecrawl API Key",
    type="password",
    value=st.session_state.firecrawl_key
)

st.session_state.selected_model = st.sidebar.selectbox(
    "Choose Model",
    ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash"]
)

if st.sidebar.button("💾 Save API Keys", type="primary"):
    st.session_state.gemini_key = gemini_key
    st.session_state.firecrawl_key = firecrawl_key
    st.rerun()

api_keys_valid = bool(st.session_state.gemini_key and st.session_state.firecrawl_key)

# ---------------- Initialize Multi-Agent Team ----------------
def initialize_team():
    if not api_keys_valid:
        return None, False

    os.environ["GEMINI_API_KEY"] = st.session_state.gemini_key
    os.environ["FIRECRAWL_API_KEY"] = st.session_state.firecrawl_key

    model = Gemini(
        id=st.session_state.selected_model,
        api_key=st.session_state.gemini_key,
    )

    firecrawl = FirecrawlTools(api_key=st.session_state.firecrawl_key)

    # -------- AGENT 1: Product Understanding --------
    product_agent = Agent(
        name="Product Understanding Agent",
        instructions="Analyze the product purpose, key features, and value proposition. Do not cover competitors.",
        model=model,
        markdown=True
    )

    # -------- AGENT 2: Competitive Intelligence --------
    competitor_agent = Agent(
        name="Competitive Intelligence Agent",
        instructions="Identify competitors, compare features, pricing, target audience, positioning, and market gaps.",
        model=model,
        tools=[firecrawl],
        markdown=True
    )

    # -------- AGENT 3: Target Market --------
    target_market_agent = Agent(
        name="Target Market Analyst",
        instructions="Define ideal customer segments, user personas, and pain points solved.",
        model=model,
        markdown=True
    )

    # -------- AGENT 4: SWOT --------
    swot_agent = Agent(
        name="SWOT Analyst",
        instructions="Perform a SWOT analysis: strengths, weaknesses, opportunities, threats.",
        model=model,
        markdown=True
    )

    # -------- AGENT 5: Launch Strategy --------
    launch_agent = Agent(
        name="Launch Strategy Agent",
        instructions="Design a go-to-market strategy, marketing channels, pricing, launch-day plan.",
        model=model,
        markdown=True
    )

    # -------- AGENT 6: Growth & Scaling --------
    growth_agent = Agent(
        name="Growth & Scaling Agent",
        instructions="Suggest short-term growth tactics and long-term scaling opportunities.",
        model=model,
        markdown=True
    )

    team = Team(
        name="Product Intelligence Multi-Agent System",
        model=model,
        members=[
            product_agent,
            competitor_agent,
            target_market_agent,
            swot_agent,
            launch_agent,
            growth_agent
        ],
        markdown=True
    )

    return team, True

product_intelligence_team, team_ready = initialize_team()

# ---------------- Helper ----------------
def get_content(resp):
    return resp.content if hasattr(resp, "content") else str(resp)

def run_agent(agent_name, prompt):
    for agent in product_intelligence_team.members:
        if agent.name == agent_name:
            return get_content(agent.run(prompt))
    return ""

def run_full_product_analysis(product_name, product_description, company_name):
    context = f"""
Product Name: {product_name}
Product Description: {product_description}
Company Name: {company_name}
"""
    results = {}
    results["overview"] = run_agent("Product Understanding Agent", context + "\nExplain the product clearly.")
    results["competition"] = run_agent("Competitive Intelligence Agent", context + "\nIdentify competitors and market gaps.")
    results["target_market"] = run_agent("Target Market Analyst", context + "\nDefine ICPs and pain points.")
    results["swot"] = run_agent("SWOT Analyst", context + "\nPerform SWOT analysis.")
    results["launch"] = run_agent("Launch Strategy Agent", context + "\nCreate a detailed launch plan.")
    results["growth"] = run_agent("Growth & Scaling Agent", context + "\nSuggest growth and scaling strategies.")
    return results

# ---------------- Main UI ----------------
st.title("🚀 AI Product Intelligence Agent")
st.caption("Product Strategy • Market Research • Launch Planning")
st.divider()

# ---------------- Inputs ----------------
st.subheader("🏢 Company & Product Details")
company_name = st.text_input("Company Name", placeholder="e.g., OpenAI")
product_name = st.text_input("Product Name", placeholder="e.g., AI Resume Analyzer")
product_description = st.text_area(
    "Product Description",
    placeholder="Describe the product, features, and value proposition",
    height=120
)

# ---------------- Tabs ----------------
tabs = st.tabs([
    "🆕 New Product Analysis",
    "🔍 Competitor Analysis",
    "💬 Market Sentiment",
    "📈 Launch Metrics"
])

# ---------------- New Product Analysis ----------------
with tabs[0]:
    st.markdown("### 🆕 New Product Market Entry Analysis")
    if st.button("🚀 Run Full Product Analysis", type="primary", disabled=not team_ready):
        if not (company_name and product_name and product_description):
            st.warning("Please fill all inputs.")
        else:
            with st.spinner("Multi-agent system analyzing..."):
                # Run full product analysis using multi-agent system
                results = run_full_product_analysis(product_name, product_description, company_name)

            # Tab 0: Full overview (all sections)
            st.markdown("## 🧩 Product Overview")
            st.markdown(results["overview"])

# ---------------- Tab 1: Competitor Analysis Only ----------------
with tabs[1]:
    if "results" in locals():
        st.markdown("### 🏁 Competitor Analysis")
        st.markdown(results["competition"])
    else:
        st.info("Run the full product analysis")

# ---------------- Tab 2: Market & Target Analysis ----------------
with tabs[2]:
    if "results" in locals():
        st.markdown("### 🎯 Target Market")
        st.markdown(results["target_market"])
        st.markdown("### ⚠️ SWOT Analysis")
        st.markdown(results["swot"])
    else:
        st.info("Run the full product analysis")

# ---------------- Tab 3: Launch & Growth ----------------
with tabs[3]:
    if "results" in locals():
        st.markdown("### 🚀 Product Launch Strategy")
        st.markdown(results["launch"])
        st.markdown("### 📈 Growth & Scaling")
        st.markdown(results["growth"])
    else:
        st.info("Run the full product analysis")

# ---------------- Sidebar Status ----------------
st.sidebar.divider()
st.sidebar.markdown("### 🤖 System Status")
if team_ready:
    st.sidebar.success("Product Intelligence Multi-Agent System Ready")
else:
    st.sidebar.error("Missing API keys")
st.sidebar.divider()
st.sidebar.markdown("### 📚 Resources")
st.sidebar.markdown("- https://ai.google.dev/gemini-api/docs")
st.sidebar.markdown("- https://firecrawl.dev")
st.sidebar.markdown("- https://github.com/agno-framework")