"""
Title: Stock Price Prediction using Hybrid Time Series and Deep Learning Models
"""

# ------------------ IMPORT LIBRARIES ------------------
import streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from prophet import Prophet
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import plotly.graph_objs as go
from datetime import datetime
import google.generativeai as genai
from google.generativeai.types import GenerationConfig
import re
import json

# ------------------ SETUP ------------------
st.set_page_config(page_title="AI Stock Agent - Pro Predictor", layout="wide", initial_sidebar_state="expanded")

# --- Custom CSS for Premium Look ---
st.markdown("""
<style>
    .main {
        background-color: #0e1117;
        color: #e0e0e0;
    }
    .stMetric {
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .chat-container {
        border: 1px solid #30363d;
        border-radius: 10px;
        padding: 20px;
        background: #0d1117;
    }
    .stButton>button {
        width: 100%;
        border-radius: 5px;
        background-color: #1f6feb;
        color: white;
    }
    .stTextInput>div>div>input {
        background-color: #0d1117;
        color: white;
    }
    [data-testid="stSidebar"] {
        background-image: linear-gradient(#0d1117, #161b22);
    }
</style>
""", unsafe_allow_html=True)

# --- Initialize Session State ---
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "👋 I am your Pro-Level Stock Analyst. Ready to analyze the markets for you."}
    ]
if "alerts" not in st.session_state:
    st.session_state.alerts = []
if "forecast_results" not in st.session_state:
    st.session_state.forecast_results = {}
if "portfolio" not in st.session_state:
    st.session_state.portfolio = {}

if st.sidebar.button("🔄 Refresh Data & Check Alerts"):
    st.rerun()

st.markdown('<h1 class="main-header">🛡️ AI Stock Trading Agent</h1>', unsafe_allow_html=True)
st.sidebar.header("🎛️ Forecast Hub")

# --- Gemini API Configuration (UPDATED) ---
# Check secrets first, then session state
gemini_api_key = st.secrets.get("GEMINI_API_KEY") or st.session_state.get("api_key")

if not gemini_api_key:
    with st.sidebar.expander("🔑 API Configuration", expanded=True):
        st.warning("Gemini API Key not found.")
        input_key = st.text_input("Enter Gemini API Key", type="password", key="api_key_input")
        if input_key:
            st.session_state.api_key = input_key
            st.rerun()

