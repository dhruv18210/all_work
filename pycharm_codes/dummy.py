import streamlit as st
import pandas as pd
import yfinance as yf
import plotly.graph_objects as go
import google.generativeai as genai
from datetime import date, timedelta
import re

# --- Page Configuration ---
st.set_page_config(
    page_title="AI Stock Analysis Dashboard",
    page_icon="💹",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- App Title and Description ---
st.title("💹 AI Stock Analysis Dashboard")
st.markdown("An advanced tool combining technical indicators with AI-powered forecasting from Google Gemini.")

# --- Gemini API Configuration ---
try:
    genai.configure(api_key=st.secrets["GEMINI_API_KEY"])

    # --- CODE FIX ---
    # The model name 'gemini-pro' is outdated.
    # Using a current, recommended model like 'gemini-1.5-flash-latest'.
    model = genai.GenerativeModel('gemini-2.5-flash')  # Original line
    # --- END OF FIX ---

except (KeyError, AttributeError):
    st.error("🚨 Gemini API Key not found! Please add it to your Streamlit secrets (.streamlit/secrets.toml).")
    st.stop()


# --- Helper Functions ---
@st.cache_data(ttl=3600)
def get_stock_data(ticker):
    """Fetches the last 2 years of stock data and calculates technical indicators."""
    try:
        end_date = date.today()
        start_date = end_date - timedelta(days=730)
        data = yf.download(ticker, start=start_date, end=end_date, progress=False)
        if data.empty:
            return None
        data['100_MA'] = data['Close'].rolling(window=100).mean()
        data['200_MA'] = data['Close'].rolling(window=200).mean()
        return data
    except Exception as e:
        st.error(f"Error fetching data for {ticker}: {e}")
        return None


def get_gemini_forecast(ticker, stock_data_str, forecast_days):
    """Generates a forecast using the Gemini AI model with a strict prompt."""
    prompt = f"""
    You are an expert financial analyst AI. Your task is to analyze historical stock data and provide a forecast.
    Analyze the following historical data for the ticker: *{ticker}*.

    *Historical Data (Recent 90 Days Close Prices):*

    {stock_data_str}

    *Your response MUST strictly follow this format, with no extra conversation:*

    1.  *Trend Analysis:* A concise analysis of trends, volatility, and key patterns.
    2.  *Forecast Table:* A Markdown table for the next *{forecast_days}* days with columns 'Date' and 'Forecasted Close Price'.
    3.  *Reasoning & Confidence:* A brief justification for your forecast and a confidence level (High, Medium, or Low).

    *CRITICAL:* The Markdown table is a mandatory part of the output. Do not respond without it.
    """
    try:
        response = model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.2))
        return response.text
    except Exception as e:
        # Pass the specific API error back to the user for better debugging
        return f"An error occurred with the Gemini API: {e}"


def parse_gemini_response(response_text):
    """Parses the Gemini response to extract the analysis and the forecast table."""
    try:
        table_match = re.search(r'\| Date\s*\|.?\n((?:\|.\|.*\n)+)', response_text, re.DOTALL)
        if not table_match:
            return response_text, pd.DataFrame()

        table_str = table_match.group(0)
        lines = table_str.strip().split('\n')
        header = [h.strip() for h in lines[0].strip('|').split('|')]
        data_rows = [list(map(str.strip, line.strip('|').split('|'))) for line in lines[2:]]

        df = pd.DataFrame(data_rows, columns=header)
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        price_col = df.columns[1]
        df[price_col] = df[price_col].str.replace(r'[^\d.]', '', regex=True)
        df[price_col] = pd.to_numeric(df[price_col], errors='coerce')
        df.dropna(inplace=True)

        analysis_text = response_text[:table_match.start()].strip()
        return analysis_text, df
    except Exception:
        return response_text, pd.DataFrame()


