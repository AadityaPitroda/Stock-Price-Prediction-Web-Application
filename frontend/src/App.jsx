import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import StockChart from './components/StockChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function App() {
  const [ticker, setTicker] = useState('GOOG');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // FIX 1: Use the Environment Variable provided by Vercel
  // If running locally, it falls back to localhost.
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // FIX 2: Use the dynamic API_URL instead of hardcoded localhost
      const response = await axios.get(`${API_URL}/api/stock/${ticker}`);
      setData(response.data);
    } catch (err) {
      console.error("Fetch error:", err); // Log the actual error for debugging
      setError('Failed to fetch data. Please check the symbol.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                StockAI Predictor
              </h1>
              <p className="text-slate-400 text-sm">Deep Learning Market Analysis</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              {/* FIX 3: Added id and name to fix the browser warning */}
              <input
                id="ticker-input"
                name="ticker"
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Enter Symbol (e.g., TSLA)"
                className="bg-slate-800 border border-slate-700 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              />
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </header>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Main Content */}
        {data && !loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Stats Card */}
            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                 <p className="text-slate-400 text-sm">Current Price</p>
                 <h3 className="text-4xl font-bold text-white mt-1">
                   ${data.current_price.toFixed(2)}
                 </h3>
               </div>
               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                 <p className="text-slate-400 text-sm">Analysis Period</p>
                 <h3 className="text-xl font-bold text-white mt-1">2012 - 2023</h3>
               </div>
               <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
                 <Activity className="w-10 h-10 text-emerald-400" />
                 <div>
                    <p className="text-slate-400 text-sm">Model Status</p>
                    <p className="text-emerald-400 font-bold">LSTM Active</p>
                 </div>
               </div>
            </div>

            {/* Historical Chart */}
            <div className="col-span-1 lg:col-span-2 space-y-8">
              <StockChart data={data.history} />
            </div>

            {/* AI Prediction Chart */}
            <div className="col-span-1 lg:col-span-1">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                  AI Prediction vs Original
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Comparison of the AI model's prediction against actual market movement for the test period.
                </p>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.predictions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" hide />
                      <YAxis stroke="#94a3b8" domain={['auto', 'auto']} tick={{fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="original" 
                        stroke="#ef4444" 
                        dot={false} 
                        name="Actual"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#10b981" 
                        dot={false} 
                        name="AI Predicted"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-slate-800 rounded-xl"></div>
            <div className="h-96 bg-slate-800 rounded-xl"></div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default App;