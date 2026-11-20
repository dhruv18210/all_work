import streamlit as st
from langchain_ollama import ChatOllama
from dotenv import load_dotenv
import json
import os

st.set_page_config(page_title="AI Chatbot", page_icon="🤖", layout="wide", initial_sidebar_state="expanded")


st.markdown("""
<style>
/* APP BACKGROUND */
.stApp {
    background:
        radial-gradient(ellipse at 92% 12%, #f8dafa 0%, transparent 34%),
        radial-gradient(ellipse at 15% 88%, #fce0ee 0%, transparent 32%),
        radial-gradient(ellipse at 85% 85%, #dce7ff 0%, transparent 40%),
        #f8f9ff;
    color: #24345a;
}

/* MAIN CONTENT */
.block-container {
    max-width: 1100px;
    padding-top: 2rem;
    padding-bottom: 7rem;
}

/* HEADINGS */
h1 {
    color: #5145d8 !important;
    font-size: 2.3rem !important;
    font-weight: 750 !important;
    letter-spacing: -1px;
}

h2, h3 {
    color: #26345c !important;
}

/* SIDEBAR */
section[data-testid="stSidebar"],
section[data-testid="stSidebar"] > div {
    background: linear-gradient(
        155deg,
        #fafaff 0%,
        #f0efff 60%,
        #fceef9 100%
    ) !important;
}

section[data-testid="stSidebar"] {
    border-right: 1px solid #e3e5fa;
}

section[data-testid="stSidebar"] h1 {
    font-size: 1.5rem !important;
    color: #27376d !important;
}

/* SIDEBAR BUTTONS */
section[data-testid="stSidebar"] .stButton button {
    width: 100%;
    min-height: 48px;
    border-radius: 13px !important;
    background: rgba(255,255,255,0.78) !important;
    border: 1px solid #e5e6fa !important;
    color: #27376d !important;
    text-align: left;
    justify-content: flex-start;
    white-space: normal;
    overflow-wrap: anywhere;
    box-shadow: 0 4px 15px rgba(100,90,180,0.04);
    
    transition: all 0.2s ease;
}

section[data-testid="stSidebar"] .stButton button:hover {
    background: #e9e5ff !important;
    border-color: #a59cff !important;
    transform: translateY(-1px);
}

/* NEW CHAT BUTTON */
section[data-testid="stSidebar"] .stButton:last-of-type button {
    color: #27376d !important;
}

/* SIDEBAR SELECT */
section[data-testid="stSidebar"] [data-baseweb="select"] > div {
    background: #ffffff !important;
    border: 1px solid #e1e3fa !important;
    border-radius: 13px !important;
    min-height: 46px;
}

section[data-testid="stSidebar"] [data-baseweb="select"] * {
    color: #26345c !important;
}

/* CHAT MESSAGE */
[data-testid="stChatMessage"] {
    border: 1px solid #e7e9fb !important;
    border-radius: 20px !important;
    padding: 20px !important;
    margin-bottom: 18px;
    box-shadow: 0 8px 30px rgba(100,100,180,0.055);
}

/* USER CHAT */
[data-testid="stChatMessage"]:has(
    [data-testid="stChatMessageAvatarUser"]
) {
    background: linear-gradient(
        120deg,
        #e3e8ff,
        #f0e4ff
    ) !important;
    border-color: #dfe2ff !important;
    margin-left: 12%;
}

/* ASSISTANT CHAT */
[data-testid="stChatMessage"]:has(
    [data-testid="stChatMessageAvatarAssistant"]
) {
    background: rgba(255,255,255,0.86) !important;
    margin-right: 5%;
}

/* CHAT TEXT */
[data-testid="stChatMessage"] p,
[data-testid="stChatMessage"] li,
[data-testid="stChatMessage"] span,
[data-testid="stChatMessage"] strong {
    color: #354467 !important;
    line-height: 1.75;
}

[data-testid="stChatMessage"] code {
    color: #5845b8;
}

/* CHAT AVATARS */
[data-testid="stChatMessageAvatarUser"] {
    background: linear-gradient(
        135deg,#b18aff,#8758ed
    ) !important;
    border-radius: 13px !important;
}

[data-testid="stChatMessageAvatarAssistant"] {
    background: linear-gradient(
        135deg,#5fa8ff,#8654ff
    ) !important;
    border-radius: 13px !important;
}

/* BOTTOM INPUT AREA */
[data-testid="stBottom"],
[data-testid="stBottom"] > div {
    background: transparent !important;
}

[data-testid="stChatInput"] {
    background: rgba(255,255,255,0.96) !important;
    border: 1px solid #e2e2fb !important;
    border-radius: 24px !important;
    box-shadow: 0 10px 35px rgba(111,91,190,0.12);
    padding: 8px;
}

[data-testid="stChatInput"] textarea {
    background: transparent !important;
    color: #27376d !important;
}

[data-testid="stChatInput"] textarea::placeholder {
    color: #8590b4 !important;
}

[data-testid="stChatInput"] button[kind="primary"] {
    background: linear-gradient(
        135deg,#5798ff,#9744f5
    ) !important;
    color: white !important;
    border-radius: 13px !important;
}

/* GENERAL TEXT */
.stMarkdown, .stCaption, label {
    color: #43547d;
}

/* HEADER */
header[data-testid="stHeader"] {
    background: rgba(248,249,255,0.75) !important;
}

/* SCROLLBAR */
::-webkit-scrollbar {
    width: 7px;
}

::-webkit-scrollbar-thumb {
    background: #d4cef4;
    border-radius: 10px;
}

/* MOBILE */
@media (max-width: 768px) {
    .block-container {
        padding: 1.2rem 1rem 6rem;
    }

    h1 {
        font-size: 1.6rem !important;
    }

    [data-testid="stChatMessage"] {
        padding: 13px !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
    }
}
section[data-testid="stSidebar"] .st-key-new_chat button {
    background: linear-gradient(100deg,#609dff,#943cf3) !important;
    color: #ffffff !important;
    border: none !important;
    font-weight: 650 !important;
    justify-content: center !important;
    box-shadow: 0 6px 18px rgba(122,85,230,0.20);
}

section[data-testid="stSidebar"] .st-key-new_chat button:hover {
    background: linear-gradient(100deg,#518af0,#8032df) !important;
    color: white !important;
}
/* Align input with conversation */
[data-testid="stBottom"] > div {
    max-width: 950px !important;
    margin: 0 auto !important;
}

/* Add space below messages */
.block-container {
    padding-bottom: 150px !important;
}

/* Fix chat input position */
[data-testid="stChatInput"] {
    max-width: 950px !important;
    margin: 0 auto !important;
    border-radius: 22px !important;
}

/* Prevent background from covering messages */
[data-testid="stBottom"] {
    background: linear-gradient(
        to bottom,
        transparent,
        #f8f9ff 65%
    ) !important;
}

/* ===== PREMIUM PASTEL SIDEBAR ===== */

section[data-testid="stSidebar"] {
    background: linear-gradient(
        165deg,
        #fcfbff 0%,
        #f2f0ff 55%,
        #fceefa 100%
    ) !important;
    border-right: 1px solid #e7e4fa;
}

section[data-testid="stSidebar"] > div {
    background: transparent !important;
}

/* Sidebar spacing */
section[data-testid="stSidebar"] [data-testid="stVerticalBlock"] {
    gap: 0.65rem;
}

/* Sidebar title */
section[data-testid="stSidebar"] h3 {
    color: #42378d !important;
    font-size: 22px !important;
    font-weight: 750 !important;
    letter-spacing: -0.6px;
}

section[data-testid="stSidebar"] h4 {
    color: #6c7297 !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    letter-spacing: 0.3px;
}

/* Sidebar caption */
section[data-testid="stSidebar"] [data-testid="stCaptionContainer"] {
    color: #9296b5 !important;
    font-size: 12px;
}

/* Divider */
section[data-testid="stSidebar"] hr {
    border-color: #e5e3f5 !important;
    margin: 14px 0;
}

/* History buttons */
section[data-testid="stSidebar"] .stButton button {
    width: 100% !important;
    min-height: 44px !important;
    background: transparent !important;
    color: #465075 !important;
    border: 1px solid transparent !important;
    border-radius: 12px !important;
    text-align: left !important;
    justify-content: flex-start !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    padding: 10px 13px !important;
    box-shadow: none !important;
    transition: all 0.2s ease;
}

section[data-testid="stSidebar"] .stButton button:hover {
    background: #e9e6ff !important;
    border-color: #dcd6ff !important;
    transform: translateX(3px);
}

/* Selected conversation */
section[data-testid="stSidebar"] .stButton button[kind="primary"] {
    background: #e5e0ff !important;
    color: #6045d8 !important;
    border: 1px solid #d6ccff !important;
    font-weight: 650 !important;
}

/* New Chat gradient */
section[data-testid="stSidebar"] .st-key-new_chat button {
    background: linear-gradient(
        105deg,
        #6e9cff,
        #9563f5
    ) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 14px !important;
    min-height: 48px !important;
    justify-content: center !important;
    font-size: 14px !important;
    font-weight: 650 !important;
    box-shadow: 0 8px 20px rgba(131,100,235,0.20) !important;
}

section[data-testid="stSidebar"] .st-key-new_chat button:hover {
    background: linear-gradient(
        105deg,
        #5a8df5,
        #864fe9
    ) !important;
    color: white !important;
    transform: translateY(-2px);
}

/* Dropdown */
section[data-testid="stSidebar"] [data-baseweb="select"] > div {
    background: rgba(255,255,255,0.8) !important;
    border: 1px solid #e4e0f8 !important;
    border-radius: 12px !important;
    min-height: 44px;
}

/* Long conversation titles */
section[data-testid="stSidebar"] .stButton button p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ===== SOFT PASTEL ABSTRACT BACKGROUND ===== */

.stApp {
    background:
        radial-gradient(
            ellipse at 95% 5%,
            rgba(244, 191, 255, 0.55),
            transparent 36%
        ),
        radial-gradient(
            ellipse at 5% 90%,
            rgba(255, 200, 224, 0.65),
            transparent 42%
        ),
        radial-gradient(
            ellipse at 85% 85%,
            rgba(174, 201, 255, 0.55),
            transparent 45%
        ),
        radial-gradient(
            circle at 45% 55%,
            rgba(219, 235, 255, 0.55),
            transparent 35%
        ),
        #fafbff !important;

    background-attachment: fixed !important;
}

/* Abstract floating circles */
.stApp::before {
    content: "";
    position: fixed;
    width: 360px;
    height: 360px;
    right: -110px;
    top: -130px;
    border-radius: 50%;
    background: linear-gradient(
        135deg,
        rgba(231, 179, 255, 0.35),
        rgba(255, 222, 246, 0.20)
    );
    pointer-events: none;
    z-index: 0;
}

/* Bottom-left pastel shape */
.stApp::after {
    content: "";
    position: fixed;
    width: 520px;
    height: 320px;
    left: 10%;
    bottom: -190px;
    border-radius: 50%;
    background: linear-gradient(
        125deg,
        rgba(255, 196, 220, 0.35),
        rgba(178, 193, 255, 0.40),
        rgba(214, 175, 255, 0.35)
    );
    transform: rotate(-18deg);
    filter: blur(12px);
    pointer-events: none;
    z-index: 0;
}

/* Keep chatbot content above background shapes */
[data-testid="stMainBlockContainer"] {
    position: relative;
    z-index: 1;
}

/* Transparent main area */
[data-testid="stMain"] {
    background: transparent !important;
}

/* Transparent bottom input background */
[data-testid="stBottom"],
[data-testid="stBottom"] > div {
    background: transparent !important;
}

/* Sidebar pastel background */
section[data-testid="stSidebar"],
section[data-testid="stSidebar"] > div {
    background: linear-gradient(
        165deg,
        #fbfaff 0%,
        #f0f3ff 55%,
        #f8eaff 100%
    ) !important;
}
/* Align input with conversation */
[data-testid="stBottom"] > div {
    max-width: 950px !important;
    margin: 0 auto !important;
}

/* Add space below messages */
.block-container {
    padding-bottom: 150px !important;
}

/* Fix chat input position */
[data-testid="stChatInput"] {
    max-width: 950px !important;
    margin: 0 auto !important;
    border-radius: 22px !important;
}

/* Prevent background from covering messages */
[data-testid="stBottom"] {
    background: linear-gradient(
        to bottom,
        transparent,
        #f8f9ff 65%
    ) !important;
}
</style>
""", unsafe_allow_html=True)


