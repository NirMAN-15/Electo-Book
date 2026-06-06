import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { time: 'Mon', power: 45, cost: 2250 },
  { time: 'Tue', power: 52, cost: 2600 },
  { time: 'Wed', power: 38, cost: 1900 },
  { time: 'Thu', power: 65, cost: 3250 },
  { time: 'Fri', power: 48, cost: 2400 },
  { time: 'Sat', power: 75, cost: 3750 },
  { time: 'Sun', power: 82, cost: 4100 },
];

export const UsageGraphs: React.FC = () => {
  const [metric, setMetric] = useState<'power' | 'cost'>('power');
  const [range, setRange] = useState('weekly');

  return (
    <div>
      <h1 className="mb-6">Usage Analytics</h1>

      <div className="card mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button className={`btn ${metric === 'power' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMetric('power')}>Power (kWh)</button>
            <button className={`btn ${metric === 'cost' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMetric('cost')}>Cost (Rs)</button>
          </div>
          <div className="flex gap-2 bg-tertiary p-1 rounded-md border border-color">
            {['Daily', 'Weekly', 'Monthly'].map(r => (
              <button 
                key={r}
                className={`px-3 py-1 text-sm rounded ${range === r.toLowerCase() ? 'bg-secondary text-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
                onClick={() => setRange(r.toLowerCase())}
                style={{
                  backgroundColor: range === r.toLowerCase() ? 'var(--bg-secondary)' : 'transparent',
                  color: range === r.toLowerCase() ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric === 'power' ? "var(--accent-primary)" : "var(--warning)"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={metric === 'power' ? "var(--accent-primary)" : "var(--warning)"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                itemStyle={{ color: metric === 'power' ? 'var(--accent-primary)' : 'var(--warning)', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey={metric} 
                stroke={metric === 'power' ? "var(--accent-primary)" : "var(--warning)"} 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#graphGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-color-light">
          <div className="text-center">
            <p className="text-sm text-secondary">Total {metric === 'power' ? 'Consumption' : 'Cost'}</p>
            <p className="text-2xl font-bold mt-1">{metric === 'power' ? '405 kWh' : 'Rs. 20,250'}</p>
          </div>
          <div className="text-center border-l border-r border-color-light">
            <p className="text-sm text-secondary">Daily Average</p>
            <p className="text-2xl font-bold mt-1">{metric === 'power' ? '57.8 kWh' : 'Rs. 2,892'}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-secondary">Peak Day (Sun)</p>
            <p className="text-2xl font-bold mt-1 text-danger">{metric === 'power' ? '82 kWh' : 'Rs. 4,100'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
