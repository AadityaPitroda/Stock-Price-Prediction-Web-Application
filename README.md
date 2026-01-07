+----------------+          HTTPS/HTTP           +----------------------+
|                |  GET / (UI) + GET /api/stock  |                      |
|   Browser /    | ----------------------------> |   Frontend (React)   |
|   User UI      |                               |   (Vite + Tailwind)  |
|                | <---------------------------- |  (charts + controls)  |
+----------------+          JSON (history, preds)+----------------------+
                                                      |
                                                      | GET {API_URL}/api/stock/{symbol}
                                                      v
                                            +-------------------------------+
                                            | Backend (FastAPI, Python)     |
                                            | - CORS open                   |
                                            | - yfinance data fetch         |
                                            | - pandas preprocessing        |
                                            | - MinMaxScaler (sklearn)      |
                                            | - LSTM model.predict (Keras)  |
                                            +-------------------------------+
                                                      |
                                                      | reads
                                                      v
                                           +-------------------------------+
                                           | Model Artifact (local file)   |
                                           | backend/model/Stock Predictions|
                                           | Model.keras (Keras HDF5/TF)   |
                                           +-------------------------------+
                                                      |
                                                      | External data source (HTTP)
                                                      v
                                               +-----------------+
                                               | Yahoo Finance   |
                                               | (yfinance client)|
                                               +-----------------+