if gemini_api_key:
    try:
        # Strip whitespace which often causes 400 errors
        clean_key = gemini_api_key.strip()
        genai.configure(api_key=clean_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        st.sidebar.error(f"🚨 API Setup Error: {e}")
        model = None
else:
    st.info("💡 Please provide a Gemini API Key in the sidebar to enable AI features.")
    class DummyModel:
        def generate_content(self, *args, **kwargs):
            return type('obj', (object,), {'text': '⚠️ API Key Required for AI Analysis.'})
    model = DummyModel()


# ------------------ GEMINI FUNCTIONS ------------------
def get_gemini_forecast(ticker, stock_data_str, forecast_days):
    prompt = f"""
    You are an expert financial analyst AI. Analyze historical stock data for ticker: *{ticker}*.
    Historical Data (Recent 90 Days Close Prices):
    {stock_data_str}

    Provide a forecast for the next {forecast_days} business days.

    Your response MUST strictly follow this format:

    1. Forecast Table:
    | Date | Forecasted Close Price |
    |------|----------------------|
    | YYYY-MM-DD | 123.45 |
    | ...        | ...    |

    2. Reasoning & Confidence:
    - Reasoning: <Brief analysis of trends, moving averages, expected movement>
    - Confidence: <High / Medium / Low>

    Only return table + reasoning/confidence, no extra commentary.
    """
    try:
        response = model.generate_content(
            prompt,
            generation_config=GenerationConfig(temperature=0.2)
        )
        if hasattr(response, "text"):
            return response.text.strip()
        elif hasattr(response, "candidates") and response.candidates:
            return response.candidates[0].content.parts[0].text.strip()
        else:
            return ""
    except Exception as e:
        return f"⚠ Gemini API Error: {e}"

def parse_gemini_response(response_text):
    """Extract forecast table + reasoning + confidence from Gemini output"""
    try:
        # Table
        table_match = re.search(r'\| Date \| Forecasted Close Price \|[\s\S]*?\n\|.*\|', response_text)
        if table_match:
            table_str = table_match.group(0)
            lines = table_str.strip().split('\n')
            header = [h.strip() for h in lines[0].strip('|').split('|')]
            rows = [list(map(str.strip, line.strip('|').split('|'))) for line in lines[2:]]
            df_forecast = pd.DataFrame(rows, columns=header)
            df_forecast['Date'] = pd.to_datetime(df_forecast['Date'], errors='coerce')
            df_forecast['Forecasted Close Price'] = pd.to_numeric(
                df_forecast['Forecasted Close Price'].str.replace(r'[^\d.]','',regex=True),
                errors='coerce'
            )
            df_forecast.dropna(inplace=True)
        else:
            df_forecast = pd.DataFrame()

        # Reasoning + Confidence
        reasoning_match = re.search(r'Reasoning:\s*(.*?)\n- Confidence:\s*(High|Medium|Low)', response_text, re.DOTALL | re.IGNORECASE)
        if reasoning_match:
            reasoning = reasoning_match.group(1).strip()
            confidence = reasoning_match.group(2).capitalize()
        else:
            reasoning = response_text.strip()
            confidence = "Medium"

        return reasoning, confidence, df_forecast
    except Exception:
        return response_text, "Medium", pd.DataFrame()

# ------------------ USER INPUT ------------------
st.sidebar.header("Stock Selection")

st.sidebar.markdown("""
💡 *Tip for Indian Stocks:*  
Use the NSE ticker format with .NS at the end.  
For example:  
- 'RELIANCE.NS' -> 'Reliance Industries'  
- 'TCS.NS' -> 'Tata Consultancy Services'  
- 'HDFCBANK.NS' -> 'HDFC Bank'  
- 'INFY.NS' -> 'Infosys'  
- 'ICICIBANK.NS' -> 'ICICI Bank'  
- 'SBIN.NS' -> 'State Bank of India'  
- 'BHARTIARTL.NS' -> 'Bharti Airtel'  
- 'ADANIENT.NS' -> 'Adani Enterprises'  
- 'TATAMOTORS.NS' -> 'Tata Motors'  
- 'WIPRO.NS' -> 'Wipro'  
""")

ticker = st.sidebar.text_input(
    "Enter Stock Ticker Symbol",
    value="SWIGGY.NS",
    help="Example: SWIGGY.NS (India), RELIANCE.NS (India), INFY.NS (India)"
).upper()

start_date = "2010-01-01"
end_date = datetime.today().strftime('%Y-%m-%d')

st.sidebar.header("Forecast Settings")
time_unit = st.sidebar.selectbox("Forecast Timeframe", ["Days", "Weeks", "Months", "Years"])
unit_count = st.sidebar.selectbox("Forecast Length", list(range(1, 61)), index=11)
forecast_days = {"Days":1, "Weeks":5, "Months":21, "Years":252}[time_unit] * unit_count

# ------------------ TECHNICAL ANALYSIS HELPERS ------------------
def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).ewm(alpha=1/period, adjust=False).mean()
    loss = (-delta.where(delta < 0, 0)).ewm(alpha=1/period, adjust=False).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(series, fast=12, slow=26, signal=9):
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram

# ------------------ LOAD DATA ------------------
@st.cache_data
def load_data(ticker, end_date):
    try:
        df = yf.download(ticker, start=start_date, end=end_date)
        if df.empty: return pd.DataFrame()
        df.reset_index(inplace=True)
        return df
    except Exception as e:
        st.error(f"Error fetching data: {e}")
        return pd.DataFrame()

df_full = load_data(ticker, end_date)

if df_full.empty:
    st.error("❌ No data was loaded. Check ticker symbol or try later.")
    st.stop()

# Prepare model data
df_model = df_full[['Date', 'Close']].copy()
df_model.columns = ['ds', 'y']

# Inject technical indicators
df_full['RSI'] = calculate_rsi(df_full['Close'])
df_full['MACD'], df_full['MACD_Signal'], df_full['MACD_Hist'] = calculate_macd(df_full['Close'])
df_full['SMA_100'] = df_full['Close'].rolling(window=100).mean()
df_full['SMA_200'] = df_full['Close'].rolling(window=200).mean()
df_full['EMA'] = df_full['Close'].ewm(span=50, adjust=False).mean()

# Update df_model to include these for visualization
df_model['SMA_100'] = df_full['SMA_100']
df_model['SMA_200'] = df_full['SMA_200']
df_model['EMA'] = df_full['EMA']

