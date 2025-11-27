import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line
} from 'recharts';

const StockChart = ({ data }) => {
  const [showMA50, setShowMA50] = useState(false);
  const [showMA100, setShowMA100] = useState(false);
  const [showMA200, setShowMA200] = useState(false);

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Market Trends</h2>
        <div className="flex gap-2">
            {/* Toggles for Moving Averages */}
            {[
                { label: 'MA 50', state: showMA50, setter: setShowMA50, color: '#ef4444' },
                { label: 'MA 100', state: showMA100, setter: setShowMA100, color: '#3b82f6' },
                { label: 'MA 200', state: showMA200, setter: setShowMA200, color: '#10b981' }
            ].map((btn) => (
                <button
                    key={btn.label}
                    onClick={() => btn.setter(!btn.state)}
                    className={`px-3 py-1 text-sm rounded-full transition-all ${
                        btn.state 
                        ? 'bg-slate-200 text-slate-900 font-bold' 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                >
                    {btn.label}
                </button>
            ))}
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
            <YAxis stroke="#94a3b8" domain={['auto', 'auto']} tick={{fontSize: 12}} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0' }}
            />
            <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                name="Close Price"
            />
            {showMA50 && <Line type="monotone" dataKey="ma50" stroke="#ef4444" dot={false} strokeWidth={2} />}
            {showMA100 && <Line type="monotone" dataKey="ma100" stroke="#3b82f6" dot={false} strokeWidth={2} />}
            {showMA200 && <Line type="monotone" dataKey="ma200" stroke="#10b981" dot={false} strokeWidth={2} />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;