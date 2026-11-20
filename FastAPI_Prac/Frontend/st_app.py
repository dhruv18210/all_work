import streamlit as st
import requests
import pandas as pd

API_URL = "http://127.0.0.1:8000"

st.set_page_config(
    page_title="MongoDB Dashboard",
    page_icon="📊",
    layout="wide"
)

st.title("📊 MongoDB Data Dashboard")

# Check backend connection
try:
    response = requests.get(f"{API_URL}/health", timeout=5)
    response.raise_for_status()
    st.success("FastAPI and MongoDB are connected!")

except requests.RequestException:  
    st.error("Backend is not available. Please start FastAPI first.")
    st.stop()

# Fetch collectio  n names from FastAPI
try:
    response = requests.get(f"{API_URL}/collections", timeout=10)
    response.raise_for_status()
    collections = response.json()["collections"]

except requests.RequestException:
    st.error("Unable to fetch MongoDB collections.")
    st.stop()

if not collections:
    st.info("No collections found in this database.")
    st.stop()

# Select collection
selected_collection = st.selectbox("Select MongoDB Collection", collections)
limit = st.number_input("Number of documents", min_value=1, max_value=2600, value=100)

if st.button("Load Data"):
    try:
        response = requests.get(f"{API_URL}/data/{selected_collection}", params={"limit": int(limit)}, timeout=30)
        response.raise_for_status()
        result = response.json()
        documents = result["data"]
        st.metric("Documents Retrieved", result["count"])

        if documents:
            df = pd.DataFrame(documents)
            st.dataframe(df, width=2000, height=750, hide_index=True)
        else:
            st.info("No documents found.")

    except requests.RequestException as exc:
        st.error(f"Failed to retrieve data: {exc}")