st.markdown("""
<div style="display:flex; align-items:center; gap:18px; margin-bottom:30px;">
    <div style="width:66px; height:66px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#d5eaff,#d9b5ff); border-radius:22px; font-size:32px; box-shadow:0 10px 25px rgba(139,115,235,0.16);">🤖</div>
    <div>
        <h1 style="margin:0; font-size:35px; color:#5141cb; letter-spacing:-1px;">Llama 3.2 Chatbot</h1>
        <p style="margin:6px 0 0; color:#8793b5; font-size:15px;">Your intelligent AI companion ✨</p>
    </div>
</div>
""", unsafe_allow_html=True)


CHAT_FILE = "AI_Agent_Generating_Prac/chatbot/chat_history.json"
def load_chat_history():
    if os.path.exists(CHAT_FILE):
        with open(CHAT_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    return []

def save_chat_history():
    with open(CHAT_FILE, "w", encoding="utf-8") as file:
        json.dump(st.session_state.chat_history, file, indent=4, ensure_ascii=False)

load_dotenv()
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")

model = ChatOllama(model="llama3.2",temperature=0)

if "chat_history" not in st.session_state:
    st.session_state.chat_history = load_chat_history()

if "messages" not in st.session_state:
    st.session_state.messages = (
        st.session_state.chat_history[0].copy()
        if st.session_state.chat_history
        else []
    )

if "chat_id" not in st.session_state:
    st.session_state.chat_id = (
        0 if st.session_state.chat_history else None
    )

for message in st.session_state.messages:
    st.chat_message(message["role"]).write(message["content"])

user_input = st.chat_input("ASK YOUR QUESTION")

if user_input:
    st.chat_message("user").write(user_input)
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.spinner("⏳ Generating response..."):
        result = model.invoke(st.session_state.messages)
    st.chat_message("assistant").write(result.content)
    st.session_state.messages.append({"role": "assistant", "content": result.content})
    if st.session_state.chat_id is not None:
        st.session_state.chat_history.pop(st.session_state.chat_id)
    st.session_state.chat_history.insert(0, st.session_state.messages.copy())
    st.session_state.chat_id = 0
    save_chat_history()

with st.sidebar:
    st.markdown("### ✨ AI Workspace")
    st.caption("Your personal AI conversations")
    if st.button("✦  New Chat", key="new_chat", use_container_width=True):
        st.session_state.messages = []
        st.session_state.chat_id = None
        st.rerun()

    st.markdown("---")
    st.markdown("#### 🕘 Recent Conversations")

    history_button = st.selectbox("Chat history",["📜 Show History", "🚫 Hide History"], label_visibility="collapsed")
    if history_button == "📜 Show History":
        for i, chat in enumerate(st.session_state.chat_history):
            title = next((m["content"] for m in chat if m["role"] == "user"), f"Chat {i+1}")
            if st .button( "💬 " + title[:32], key=f"chat_{i}", use_container_width=True,type="primary" if st.session_state.chat_id == i else "secondary"):
                st.session_state.messages = chat.copy()
                st.session_state.chat_id = i
                st.rerun()


# if user_input:
#     st.chat_message("user").write(user_input)
#     st.session_state.messages.append({"role": "user", "content": user_input})
#     loading = st.empty()
#     with loading.spinner("⏳ Response is generating, please wait....."):
#         result = model.invoke(st.session_state.messages)
#     loading.empty()
#     st.chat_message("assistant").write(result.content)
#     st.session_state.messages.append({"role": "assistant", "content": result.content})

# with st.sidebar:
#     st.title("Recent Chat")
#     history_button = st.selectbox("Select option",["Show History", "Hide History"])
#     if history_button == "Show History":
#         st.write("📜 Chat History")
#         for i, chat in enumerate(st.session_state.chat_history):
#             with st.expander(f"Chat {i+1}"):
#                 for message in chat:
#                     st.chat_message(message["role"]).write(message["content"])
#     if st.button("➕ New Chat"):
#         if st.session_state.messages:
#             st.session_state.chat_history.append(st.session_state.messages.copy())
#         st.session_state.messages = []
#         st.rerun()
