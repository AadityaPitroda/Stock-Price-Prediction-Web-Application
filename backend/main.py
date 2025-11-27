from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
from keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
MODEL_PATH = 'model/Stock Predictions Model.keras'
if os.path.exists(MODEL_PATH):
    model = load_model(MODEL_PATH)
else:
    model = None

@app.get("/")
def home():
    return {"message": "Stock Prediction API is running"}

@app.get("/api/stock/{symbol}")
async def get_stock_data(symbol: str):
    try:
        # 1. Fetch Data
        start = '2015-01-01'
        end = '2025-12-31'
        data = yf.download(symbol, start=start, end=end)
        
        if data.empty:
            raise HTTPException(status_code=404, detail="Stock symbol not found")

        # 2. Fix Data Structure
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
            
        close_df = data[['Close']].copy()

        # 3. Calculate Moving Averages
        data['MA50'] = data['Close'].rolling(50).mean()
        data['MA100'] = data['Close'].rolling(100).mean()
        data['MA200'] = data['Close'].rolling(200).mean()

        # 4. Prepare Response Data (Historical)
        data.reset_index(inplace=True)
        data.fillna(0, inplace=True)
        data['DateStr'] = data['Date'].dt.strftime('%Y-%m-%d')

        chart_data = []
        for index, row in data.iterrows():
            chart_data.append({
                "date": row['DateStr'],
                "price": row['Close'],
                "ma50": row['MA50'] if row['MA50'] != 0 else None,
                "ma100": row['MA100'] if row['MA100'] != 0 else None,
                "ma200": row['MA200'] if row['MA200'] != 0 else None,
            })

        # 5. Prepare Prediction Data
        split_idx = int(len(close_df) * 0.80)
        data_train = close_df.iloc[:split_idx]
        data_test = close_df.iloc[split_idx:]
        
        scaler = MinMaxScaler(feature_range=(0, 1))
        
        past_100_days = data_train.tail(100)
        final_df = pd.concat([past_100_days, data_test], ignore_index=True)
        
        final_df.columns = final_df.columns.astype(str)
        input_data = scaler.fit_transform(final_df)

        x_test = []
        y_test = []

        for i in range(100, input_data.shape[0]):
            x_test.append(input_data[i-100:i])
            y_test.append(input_data[i, 0])

        x_test, y_test = np.array(x_test), np.array(y_test)

        prediction_data = []
        
        if model and len(x_test) > 0:
            y_predicted = model.predict(x_test)
            
            # --- CORRECTION: Use inverse_transform instead of manual math ---
            # Reshape y_test to (N,1) so inverse_transform works on it too
            y_predicted_original = scaler.inverse_transform(y_predicted)
            y_test_original = scaler.inverse_transform(y_test.reshape(-1, 1))

            test_dates = data['DateStr'].tail(len(y_test)).values
            
            for i in range(len(y_test)):
                prediction_data.append({
                    "date": test_dates[i],
                    "original": float(y_test_original[i][0]),
                    "predicted": float(y_predicted_original[i][0])
                })

        return {
            "symbol": symbol.upper(),
            "history": chart_data,
            "predictions": prediction_data,
            "current_price": float(chart_data[-1]['price'])
        }

    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))