# --- Sidebar for User Inputs ---
with st.sidebar:
    st.header("⚙ Controls")
    ticker = st.text_input("Enter Stock Ticker", value="TSLA", help="e.g., AAPL, GOOGL, TSLA").upper()
    forecast_days = st.slider("Days to Forecast", 7, 90, 30)
    submit_button = st.button("🚀 Analyze and Forecast", type="primary")

# --- Main Application Body ---
if submit_button:
    if not ticker:
        st.warning("Please enter a stock ticker.")
    else:
        data_load_state = st.spinner(f"Loading data for {ticker}...")
        with data_load_state:
            hist_data = get_stock_data(ticker)

        if hist_data is None or hist_data.empty:
            st.error(f"Could not fetch data for '{ticker}'. Please check the ticker symbol.")
        else:
            st.success(f"Successfully loaded data for {ticker}")

            st.subheader("Key Financial Metrics")
            last_52_weeks = hist_data.tail(252)
            high_52_week = last_52_weeks['High'].max()
            low_52_week = last_52_weeks['Low'].min()
            last_close = hist_data['Close'].iloc[-1]

            col1, col2, col3 = st.columns(3)
            col1.metric("Last Close Price", f"${float(last_close):,.2f}")
            col2.metric("52-Week High", f"${float(high_52_week):,.2f}")
            col3.metric("52-Week Low", f"${float(low_52_week):,.2f}")

            st.subheader("Historical Price Chart")
            fig = go.Figure()
            fig.add_trace(go.Candlestick(x=hist_data.index,
                                         open=hist_data['Open'], high=hist_data['High'],
                                         low=hist_data['Low'], close=hist_data['Close'], name='Price'))
            fig.add_trace(go.Scatter(x=hist_data.index, y=hist_data['100_MA'], name='100-Day MA',
                                     line=dict(color='yellow', width=1.5)))
            fig.add_trace(go.Scatter(x=hist_data.index, y=hist_data['200_MA'], name='200-Day MA',
                                     line=dict(color='orange', width=1.5)))
            fig.update_layout(title=f'{ticker} Price with 100 & 200-Day Moving Averages',
                              xaxis_rangeslider_visible=False, template='plotly_dark')
            st.plotly_chart(fig, use_container_width=True)

            st.subheader("🤖 AI-Powered Forecast")
            ai_spinner_state = st.spinner("Gemini AI is analyzing the trends...")
            with ai_spinner_state:
                recent_data_str = hist_data[['Close']].tail(90).to_string()
                gemini_response = get_gemini_forecast(ticker, recent_data_str, forecast_days)
                analysis, forecast_df = parse_gemini_response(gemini_response)

            if forecast_df.empty:
                st.warning("The AI could not generate a forecast table. Displaying raw output:")
                st.markdown(f"> {analysis}")
            else:
                col_ai1, col_ai2 = st.columns([1, 1])
                with col_ai1:
                    st.markdown("#### 🔍 AI Analysis")
                    st.info(analysis)
                    st.markdown("#### 📋 Forecasted Data")
                    st.dataframe(forecast_df, use_container_width=True, hide_index=True)

                with col_ai2:
                    st.markdown("#### 📈 Forecast Chart")
                    fig_forecast = go.Figure()
                    hist_tail = hist_data.tail(90)
                    fig_forecast.add_trace(go.Scatter(x=hist_tail.index, y=hist_tail['Close'], name='Historical Close'))
                    price_col_name = forecast_df.columns[1]
                    fig_forecast.add_trace(
                        go.Scatter(x=forecast_df['Date'], y=forecast_df[price_col_name], name='AI Forecast',
                                   line=dict(color='cyan', dash='dash')))
                    fig_forecast.update_layout(title=f'Forecast vs. Recent History', template='plotly_dark')
                    st.plotly_chart(fig_forecast, use_container_width=True)

# --- Disclaimer ---
st.markdown("---")
st.warning(
    "Disclaimer: This tool is for informational purposes only and does not constitute financial advice. All investments involve risk.",
    icon="⚠")