st.success(f"✅ Latest price for {ticker}: {df_model['y'].iloc[-1]:.2f} (Updated: {df_model['ds'].max().date()})")

# ------------------ MODEL FUNCTIONS ------------------
def arima_model(data, forecast_days):
    ts = data.set_index('ds')['y']
    model = ARIMA(ts, order=(5,1,0))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=forecast_days)
    dates = pd.date_range(data['ds'].iloc[-1]+pd.Timedelta(days=1), periods=forecast_days, freq='B')
    return pd.DataFrame({'ds':dates, 'y':forecast})

def sarima_model(data, forecast_days):
    ts = data.set_index('ds')['y']
    model = SARIMAX(ts, order=(1,1,1), seasonal_order=(1,1,0,12))
    model_fit = model.fit(disp=False)
    forecast = model_fit.forecast(steps=forecast_days)
    dates = pd.date_range(data['ds'].iloc[-1]+pd.Timedelta(days=1), periods=forecast_days, freq='B')
    return pd.DataFrame({'ds':dates, 'y':forecast})

def prophet_model(data, forecast_days):
    m = Prophet()
    m.fit(data)
    future = m.make_future_dataframe(periods=forecast_days)
    forecast = m.predict(future)[['ds','yhat']].rename(columns={'yhat':'y'})
    return forecast.tail(forecast_days)

def lstm_model(data, forecast_days):
    df_lstm = data.copy().set_index('ds')
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df_lstm[['y']])

    seq_len = 60
    if len(scaled) <= seq_len:
        raise ValueError(f"Not enough data for LSTM (need > {seq_len} records).")

    X, y = [], []
    for i in range(seq_len, len(scaled)):
        X.append(scaled[i-seq_len:i, 0])
        y.append(scaled[i, 0])
    X, y = np.array(X), np.array(y)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    model = Sequential([
        LSTM(64, activation='tanh', return_sequences=True, input_shape=(seq_len,1)),
        Dropout(0.1),
        LSTM(64, activation='tanh'),
        Dropout(0.1),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mean_squared_error')
    model.fit(X, y, epochs=50, batch_size=32, verbose=0)

    input_seq = scaled[-seq_len:].reshape((1, seq_len,1))
    forecast_scaled = []
    for _ in range(forecast_days):
        pred = model.predict(input_seq, verbose=0)[0,0]
        forecast_scaled.append(pred)
        input_seq = np.append(input_seq[0,1:,0], pred).reshape((1, seq_len,1))

    forecast = scaler.inverse_transform(np.array(forecast_scaled).reshape(-1,1)).flatten()
    dates = pd.date_range(data['ds'].iloc[-1]+pd.Timedelta(days=1), periods=forecast_days, freq='B')
    return pd.DataFrame({'ds':dates, 'y':forecast})

# ------------------ METRICS + VISUALIZATION ------------------
def align_forecast(forecast, actual):
    forecast = forecast.set_index('ds').reindex(actual['ds'], method='nearest').reset_index()
    forecast.columns = ['ds','y_pred']
    return forecast

def compute_metrics(actual, pred):
    actual, pred = np.array(actual), np.array(pred)
    epsilon = 1e-5
    mae = mean_absolute_error(actual, pred)
    rmse = np.sqrt(mean_squared_error(actual, pred))
    mape = np.mean(np.abs((actual - pred)/np.maximum(actual, epsilon))) * 100
    r2 = r2_score(actual, pred)
    return mae, rmse, mape, r2

def evaluate_model(model_func, data, forecast_days):
    if len(data) < forecast_days+60:
        return None, None, None, None
    train, test = data[:-forecast_days], data[-forecast_days:]
    try:
        forecast = model_func(train.copy(), forecast_days)
        forecast_aligned = align_forecast(forecast, test)
        return compute_metrics(test['y'], forecast_aligned['y_pred'])
    except Exception as e:
        st.warning(f"Could not evaluate model: {e}")
        return None, None, None, None

def add_timeframe_dropdown(fig):
    fig.update_layout(
        xaxis=dict(
            rangeselector=dict(
                buttons=[
                    dict(count=7, label="7D", step="day", stepmode="backward"),
                    dict(count=1, label="1M", step="month", stepmode="backward"),
                    dict(count=3, label="3M", step="month", stepmode="backward"),
                    dict(count=6, label="6M", step="month", stepmode="backward"),
                    dict(count=1, label="1Y", step="year", stepmode="backward"),
                    dict(step="all", label="All")
                ]
            ),
            rangeslider=dict(visible=True),
            type="date"
        )
    )
    return fig

# ------------------ DASHBOARD METRICS ------------------
m_col1, m_col2, m_col3, m_col4 = st.columns(4)
latest_price = df_model['y'].iloc[-1]
prev_price = df_model['y'].iloc[-2]
price_diff = latest_price - prev_price
price_pct = (price_diff / prev_price) * 100

# Handle potential MultiIndex or Series output from mean()
avg_vol = df_full['Volume'].tail(30).mean()
if isinstance(avg_vol, pd.Series):
    avg_vol = avg_vol.iloc[0]

m_col1.metric("Live Price", f"{latest_price:.2f}", f"{price_pct:.2f}%")
m_col2.metric("RSI (14)", f"{df_full['RSI'].iloc[-1]:.1f}", "Neutral" if 30 < df_full['RSI'].iloc[-1] < 70 else ("Overbought" if df_full['RSI'].iloc[-1] > 70 else "Oversold"))
m_col3.metric("SMA 200", f"{df_full['SMA_200'].iloc[-1]:.2f}", "Bullish" if latest_price > df_full['SMA_200'].iloc[-1] else "Bearish")
m_col4.metric("Avg Vol", f"{float(avg_vol):.0f}")

# ------------------ HISTORICAL DATA ------------------
st.subheader(f"📊 Historical Closing Price for {ticker}")
fig_close = go.Figure()
fig_close.add_trace(go.Scatter(x=df_model['ds'], y=df_model['y'], mode='lines', name='Closing Price', line=dict(color='lightblue')))
st.plotly_chart(fig_close, use_container_width=True)

# ------------------ FORECASTS ------------------
st.subheader(f"🔮 Forecasts for {unit_count} {time_unit}")
with st.spinner("Running all models..."):
    models = {"ARIMA":arima_model, "SARIMA":sarima_model, "Prophet":prophet_model, "LSTM":lstm_model}
    scores = []
    forecasts_all = []

    for name, func in models.items():
        try:
            forecast_df = func(df_model.copy(), forecast_days)
            forecasts_all.append(forecast_df)

            fig = go.Figure()
            fig.add_trace(go.Candlestick(x=df_model['ds'], open=df_model['y'], high=df_model['y'], low=df_model['y'], close=df_model['y'], name='Historical'))
            fig.add_trace(go.Candlestick(x=forecast_df['ds'], open=forecast_df['y'], high=forecast_df['y'], low=forecast_df['y'], close=forecast_df['y'], name='Forecast', increasing_line_color='red', decreasing_line_color='red'))
            fig.add_trace(go.Scatter(x=df_model['ds'], y=df_model['SMA_100'], mode='lines', name='100-day SMA', line=dict(color='orange')))
            fig.add_trace(go.Scatter(x=df_model['ds'], y=df_model['SMA_200'], mode='lines', name='200-day SMA', line=dict(color='green')))
            fig.add_trace(go.Scatter(x=df_model['ds'], y=df_model['EMA'], mode='lines', name='EMA', line=dict(color='purple')))
            fig = add_timeframe_dropdown(fig)
            fig.update_layout(title=f"{name} Forecast with Moving Averages", hovermode="x unified")
            st.plotly_chart(fig, use_container_width=True)

            mae, rmse, mape, r2 = evaluate_model(func, df_model.copy(), min(forecast_days,60))
            if all(v is not None for v in [mae, rmse, mape, r2]):
                scores.append({'Model':name,'MAE':mae,'RMSE':rmse,'MAPE (%)':mape,'R²':r2})
        except Exception as e:
            st.error(f"❌ Error running {name}: {e}")

# ------------------ PERFORMANCE TABLE ------------------
if scores:
    scores_df = pd.DataFrame(scores)
    scores_df['Forecast Accuracy (%)'] = 100 - scores_df['MAPE (%)']
    for metric in ['MAE','RMSE','MAPE (%)']:
        scores_df[f'{metric}_rank'] = scores_df[metric].rank()
    scores_df['R²_rank'] = scores_df['R²'].rank(ascending=False)
    scores_df['Total_Rank'] = scores_df[[c for c in scores_df.columns if '_rank' in c]].sum(axis=1)
    scores_df = scores_df.sort_values('Total_Rank')
    best_model_name = scores_df.iloc[0]['Model']

    st.subheader("🏆 Model Performance (Last 60 Business Days)")
    display_cols = ['MAE','RMSE','MAPE (%)','R²','Forecast Accuracy (%)']
    st.dataframe(scores_df.set_index('Model')[display_cols].style.format({
        'MAE':'{:.2f}','RMSE':'{:.2f}','MAPE (%)':'{:.2f}','R²':'{:.3f}','Forecast Accuracy (%)':'{:.2f}%'
    }).highlight_min(axis=0, subset=['MAE','RMSE','MAPE (%)'], color='#FF1493').highlight_max(axis=0, subset=['R²','Forecast Accuracy (%)'], color='#FF1493'))

    st.success(f"✅ Based on key metrics, *{best_model_name}* is the most consistent model.")
else:
    st.warning("⚠ Could not evaluate model performance. Insufficient historical data?")


# ------------------ COMBINED SIGNAL ------------------
def generate_combined_signal(df_model, forecasts_all, ticker, forecast_days):
    """Gemini forecast first, fallback to robust local ensemble"""

    # ---------------- Gemini Forecast ----------------
    recent = df_model.tail(90)[['ds', 'y']] \
        .rename(columns={'ds': 'Date', 'y': 'Close'}) \
        .to_csv(index=False)

    gemini_response = get_gemini_forecast(ticker, recent, forecast_days)
    reasoning, gemini_conf, forecast_df = parse_gemini_response(gemini_response)

    latest_price = df_model['y'].iloc[-1]

    # ================= GEMINI PATH =================
    if not forecast_df.empty:
        predicted_price = forecast_df['Forecasted Close Price'].iloc[-1]
        pct_change = (predicted_price - latest_price) / latest_price * 100

        if pct_change > 2:
            signal = "BUY"
        elif pct_change < -2:
            signal = "SELL"
        else:
            signal = "HOLD"

        confidence = normalize_gemini_confidence(gemini_conf)

        reasoning = (
            f"Latest Price: {latest_price:.2f}\n"
            f"Gemini Forecast Price: {predicted_price:.2f}\n"
            f"Expected Change: {pct_change:.2f}%\n"
            f"Model Confidence: {confidence_label(confidence)}"
        )

        return signal, reasoning, confidence, forecast_df

    # ================= FALLBACK ENSEMBLE =================
    model_weights = {"ARIMA": 0.2, "SARIMA": 0.2, "Prophet": 0.3, "LSTM": 0.3}
    weighted_changes = []
    model_directions = []

    for i, fdf in enumerate(forecasts_all):
        try:
            change_pct = (fdf['y'].iloc[-1] - latest_price) / latest_price * 100
        except Exception:
            change_pct = 0

        model_name = list(model_weights.keys())[i]
        weighted_changes.append(change_pct * model_weights[model_name])
        model_directions.append(np.sign(change_pct))

    avg_change = np.sum(weighted_changes)
    recent_volatility = (
        df_model['y'].pct_change()
        .rolling(20)
        .std()
        .iloc[-1] * 100
    )

    # --------- Robust Confidence Calculation ----------
    agreement_ratio = abs(np.mean(model_directions))            # 0 → 1
    strength_score = min(abs(avg_change) / 5, 1)               # capped
    volatility_penalty = min(recent_volatility / 5, 1)         # capped

    confidence = (
        0.4 * agreement_ratio +
        0.4 * strength_score +
        0.2 * (1 - volatility_penalty)
    ) * 100

    confidence = round(confidence, 1)

    # --------- Signal Decision ----------
    if avg_change > 2:
        signal = "BUY"
    elif avg_change < -2:
        signal = "SELL"
    else:
        signal = "HOLD"

    reasoning = (
        f"Latest Price: {latest_price:.2f}\n"
        f"Weighted Forecast Change: {avg_change:.2f}%\n"
        f"Model Agreement: {agreement_ratio:.2f}\n"
        f"Recent Volatility: {recent_volatility:.2f}%\n"
        f"Confidence Level: {confidence_label(confidence)}"
    )

    return signal, reasoning, confidence, pd.DataFrame()
def normalize_gemini_confidence(conf):
    """Convert Gemini confidence text to numeric percentage"""
    mapping = {
        "High": 80,
        "Medium": 60,
        "Low": 40
    }
    return mapping.get(str(conf).capitalize(), 50)


def confidence_label(conf):
    """Convert numeric confidence to label"""
    if conf >= 75:
        return "High"
    elif conf >= 55:
        return "Medium"
    else:
        return "Low"


# ------------------ COMBINED SIGNAL DISPLAY ------------------
signal, reasoning, confidence, forecast_df = generate_combined_signal(df_model, forecasts_all, ticker, forecast_days)

# Store for AI Agent
st.session_state.forecast_results = {
    "ticker": ticker,
    "current_price": df_model['y'].iloc[-1],
    "signal": signal,
    "confidence": confidence,
    "reasoning": reasoning,
    "forecast": forecast_df.to_dict() if not forecast_df.empty else None,
    "metrics": scores_df.to_dict() if scores else None,
    "rsi": df_full['RSI'].iloc[-1],
    "macd": df_full['MACD'].iloc[-1]
}

col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("🧭 AI Trading Suggestion")
    st.markdown(f"**Signal:** {signal}")
    st.markdown(f"**Confidence:** {confidence}% ({confidence_label(confidence)})")
    st.info(reasoning)

    if not forecast_df.empty:
        st.subheader("📋 Gemini Forecast Table")
        st.dataframe(forecast_df, use_container_width=True)

# ------------------ ALERT SYSTEM ------------------
st.sidebar.markdown("---")
st.sidebar.subheader("🔔 Automated Alerts")

with st.sidebar.expander("➕ Set New Alert"):
    alert_type = st.selectbox("Trigger Type", ["Price Above", "Price Below", "Percentage Increase", "Percentage Decrease"])
    value = st.number_input("Value", min_value=0.0, value=10.0)
    if st.button("Create Alert"):
        st.session_state.alerts.append({
            "ticker": ticker,
            "type": alert_type,
            "value": value,
            "ref_price": st.session_state.forecast_results["current_price"],
            "triggered": False
        })
        st.success("Alert set!")

if st.session_state.alerts:
    for i, alert in enumerate(st.session_state.alerts):
        curr_price = st.session_state.forecast_results["current_price"]
        triggered = False
        
        if alert["type"] == "Price Above" and curr_price > alert["value"]: triggered = True
        elif alert["type"] == "Price Below" and curr_price < alert["value"]: triggered = True
        elif alert["type"] == "Percentage Increase":
            if (curr_price - alert["ref_price"]) / alert["ref_price"] * 100 >= alert["value"]: triggered = True
        elif alert["type"] == "Percentage Decrease":
            if (alert["ref_price"] - curr_price) / alert["ref_price"] * 100 >= alert["value"]: triggered = True
        
        status = "🔴 TRIGGERED" if triggered else "🟢 Active"
        st.sidebar.write(f"{alert['type']} {alert['value']}: {status}")
        if st.sidebar.button(f"Delete", key=f"del_{i}"):
            st.session_state.alerts.pop(i)
            st.rerun()

# ------------------ AI ANALYST CHAT ------------------
with col2:
    st.subheader("🤖 AI Stock Analyst")
    chat_container = st.container(height=500)
    
    for msg in st.session_state.messages:
        chat_container.chat_message(msg["role"]).write(msg["content"])

    if prompt := st.chat_input("Ask about Swiggy or set a strategy..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        chat_container.chat_message("user").write(prompt)
        
        # Agent Logic
        context = f"""
        User Query: {prompt}
        Current Market Data for {ticker}:
        - Price: {st.session_state.forecast_results['current_price']:.2f}
        - Signal: {signal}
        - RSI: {st.session_state.forecast_results['rsi']:.2f}
        - MACD: {st.session_state.forecast_results['macd']:.2f}
        - Models Summary: {reasoning}
        - Active Alerts: {st.session_state.alerts}
        """
        
        system_prompt = "You are a pro-level stock analyst. Use the provided market data to give expert advice. Be concise, strategic, and professional."
        
        try:
            full_prompt = f"{system_prompt}\n\nContext:\n{context}\n\nUser Question: {prompt}"
            response = model.generate_content(full_prompt)
            ai_msg = response.text
            st.session_state.messages.append({"role": "assistant", "content": ai_msg})
            chat_container.chat_message("assistant").write(ai_msg)
        except Exception as e:
            st.error(f"Agent Error: {e}")

# ------------------ DISCLAIMER ------------------
st.markdown("""
---
⚠ *Disclaimer:*  
This tool provides data-driven analysis and predictions using statistical and deep learning models.  
It is *not financial advice*. Always do your own research or consult a qualified advisor before making investment decisions.
""")
